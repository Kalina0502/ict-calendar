const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, '../data/events.json');

// Middleware
app.use(cors());
app.use(express.json());

// Настройва frontend  и project-root като static папки
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/libs', express.static(path.join(__dirname, '../project-root/libs')));

// GET /events - връща всички събития
app.get('/events', (req, res) => {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  res.json(JSON.parse(data));
});

// POST /events - добавя ново събитие
app.post('/events', (req, res) => {
  const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const newEvent = { id: Date.now(), ...req.body };
  events.push(newEvent);
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
  res.status(201).json(newEvent);
});

// Старт на сървъра
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
