document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    events: [
      {
        title: 'Примерно събитие',
        start: '2025-06-10',
        url: 'https://example.com/article'
      }
    ],
    eventClick: function(info) {
      info.jsEvent.preventDefault();
      if (info.event.url) {
        window.open(info.event.url, '_blank');
      }
    }
  });

  calendar.render();
});
