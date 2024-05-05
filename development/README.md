# NGL Overlay, development

## Development container

* Install Docker and Docker Compose tool
* Build image. The image contains just a nginx server (`sudo docker image -t imagename:tag .`).
* In `docker-compose.yml`, mount correct path to `/public` to
  `/usr/share/nginx/html` of the container
* Launch the container with `sudo docker-compose up`; add flag `-d` to detach it to background.

NGL Overlay would be accessible on `localhost:8080`.

Start also Python server for SSDB (`python ../SSDB/app.py`), it would be accessible from `localhost:5000`.

## Start without docker 

Change dir to `public` and start the app with a simple Python HTTP server with eased
security settings:

```
python httpserver-cors.py
```