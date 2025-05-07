import { Calendar } from 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';

document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  const response = await fetch('../data/mockEvents.json');
  const events = await response.json();

  const calendar = new Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listMonth'
    },
    events,
    eventClick: function(info) {
      info.jsEvent.preventDefault();
      if (info.event.url) {
        window.open(info.event.url, '_blank');
      }
    }
  });

  calendar.render();
});
