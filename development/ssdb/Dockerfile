FROM python:3.12-slim

WORKDIR /app

RUN mkdir logs
RUN mkdir database

COPY requirements.txt /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "--access-logfile", "logs/ssdb_access.log", "--error-logfile", "logs/ssdb_error.log", "--bind", "0.0.0.0:80", "app:app"]

EXPOSE 80