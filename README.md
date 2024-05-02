# NGL Overlay

A naive front-end and control panel for embedded
[NGL](https://github.com/nglviewer/) that aims to mimic AstexViewer and
AstexOverlay interface.

Uses [NGL](https://github.com/nglviewer/ngl).

Of note, this is a personal project that comes in handy while better
alternatives are being sought.

<img src="https://raw.githubusercontent.com/vtalibov/SprintOverlay/main/screenshot.png" width="600"/>

## Why?

Astex Viewer ([openastexviewer](https://github.com/openastexviewer/openastexviewer)) uses
legacy technology stack and is, unfortunately, deprecated. Yet, it is a simple
and indispensable tool for MedChem teams.

If interested, good papers are:

* Hartshorn, M. J. AstexViewer: A Visualisation Aid for Structure-Based Drug
  Design. *J. Comput. Aided Mol. Des. 2002, 16 (12), 871–881.*
  https://doi.org/10.1023/a:1023813504011.

* Davies, T. G.; Tickle, I. J. Fragment Screening Using X-Ray Crystallography.
  In Fragment-Based Drug Discovery and X-Ray Crystallography; Davies, T. G.,
  Hyvönen, M., Eds.; *Springer Berlin Heidelberg: Berlin, Heidelberg, 2011; Vol.
  317, pp 33–59.*

* Rose, A. S.; Hildebrand, P. W. NGL Viewer: A Web Application for Molecular
  Visualization. *Nucleic Acids Res. 2015, 43 (W1), W576-9.*
  https://doi.org/10.1093/nar/gkv402.

## How does it work

Paths to structures and structure-related information (e.g., crystal system,
series, target) are stored in an SQLite3 database. The SSDB server interacts
with the database to handle fetch requests from NGL Overlay.

## Development

See `development/` and `SSDB/`, either via development container or with Python
HTTP server (`httpserver-cors.py` in `development/public`).

## Deployment

With a docker stack, see `production/`.
