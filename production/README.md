# NGL Overlay

NGL Overlay is a simple GUI for NGL, aiming to mimic the interface and functions
of Astex Viewer and Astex Overlay. NGLoverlay consists of two programs - the
**NGLoverlay** webapp, which provides viewer functionality and access to overlay
for the selected structures, and **SSDB** - the Simple Structure Database. SSDB
is a webapp that allows basic transactions with SQLite3 database file containing
structure-related information. SSDB serves as a back-end for
NGL Overlay interactions with this database.

## Architecture

The application runs on a host machine as two Docker containers. Both containers
are exposed to the host network interface.

**NGL Overlay** is a static JS application, deployed in the container via nginx.
It has read-only external access to a folder on the host. This folder contains
structure files, with their paths relative to `./pdb` defined in the database
file.

**SSDB** is served using the Gunicorn server. Its container has an access to a host
folder that contains the database. SSDB utilizes `sqlite3` module to
interact with SQLite3 database.

NGL Overlay interacts with SSDB via AJAX requests towards Flask endpoints.
It retrieves a list of projects, defined in the database, and upon selection of
a project, retrieves the corresponding structures to the overlay panel,
clustered by ligand series.

## Deployment

### Shortcut

`pipeline.sh` performs synchronization of the selected files between development
and production versions, and builds Docker images. Image tag corresponds to the
last commit tag for the corresponding program. 

### Preparations & initial database

On a host machine, install `docker`, `docker-compose`, `sqlite3`. E.g., on Ubuntu/Debian:

```bash
sudo apt install docker.io docker-compose sqlite3
```

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

- Specify correct image names for the respective services
- Specify correct mount points for `./pdb` folder of NGLoverlay and `./database` folder of SSDB

In the folder with `docker-compose.yml`, start the containers with `docker-compose` (`-d` to detach it):

```bash
sudo docker-composer up -d
```

You can always check if the applications are up and running:

```bash
curl localhost:80 # NGLoverlay
curl localhost:5000 # SSDB
```

### Usage

NGL Overlay is accessible in a local network via host IP:

```bash
hostname -I
```

Use port `:5000` to access SSDB web interface.