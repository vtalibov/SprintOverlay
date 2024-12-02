FROM python:3.12-slim

WORKDIR /app

COPY ./app /app
COPY requirements.txt /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "--bind", "0.0.0.0:80", "app:app"]

EXPOSE 80
