# s2-normalisation
Normalisation of Sentinel-2 BRDF for Sentinel Hub.

## Introduction

The idea of implementing a BRDF normalisation for Sentinel-2 scenes in [Sentinel Hub](https://www.sentinel-hub.com/) was sparked by a [forum post](https://forum.sentinel-hub.com/t/improving-cloudless-mosaic-continuity-across-orbits/3290) that was published around the same time that  Sentinel Hub wrote a [medium blog post](https://medium.com/sentinel-hub/how-to-make-the-perfect-time-lapse-of-the-earth-351f214527f6) on how to create global mosaics. At the time I got several questions about the "striping effects" due to surface reflectance anisotropy and started looking into solutions to normalise the reflectance (*note*: at small scales it often doesn't matter).

It turns out that implementing a solution that is valid for all types of surfaces isn't that easy. Not wanting to re-invent the wheel, the obvious solution is to take an acceptable solution from the scientific literature and implement it as an [Evalscript](https://docs.sentinel-hub.com/api/latest/evalscript/).



## Theory

A suitable approach that seems to work for most surfaces is the "semi-empirical BRDF normalisation c-factor correction approach proposed by *Luch et al. 2000* (see **papers** folder). The formula is detailed in eq. 37 (using eq. 38 & 39) . But to avoid lookup tables and other complex modelling approaches, we can use the fixed BRDF spectral model parameters derived from "*the global year of highest quality snow-free MODIS BRDF product*" conveniently defined for Sentinel-2 in *Roy et al. 2017* that were derived from the Landsat ones in *Roy et al. 2016*. 



## Repository organisation

**javascript** contains all the javascript code, later to be implemented in an Evalscript.

**notebooks** contains the functions tested against the graphs from the papers used to develop the algorithm.

**papers** contains the relevant scientific articles.

**s2brdf** contains a python package implementation of the algorithms.


## s2brdf

`s2brdf` is a python implementation of the BRDF normalisation process. Code for the volumetric scattering and geometric-optical model kernels can be found in [`kernels.py`](s2brdf/kernels.py).

### Installation
1. Create a virtual environment (optional)
```bash
mkvirtualenv s2brdf
```

2. Install using `pip`
```bash
pip install -e .
```

### Testing
Each python source file has a corresponding test file in the [`tests`](tests) directory. The unit tests are set up using `pytest` (install with `pip install pytest`). To run all of the unit tests:
```bash
pytest
```

## Status

- [x]  Write the code for computing LiSparse (*k_geo*)
- [ ] Write the code (and test) for computing RossThick (*k_vol*)
- [ ] Normalise reflectance with coefficients from the litterature
- [ ] Put it all together in an Evalscript





