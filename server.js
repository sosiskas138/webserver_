const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_SERVER_URL = process.env.TARGET_SERVER_URL;

if (!TARGET_SERVER_URL) {
  console.error('ERROR: TARGET_SERVER_URL is not set in .env file');
  process.exit(1);
}

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Функция для преобразования входящих данных в нужный формат
function transformData(inputData) {
  const {
    vid,
    project,
    tag,
    phone,
    time,
    ...otherFields
  } = inputData;

  // Формируем массив тегов
  const tags = tag ? [tag] : [];

  // Формируем дополнительные поля
  const additionalFields = {
    ...(vid !== undefined && { vid }),
    ...(project !== undefined && { project }),
    ...(time !== undefined && { time }),
    ...otherFields
  };

  return [
    {
      phone: phone || '',
      tags: tags,
      additionalFields: additionalFields
    }
  ];
}

// POST endpoint для приема данных
app.post('/api/webhook', async (req, res) => {
  try {
    const inputData = req.body;
    
    console.log('Received data:', JSON.stringify(inputData, null, 2));

    // Преобразуем данные в нужный формат
    const transformedData = transformData(inputData);

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    // Отправляем на целевой сервер
    const response = await axios.post(TARGET_SERVER_URL, transformedData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 секунд таймаут
    });

    console.log('Response from target server:', response.status, response.data);

    // Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      message: 'Data forwarded successfully',
      targetResponse: response.data
    });

  } catch (error) {
    console.error('Error processing request:', error.message);
    
    if (error.response) {
      // Сервер ответил с кодом ошибки
      console.error('Target server error:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        success: false,
        error: 'Target server error',
        details: error.response.data
      });
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      console.error('No response from target server');
      res.status(502).json({
        success: false,
        error: 'Target server unavailable',
        message: 'Could not reach target server'
      });
    } else {
      // Ошибка при настройке запроса
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    targetServer: TARGET_SERVER_URL
  });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Target server: ${TARGET_SERVER_URL}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
});
