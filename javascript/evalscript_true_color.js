//VERSION=3

function setup() {
    return {
        input: ["B02", "B03", "B04", "sunAzimuthAngles", "sunZenithAngles", "viewAzimuthMean", "viewZenithMean"],
        output: { bands: 3 },
        mosaicking: "TILE"
    };
}
  
function evaluatePixel(sample) {
    for(let i=0; i<sample.length; i++){
        // Only calculate the BRDF for pixels where the 
        // view geometry is available (on the edges of tiles
        // reflectance is available but not view geometry)
        if(sample[i].viewAzimuthMean>1){
            var available = sample[i]
            var saa = deg2rad(available.sunAzimuthAngles);
            var sza = deg2rad(available.sunZenithAngles);
            var vaa = deg2rad(available.viewAzimuthMean);
            var vza = deg2rad(available.viewZenithMean);
            var bands = Object.keys(f_values);
            var lum = 2.5 // brightness of the image
            return bands.map(band => lum*calc_nbar(
                available[band], 
                f_values[band], 
                sza, vza, saa, vaa));
        }
    }
    return [0,0,0]
}

// Kernel Parameters (Roy et al. 2017, Table 1)
// [f_iso, f_geo, f_vol]
var f_values = {
    "B04": [0.1690,0.0227,0.0574], 
    "B03": [0.1306,0.0178,0.0580], 
    "B02": [0.0774,0.0079,0.0372]
}

function deg2rad(x){
    // Convert degrees to radians
    return x * Math.PI / 180;
}

function rad2deg(x){
    // Convert degrees to radians
    return x / Math.PI * 180;
}

function sec(x){
    // Calculate the secant of a value
    return 1 / Math.cos(x);
}

function relative_azimuth(saa, vaa){
    // Calculate relative azimuth angle
    // Angles in RAD !
    // return vaa - saa;
    var phi = Math.abs(saa - vaa)
    var diff = 0
    if (phi > Math.PI) {
        diff = 2 * Math.PI - phi;
    } else {
       diff = phi;
    }
    return diff;
}

function calc_kgeo(sza, vza, saa, vaa){
    // Calculate the LiSparse kernel from Lucht et al. 2000
    // Angles in RAD !

    // Relative azimuth
    var phi = relative_azimuth(vaa, saa)

    // theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
    var theta_prime = sza
    // vartheta_prime = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1
    var vartheta_prime =  vza

    //c 43 Lucht
    var cos_xi_prime = Math.cos(theta_prime) * Math.cos(vartheta_prime) + Math.sin(theta_prime) * Math.sin(vartheta_prime) * Math.cos(phi);

    // Calculate t, broken up for clarity
    // h / b = 2

    //c 42 Lucht
    var D = Math.sqrt(Math.pow(Math.tan(theta_prime), 2) + Math.pow(Math.tan(vartheta_prime), 2) - 2 * Math.tan(theta_prime) * Math.tan(vartheta_prime) * Math.cos(phi));
    var tantansin = Math.tan(theta_prime) * Math.tan(vartheta_prime) * Math.sin(phi);
    var costtop = Math.sqrt(Math.pow(D, 2) + Math.pow(tantansin, 2))

    //c 41 Lucht
    var cost = 2 * costtop / (sec(theta_prime) + sec(vartheta_prime))
    var t = Math.acos(Math.min(1, cost));

    // c 40 Lucht
    var O = (1 / Math.PI) * (t - Math.sin(t) * Math.cos(t)) * (sec(theta_prime) + sec(vartheta_prime));

    // Kgeo
    kgeo = O - sec(theta_prime) - sec(vartheta_prime) + 1 / 2 * (1 + cos_xi_prime) * sec(theta_prime) * sec(vartheta_prime);

    return kgeo;
}

function calc_cos_xi(theta, vartheta, phi){
    return Math.cos(theta) * Math.cos(vartheta) + Math.sin(theta) * Math.sin(vartheta) * Math.cos(phi);
}

function calc_kvol(sza, vza, saa, vaa){
    //Calculate the RossThick kernel (k_vol) from Lucht et al. 2000 equation 38
    // Angles in RAD !
    var phi = relative_azimuth(saa, vaa);

    // eq 44
    // theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
    var theta_prime = sza;

    // vartheta_prime = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1
    var vartheta = vza;

    var cos_xi = calc_cos_xi(theta_prime, vartheta, phi);
    var xi = Math.acos(cos_xi);

    var kvol = ((Math.PI / 2 - xi) * cos_xi + Math.sin(xi)) / (Math.cos(theta_prime) + Math.cos(vartheta)) - Math.PI / 4;

    return kvol;
}

function calc_rho_modis(sza, vza, saa, vaa, f){
    // Eq. 6 in Roy et al 2017, Eq. 37 in Lucht et al 2000
    var k_s = [1, calc_kgeo(sza, vza, saa, vaa), calc_kvol(sza, vza, saa, vaa)]
    var rho_modis = 0;
    for(var i=0; i<k_s.length; i++) {
        rho_modis += k_s[i]*f[i];
    }

    return rho_modis;
}

function calc_c_lambda(sza, vza, saa, vaa, f){
    // Part 2 of Eq. 5 in Roy et al 2017
    return calc_rho_modis(sza, 0, saa, vaa, f) / calc_rho_modis(sza, vza, saa, vaa, f);
}

function calc_nbar(r_s2, f, sza, vza, saa, vaa){
    //Part 1 of Eq. 5 in Roy et al 2017
    // r_s2: reflectance in band 
    // f: f values for band
    var c_lambda = calc_c_lambda(sza, vza, saa, vaa, f);
    return c_lambda * r_s2;
}
