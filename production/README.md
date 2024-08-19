# NGL Overlay

## Deployment

### Shortcut

`pipeline.sh` performs synchronization of the selected files between development
and production versions, and builds Docker images. Image tag corresponds to the
last commit tag for the corresponding program. 

After synchronization, change the value of `ssdbAPI` in
`SprintOverlay/public/js/config.json` from `":5000"` to `"/api"`.

### Preparations & initial database

On a host machine, install `docker`, `docker-compose`, `sqlite3`.

In the applicable directory, create the database:

```bash
sqlite3 my_database.db
```

and populate a table (e.g., `my_table`) in it:

```sql
CREATE TABLE IF NOT EXISTS my_table (
    id INTEGER PRIMARY KEY,
    Project TEXT,
    Protein TEXT,
    XtalSystem TEXT,
    Series TEXT,
    SMILES TEXT,
    Ligand TEXT,
    Comment TEXT,
    PathToStructure TEXT
    PathToLigand TEXT
);
```

### Docker images

In `production` (root directory), modify `.env` accordingly:

- Correct image tags for the respective services (by default, populated with `pipeline.sh`)
- Specify correct mount points for `public/pdb` folder of NGLoverlay,
  `/database` folder of SSDB and path to `nginx.conf`.

Start with `docker-compose` or `docker compose`.

### Usage

NGL Overlay is accessible in a local network via host IP:

```bash
hostname -I
```

You may bind port 80 of the `ssdb-prod` service to access rudiments of SSDB
interface. However, to transact the database better to use a dedicated program.
