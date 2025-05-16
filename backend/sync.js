require('dotenv').config({ path: __dirname + '/.env' });
const path = require('path');
const { google } = require('googleapis');

console.log('ENV VAR:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH),
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

async function fetchGoogleEvents() {
  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: authClient });

  const res = await calendar.events.list({
    calendarId: '72cec69bfb7db847af7982f0e16403e945e756bfcb6842f706203efa26e25a22@group.calendar.google.com',
    maxResults: 2500,
    singleEvents: true,
    orderBy: 'startTime',
  });

  if (!res.data.items || res.data.items.length === 0) {
    console.error('Няма намерени събития или възникна грешка:', res.data);
    return [];
  }

  return res.data.items.map(ev => ({
    id: ev.id,
    title: ev.summary || '',
    start: ev.start?.dateTime || ev.start?.date || '',
    end: ev.end?.dateTime || ev.end?.date || '',
    location: ev.location || '',
    description: ev.description || '',
    source: 'google',
  }));
}

if (require.main === module) {
  fetchGoogleEvents().then(events => {
    console.log('Events:', events);
  }).catch(err => {
    console.error(' Error fetching events:', err);
  });
}

module.exports = fetchGoogleEvents;