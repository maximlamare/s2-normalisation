from codecs import open as codecs_open

from setuptools import setup, find_packages


# https://pip.pypa.io/en/stable/reference/pip_install/#requirements-file-format
def parse_requirements(filename='requirements/requirements.txt'):
    with open(filename, 'r') as f:
        reqs = (r.strip() for r in f.readlines())
        # Ignore pip options and whole-line comments
        reqs = (r for r in reqs if not r.startswith('-') and not r.startswith('#'))
        # Ignore pip markers
        reqs = (r.split(';', 1)[0].rstrip() for r in reqs)
        # Ignore inline comments
        reqs = (r.split('#', 1)[0].rstrip() for r in reqs)
        return list(reqs)


# Get the long description from the relevant file
with codecs_open('README.md', encoding='utf-8') as src:
    long_description = src.read()

setup(
    name='s2brdf',
    version='0.0.1',
    description="Implement bidirectional reflectance distribution function corrections for Sentinel 2",
    long_description=long_description,
    classifiers=[],
    keywords='',
    author="Maxim Lamare and Henry Rodman",
    author_email='henry@ncx.com',
    url='https://github.com/maximlamare/s2-normalisation',
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    include_package_data=True,
    package_data={'': ['data/*.csv']},
    zip_safe=False,
    install_requires=parse_requirements('requirements/requirements.txt'),
    python_requires='>=3.6',
    setup_requires=[],
)
