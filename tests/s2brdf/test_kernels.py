from s2brdf.kernels import (
    deg2rad,
    rad2deg,
    relative_azimuth,
    sec,
    calc_cos_xi,
    calc_kgeo,
    calc_kvol
)

import numpy as np
import pytest


def test_deg2rad():
    assert deg2rad(180) == np.pi


def test_rad2deg():
    assert rad2deg(np.pi / 2) == 90


def test_sec():
    assert sec(np.pi) == -1


def test_relative_azimuth():
    # saa == 120 degrees, vaa == 275 degrees
    assert relative_azimuth(saa=2 * np.pi / 3, vaa=3 * np.pi / 2) == pytest.approx(np.pi / 6)
    assert relative_azimuth(saa=np.pi / 2, vaa=3 * np.pi / 2) == 0.0


def test_calc_cos_xi():
    # saa == 90 degrees, vaa == 275 degrees, relative azimuth
    assert calc_cos_xi(np.pi / 2, 3 * np.pi / 2, 0) == -1.0


def test_calc_kgeo():
    SZA = deg2rad(45)
    SAA = deg2rad(180)
    VAA = deg2rad(0)
    assert calc_kgeo(SZA, deg2rad(0), SAA, VAA) == pytest.approx(-1.1068191757647372)
    assert calc_kgeo(SZA, deg2rad(50), SAA, VAA) == pytest.approx(0.4675029273554563)
