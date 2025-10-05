FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM python:3.11-slim AS backend

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
