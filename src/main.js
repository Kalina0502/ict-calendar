document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  fetch('../data/events.json')
    .then(response => response.json())
    .then(events => {
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        events: events,
        eventClick: function(info) {
          info.jsEvent.preventDefault();
          if (info.event.url) {
            window.open(info.event.url, '_blank');
          }
        }
      });

      calendar.render();
    })
    .catch(error => {
      console.error('Грешка при зареждане на събитията:', error);
    });
});
