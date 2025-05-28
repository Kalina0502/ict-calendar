const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Настройва frontend  и project-root като static папки
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/libs', express.static(path.join(__dirname, '../project-root/libs')));

// app.get('/generate-ics', (req, res) => {
//   const icsPath = path.join(__dirname, '../data/calendar.ics');
//   res.download(icsPath, 'calendar.ics');
// });

// GET /events - връща всички събития
// app.get('/events', (req, res) => {
//   const data = fs.readFileSync(DATA_FILE, 'utf-8');
//   res.json(JSON.parse(data));
// });

// POST /events - добавя ново събитие
// app.post('/events', (req, res) => {
//   const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
//   const newEvent = { id: Date.now(), ...req.body };
//   events.push(newEvent);
//   fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
//   res.status(201).json(newEvent);
// });

// PUT /events - редактира събитие
// app.put('/events/:id', (req, res) => {
//   const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
//   const eventId = parseInt(req.params.id, 10);
//   const updatedEvent = req.body;

//   const index = events.findIndex(e => e.id === eventId);
//   if (index === -1) {
//     return res.status(404).json({ error: 'Event not found' });
//   }

//   events[index] = { ...events[index], ...updatedEvent };
//   fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
//   res.json(events[index]);
// });

// DELETE /events - изтрива събитие
// app.delete('/events/:id', (req, res) => {
//   const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
//   const eventId = parseInt(req.params.id, 10);

//   const filteredEvents = events.filter(e => e.id !== eventId);
//   if (filteredEvents.length === events.length) {
//     return res.status(404).json({ error: 'Event not found' });
//   }

//   fs.writeFileSync(DATA_FILE, JSON.stringify(filteredEvents, null, 2));
//   res.status(204).end();
// });

// Старт на сървъра


const fetchGoogleEvents = require('./sync');

app.get('/events', async (req, res) => {
  try {
    const events = await fetchGoogleEvents();
    res.json(events);
  } catch (e) {
    console.error('Error loading events:', e);
    res.status(500).json({ error: 'Failed to load events' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// === Автоматична синхронизация с Google Calendar ===
const { exec } = require('child_process');

setInterval(() => {
  exec('node ./backend/sync.js', (err, stdout, stderr) => {
    if (err) {
      console.error('Sync error:', err);
    } else {
      console.log('Synced Google Calendar');
    }
  });
}, 15 * 1000); //5 * 60 * 1000
