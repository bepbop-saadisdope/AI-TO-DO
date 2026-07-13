# FastAPI backend image.
FROM python:3.12-slim

WORKDIR /app

# Install deps first so this layer caches unless requirements change.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code (overridden by a bind mount in docker-compose for hot-reload).
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
