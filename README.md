# NGL Overlay

A naive front-end and control panel for embedded
[NGL](https://github.com/nglviewer/) that aims to mimic AstexViewer and
AstexOverlay interface.

Of note, this is a personal project that comes in handy while better
alternatives are being sought.

<img src="https://raw.githubusercontent.com/vtalibov/SprintOverlay/main/screenshot.png" width="600"/>


## Why?

AstexViewer
([openastexviewer](https://github.com/openastexviewer/openastexviewer)) uses
legacy technology stack and is deprecated. Yet, it is a good simple tool for
MedChem teams.

Good papers are:

* Hartshorn, M. J. AstexViewer: A Visualisation Aid for Structure-Based Drug
  Design. *J. Comput. Aided Mol. Des. 2002, 16 (12), 871–881.*
  https://doi.org/10.1023/a:1023813504011.
* Davies, T. G.; Tickle, I. J. Fragment Screening Using X-Ray Crystallography.
  *Fragment-Based Drug Discovery and X-Ray Crystallography. 33–59.*
  https://doi.org/10.1007/128_2011_179
* Rose, A. S.; Hildebrand, P. W. NGL Viewer: A Web Application for Molecular
  Visualization. *Nucleic Acids Res. 2015, 43 (W1), W576-9.*
  https://doi.org/10.1093/nar/gkv402.

## How does it work

Paths to structures and structure-related information (e.g., crystal system,
series, target) are stored in an SQLite3 database. The SSDB interacts with the
database to handle requests from NGL Overlay.

The viewer works with both combined and split structures. If the structure is
combined, atoms of interest (e.g., ligands) should have the residue name `INH`.
There may be issues with structures that have multiple models.

To correctly represent intermolecular contacts, the connectivity in structural
files must be curated. This includes multiple `CONECT` records for double/triple
bonds, links for covalent inhibitors, defined tautomers for certain aromatic
rings, etc. For split structures, for ligands it is recommended to use `sdf`
files.

### Development

See `development/` and `SSDB/`, either via development container or with a
Python HTTP server (`httpserver-cors.py` in `development/public`).

### Deployment

With a docker stack, see `production/`.
