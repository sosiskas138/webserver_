# Konkurent Karton Server

Сервер для приема POST запросов и пересылки данных на внешний API.

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env` в корне проекта со следующим содержимым:

```
TARGET_SERVER_URL=http://your-target-server.com/api/endpoint
PORT=3000
```

## Запуск

```bash
npm start
```

Или для разработки с автоперезагрузкой:

```bash
npm run dev
```

## Docker

### Запуск

1) Создайте файл `.env` (если ещё не создан) и задайте там:

```
TARGET_SERVER_URL=http://your-target-server.com/api/endpoint
PORT=3000
```

2) Поднимите контейнеры:

```bash
docker compose up -d --build
```

Приложение будет доступно на **`http://localhost:<PORT>`** (порт берётся из `.env`).

### Проверка

- Health:

```bash
curl http://localhost:<PORT>/health
```

- Webhook:

```bash
curl -X POST http://localhost:<PORT>/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "vid": 432176649,
    "project": "Project name",
    "tag": "Tag name",
    "phone": "77777777777",
    "time": 1703781939
  }'
```

## API

### POST /api/webhook

Принимает данные в формате:

```json
{
  "vid": 432176649,
  "project": "Project name",
  "tag": "Tag name",
  "phone": "77777777777",
  "time": 1703781939
}
```

Преобразует и отправляет на целевой сервер в формате:

```json
[
  {
    "phone": "77777777777",
    "tags": ["Tag name"],
    "additionalFields": {
      "vid": 432176649,
      "project": "Project name",
      "time": 1703781939
    }
  }
]
```

### GET /health

Проверка работоспособности сервера.

## Пример использования

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "vid": 432176649,
    "project": "Project name",
    "tag": "Tag name",
    "phone": "77777777777",
    "time": 1703781939
  }'
```
