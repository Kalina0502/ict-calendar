const express = require('express');
const { google } = require('googleapis');
const open = (...args) => import('open').then(mod => mod.default(...args));
require('dotenv').config();


const app = express();
const port = 3000;


const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

// Създаване на OAuth2 клиент
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Начален маршрут – генерира линк за логин и го отваря
app.get('/', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });

  res.send(`<a href="${authUrl}">Login with Google</a>`);
  open(authUrl);
});

// Google те пренасочва тук след login
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Получаване на токени
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Свързване с Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Създаване на събитие
    const event = {
      summary: 'Тестово събитие от OAuth',
      description: 'Създадено чрез Node.js и Google Calendar API',
      start: {
        dateTime: '2025-05-20T10:00:00+03:00',
        timeZone: 'Europe/Sofia',
      },
      end: {
        dateTime: '2025-05-20T11:00:00+03:00',
        timeZone: 'Europe/Sofia',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    res.send(` Събитието е създадено успешно: <a href="${response.data.htmlLink}" target="_blank">Виж в календара</a>`);
  } catch (err) {
    console.error('OAuth грешка:', err);
    res.status(500).send(' Възникна грешка при процеса');
  }
});

// Стартиране на сървъра
app.listen(port, () => {
  console.log(`Сървърът работи на http://localhost:${port}`);
});
