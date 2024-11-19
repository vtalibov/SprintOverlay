# NGL Overlay, development

## Development container(s)

Development containers mirror production system. There are three containers with source
code directories mounted from the host system.

* Follow the official Docker Engine installation instructions [here](https://docs.docker.com/engine/install/).
Do not install Docker and its components from default repos of your distro!
* In `.env`, define corresponding variables with correct paths
* Launch containers with `sudo docker-compose up`.

NGL Overlay will be accessible on `localhost:8000`. You can edit the code in the mounted directories.

## Start without docker 

Not recommended, though SSDB can be started as a flask debug server (`python app.py`). Likewise,
start SprintOverlay as a simple Python HTTP server with eased security settings (no CORS),
`public/httpserver-cors.py`.

Since no reverse proxy server is used then, change address of SSDB to some form of 
`localhost:port` (port 5000 is used by default), `apiBaseURL` in `/sprintoverlay/public/js/overlay-panel.js`.