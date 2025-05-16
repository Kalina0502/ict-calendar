const { writeFileSync } = require('fs');
const path = require('path');
const { createEvents } = require('ics');
const eventsData = require('../data/events.json');

const parsedEvents = eventsData.map(ev => {
    const startDate = new Date(ev.start);
    const endDate = new Date(ev.end || ev.start);

    return {
        start: [
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            startDate.getDate(),
            startDate.getHours(),
            startDate.getMinutes()
        ],
        end: [
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            endDate.getDate(),
            endDate.getHours(),
            endDate.getMinutes()
        ],
        title: ev.title || 'Untitled Event',
        description: ev.description || '',
        location: ev.location || '',
        organizer: { name: ev.organizer || 'ICT Calendar', email: '' }
    };
});

createEvents(parsedEvents, (err, value) => {
    if (err) {
        console.error('Error creating .ics:', err);
        return;
    }

    const icsPath = path.join(__dirname, '../data/calendar.ics');
    writeFileSync(icsPath, value);
    console.log('ICS file generated at:', icsPath);
});
