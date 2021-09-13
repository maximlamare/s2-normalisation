from s2brdf.kernels import calc_kgeo, calc_kvol


# from table 1 in Roy et al 2017
BRDF_PARAMS = {
    'f_iso': {
        'B02': 0.0774,
        'B03': 0.1306,
        'B04': 0.1690,
        'B08': 0.3093,
        'B11': 0.3430,
        'B12': 0.2658,
    },
    'f_geo': {
        'B02': 0.0079,
        'B03': 0.0178,
        'B04': 0.0227,
        'B08': 0.0330,
        'B11': 0.0453,
        'B12': 0.0387,
    },
    'f_vol': {
        'B02': 0.0372,
        'B03': 0.0580,
        'B04': 0.0574,
        'B08': 0.1535,
        'B11': 0.1154,
        'B12': 0.0639,
    },
}


def calc_rho_modis(sza, vza, saa, vaa, f_iso, f_geo, f_vol):
    "Eq. 6 in Roy et al 2017, Eq. 37 in Lucht et al 2000"
    rho_modis = f_iso + f_vol * calc_kvol(sza, vza, saa, vaa) + f_geo * calc_kgeo(sza, vza, saa, vaa)

    return rho_modis


def calc_c_lambda(sza, vza, saa, vaa, band):
    """Part 2 of Eq. 5 in Roy et al 2017"""
    f_kwargs = {
        'f_iso': BRDF_PARAMS['f_iso'][band],
        'f_geo': BRDF_PARAMS['f_geo'][band],
        'f_vol': BRDF_PARAMS['f_vol'][band],
    }

    # TODO: figure out "average solar zenith of the pair of forward and backward scattering observations" 
    c_lambda = calc_rho_modis(sza, 0, saa, vaa, **f_kwargs) / \
        calc_rho_modis(sza, vza, saa, vaa, **f_kwargs)

    return c_lambda


def calc_nbar(r_s2, band, sza, vza, saa, vaa):
    """Part 1 of Eq. 5 in Roy et al 2017"""
    c_lambda = calc_c_lambda(sza, vza, saa, vaa, band)
    nbar = c_lambda * r_s2

    return nbar
