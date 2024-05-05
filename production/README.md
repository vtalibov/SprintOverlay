# NGL Overlay

NGL Overlay is an implimentation of NGL, aiming to mimic the interface and
functions of AstexViewer and AstexOverlay. NGL Overlay consists of two programs
- the NGL Overlay webapp, which provides viewer functionality and access to
overlay page for the selected structures, and SSDB - the Simple Structure Database.
SSDB allows basic transactions with SQLite3 database file
containing structure-related information. SSDB serves as a back-end for NGL
Overlay interactions with this database.

## Deployment

### Shortcut

`pipeline.sh` performs synchronization of the selected files between development
and production versions, and builds Docker images. Image tag corresponds to the
last commit tag for the corresponding program. 

### Preparations & initial database

On a host machine, install `docker`, `docker-compose`, `sqlite3`.

In the applicable directory, create the database:

```bash
sqlite3 my_database.db
```

and populate a table in it:

```sql
CREATE TABLE IF NOT EXISTS my_table (
    id INTEGER PRIMARY KEY,
    Project TEXT,
    Protein TEXT,
    XtalSystem TEXT,
    Series TEXT,
    Ligand TEXT,
    Comment TEXT,
    PathToStructure TEXT
);
```

### Docker images

In `production` (root directory), modify `docker-compose.yml` accordingly:

- Specify correct image names for the respective services (by default, reads from `.env` file, populated with `pipeline.sh`)
- Specify correct mount points for `public/pdb` folder of NGLoverlay and `/database` folder of SSDB

Start with `docker-compose` or `docker compose`.

To check if the applications are up and running:

```bash
curl localhost:80 # NGLoverlay
curl localhost:5000 # SSDB
```

### Usage

NGL Overlay is accessible in a local network via host IP:

```bash
hostname -I
```

Use port `:5000` to access SSDB interface. However, better to use another program to transact the database.