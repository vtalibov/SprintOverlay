# SSDB - Sprint Structure DataBase

For each structure, a database entry is created. Each entry consists of:
* Project
* Target (protein)
* Crystallographic system
* Series ID
* Ligand ID
* Comment
* Path to the protein coordinates
* Path to the ligand, if split structures are used)

Due to some legacy reasons, paths are specified relative to the project folder,
*e.g.* for `Program-LSD1/NMR/apo-protein.pdb`, the entry is `NMR/apo-protein`.
NGL Overlay mounts projects parent directory, relative path concatenation occurs on the
client side.

## About the database

SSDB web interface allows some basic manipulations, but better to do it locally
with a dedicated tool. [DB Browser for
SQLite](https://github.com/sqlitebrowser/sqlitebrowser) works well.

## To start locally

Install the required packages, start with `app.py`.