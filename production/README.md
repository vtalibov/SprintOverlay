# NGL Overlay

## Deployment

### Shortcut

`pipeline.sh` performs synchronization of the selected files between development
and production versions, and builds Docker images. Image tag corresponds to the
last commit tag. 

After synchronization, change the value of `ssdbAPI` in
`SprintOverlay/public/js/config.json` from `":5000"` to `"/api"`.

### Docker & database

On a host machine, follow Docker Engine installation instructions [here](https://docs.docker.com/engine/install/). 

Create the database with `sqlite3`:

```bash
sqlite3 my_database.db
```

and then a table in it (*e.g.*, `my_table`):

```sql
CREATE TABLE IF NOT EXISTS my_table (
    id INTEGER PRIMARY KEY,
    Project TEXT,
    Protein TEXT,
    XtalSystem TEXT,
    Series TEXT,
    Ligand TEXT,
    Comment TEXT,
    PathToProtein TEXT,
    PathToLigand TEXT,
    SMILES TEXT
);
```

### Docker images

In `production` directory (root), modify `.env` accordingly:

- Correct image tags for the respective services (populated automatically with
  `pipeline.sh`)
- Specify mount points for `public/pdb` folder of NGLoverlay, `/database` folder
  of SSDB and path to `nginx.conf`.

### Use

```bash
sudo docker compose up -d
```

NGL Overlay is accessible in a local network via host IP:

```bash
hostname -I
```
