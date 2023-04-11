//VERSION=3

function setup() {
    return {
        input: ["B02", "B03", "B04", "sunAzimuthAngles", "sunZenithAngles", "viewAzimuthMean", "viewZenithMean"],
        output: { bands: 3 },
        mosaicking: "TILE"
    };
}

function evaluatePixel(sample) {
    for (let i = 0; i < sample.length; i++) {
        // Only calculate the BRDF for pixels where the 
        // view geometry is available (on the edges of tiles
        // reflectance is available but not view geometry)
        if (sample[i].viewAzimuthMean > 1) {
            let available = sample[i]
            let saa = deg2rad(available.sunAzimuthAngles);
            let sza = deg2rad(available.sunZenithAngles);
            let vaa = deg2rad(available.viewAzimuthMean);
            let vza = deg2rad(available.viewZenithMean);

            let constant = build_constants(sza, vza, saa, vaa);
            let c_vza_zero = build_constants(sza, 0, saa, vaa);
            let kernels = {
                kgeo: calc_kgeo(constant),
                kvol: calc_kvol(constant),
                kgeo_vza_zero: calc_kgeo(c_vza_zero),
                kvol_vza_zero: calc_kvol(c_vza_zero)
            }

            let bands = Object.keys(f_values);
            let lum = 2.5 // brightness of the image
            return bands.map(band => lum * calc_nbar(
                available[band],
                f_values[band],
                kernels));
        }
    }
    return [0, 0, 0]
}

// Kernel Parameters (Roy et al. 2017, Table 1)
// [f_iso, f_geo, f_vol]
var f_values = {
    "B04": [0.1690, 0.0227, 0.0574],
    "B03": [0.1306, 0.0178, 0.0580],
    "B02": [0.0774, 0.0079, 0.0372]
}

function build_constants(sza, vza, saa, vaa) {
    // calculates constants from viewing geometry that are often needed in the
    // calculations and are expensive to calculate (i.e. tan)
    const phi = relative_azimuth(saa, vaa);
    let c = {
        cos: {
            sza: Math.cos(sza),
            vza: Math.cos(vza),
            phi: Math.cos(phi),
        },
        sin: {
            sza: Math.sin(sza),
            vza: Math.sin(vza),
            phi: Math.sin(phi),
        },
        sec: {
            sza: sec(sza),
            vza: sec(vza),
        },
        tan: {}
    };
    c.tan.sza = c.sin.sza / c.cos.sza;
    c.tan.vza = c.sin.vza / c.cos.vza;
    //c 43 Lucht
    c.cos_xi = c.cos.sza * c.cos.vza + c.sin.sza * c.sin.vza * c.cos.phi;
    return c
}

function deg2rad(x) {
    // Convert degrees to radians
    return x * Math.PI / 180;
}

function sec(x) {
    // Calculate the secant of a value
    return 1 / Math.cos(x);
}

function relative_azimuth(saa, vaa) {
    // Calculate relative azimuth angle
    // Angles in RAD !
    let phi = Math.abs(saa - vaa)
    let diff = 0
    if (phi > Math.PI) {
        diff = 2 * Math.PI - phi;
    } else {
        diff = phi;
    }
    return diff;
}

function calc_kgeo(c) {
    // Calculate the LiSparse kernel from Lucht et al. 2000
    // Angles in RAD !

    // sza = theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
    // vza = lettheta_prime = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1

    //c 42 Lucht
    let Dsq = Math.pow(c.tan.sza, 2) + Math.pow(c.tan.vza, 2) - 2 * c.tan.sza * c.tan.vza * c.cos.phi;
    let tantansin = c.tan.sza * c.tan.vza * c.sin.phi;
    let costtop = Math.sqrt(Dsq + Math.pow(tantansin, 2))

    //c 41 Lucht
    let cost = 2 * costtop / (c.sec.sza + c.sec.vza)
    let t = Math.acos(Math.min(1, cost));

    // c 40 Lucht
    let big_o = (1 / Math.PI) * (t - Math.sin(t) * Math.cos(t)) * (c.sec.sza + c.sec.vza);

    // Kgeo
    let kgeo = big_o - c.sec.sza - c.sec.vza + 1 / 2 * (1 + c.cos_xi) * c.sec.sza * c.sec.vza;

    return kgeo;
}

function calc_kvol(c) {
    //Calculate the RossThick kernel (k_vol) from Lucht et al. 2000 equation 38
    // Angles in RAD !

    // eq 44
    // sza = theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
    // vza = lettheta = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1
    let xi = Math.acos(c.cos_xi);

    let kvol = ((Math.PI / 2 - xi) * c.cos_xi + Math.sin(xi)) / (c.cos.sza + c.cos.vza) - Math.PI / 4;

    return kvol;
}

function calc_rho_modis(kgeo, kvol, f) {
    // Eq. 6 in Roy et al 2017, Eq. 37 in Lucht et al 2000
    return f[0] + f[1] * kgeo + f[2] * kvol;
}

function calc_c_lambda(kernels, f) {
    // Part 2 of Eq. 5 in Roy et al 2017
    return calc_rho_modis(kernels.kgeo_vza_zero, kernels.kvol_vza_zero, f) / calc_rho_modis(kernels.kgeo, kernels.kvol, f);
}

function calc_nbar(r_s2, f, kernels) {
    //Part 1 of Eq. 5 in Roy et al 2017
    // r_s2: reflectance in band 
    // f: f values for band
    let c_lambda = calc_c_lambda(kernels, f);
    return c_lambda * r_s2;
}
