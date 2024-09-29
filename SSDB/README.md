# SSDB 

NGL Overlay back end.

## Database

Data is fetched from SQLite3 database with `mytable` table, as follows:

|Column|Data type|Description|
|-|-|-|
|Project|TEXT||
|Series|TEXT|Series or other category within the project|
|Ligand|TEXT|Unique identifier of the structure, *e.g.* ligand name|
|PathToProtein|TEXT| (optional) path to the structure file|
|PathToLigand|TEXT| (optional) path to the structure file|
|SMILES|TEXT| (optional) SMILES notation for the ligand|

Due to legacy reasons, paths are specified relative to the project
folder, project directory names must match `Project` entries in the database.
NGL Overlay mounts parent directory of the projects, path concatenation occurs on
the client side.

Use a dedicated tool to populate/edit the database. [DB Browser for
SQLite](https://github.com/sqlitebrowser/sqlitebrowser) works well.

## To start locally

Install the required packages, start with `app.py`.