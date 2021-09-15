from numpy import cos, sin, tan, pi, arccos, sqrt, minimum


def deg2rad(x):
    """Convert degrees to radians"""
    return x * pi / 180


def rad2deg(x):
    """Convert degrees to radians"""
    return x / pi * 180


def relative_azimuth(saa, vaa):
    """Calculate the relative azimuth angle between a SAA and VAA.
       In Radians."""
    return abs(vaa - saa)


def sec(x):
    return 1 / cos(x)


def calc_cos_xi(theta, vartheta, phi):
    return cos(theta) * cos(vartheta) + sin(theta) * sin(vartheta) * cos(phi)


def calc_kgeo(sza, vza, saa, vaa):
    """Calculate the LiSparse kernel (k_geo) from Lucht et al. 2000 equations 39-44"""
    # Angles in RAD !
    phi = relative_azimuth(saa, vaa) # azimuths here!

    # eq 44
    # theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
    theta = theta_prime = sza

    # vartheta_prime = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1
    vartheta = vartheta_prime = vza

    # eq. 43
    cos_xi_prime = calc_cos_xi(theta_prime, vartheta_prime, phi)

    # eq. 42
    D = sqrt(
        tan(theta_prime)**2 + tan(vartheta_prime)**2 - \
            2 * tan(theta_prime) * tan(vartheta_prime) * cos(phi)
    )

    # eq. 41 (h / b = 2)
    cos_t = 2 * sqrt(D**2 + (tan(theta_prime) * tan(vartheta_prime) * sin(phi))**2) / \
        (sec(theta_prime) + sec(vartheta_prime))
    
    t = arccos(minimum(1, cos_t))

    # eq. 40
    O = (1 / pi) * (t - sin(t) * cos(t)) * (sec(theta_prime) + sec(vartheta_prime))

    # eq. 39
    kgeo = O - sec(theta_prime) - sec(vartheta_prime) + \
        0.5 * (1 + cos_xi_prime) * sec(theta_prime) * sec(vartheta_prime)

    return kgeo


def calc_kvol(sza, vza, saa, vaa):
    """Calculate the RossThick kernel (k_geo) from Lucht et al. 2000 equation 38"""
    # Angles in RAD !
    phi = relative_azimuth(saa, vaa)

    # eq 44
    # theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
    theta = theta_prime = sza

    # vartheta_prime = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1
    vartheta = vartheta_prime = vza

    cos_xi = calc_cos_xi(theta, vartheta, phi)
    xi = arccos(cos_xi)

    kvol = ((pi / 2 - xi) * cos_xi + sin(xi)) / (cos(theta) + cos(vartheta)) - pi / 4

    return kvol
