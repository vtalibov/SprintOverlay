# NGL Overlay, development

## Development container

* Install Docker and Docker Compose tool (*e.g.*, on Ubuntu/Debian: `sudo apt install docker.io docker-composer`).
* Build image. The image just contains a nginx server (`sudo docker image -t imagename:tag .`).
* In `docker-compose.yml`, mount correct path of `./public` to
  `/usr/share/nginx/html` of the container. You probably want to add this file
  to `.gitignore`.
* Launch the container with `sudo docker-compose up`; add flag `-d` to detach it to background.

NGL Overlay would be accessible on `localhost:8080`.

Start also Python server for SSDB (`python ../SSDB/app.py`), it would be accessible from `localhost:5000`.

## Start without docker 

Change dir to `public` and start the app via simple Python HTTP server with eased
security settings:

```
python httpserver-cors.py
```