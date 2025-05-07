document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const categorySelect = document.getElementById('categoryFilter');

  let allEvents = [];

  fetch('../data/events.json')
    .then(response => response.json())
    .then(events => {
      allEvents = events;

      const categoryColors = {
        monthly: "#6c5ce7",
        internal: "#0984e3",
        partner: "#00b894",
        training: "#fdcb6e"
      };

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        events: mapEvents(allEvents),
        eventClick: function(info) {
          info.jsEvent.preventDefault();
          if (info.event.url) {
            window.open(info.event.url, '_blank');
          }
        }
      });

      calendar.render();

      // Event listener за филтъра
      categorySelect.addEventListener('change', function () {
        const selected = this.value;

        const filtered = selected === 'all'
          ? allEvents
          : allEvents.filter(e => e.category === selected);

        calendar.removeAllEvents();
        calendar.addEventSource(mapEvents(filtered));
      });

      function mapEvents(eventArray) {
        return eventArray.map(event => ({
          ...event,
          backgroundColor: categoryColors[event.category] || '#b2bec3',
          borderColor: categoryColors[event.category] || '#b2bec3'
        }));
      }
    })
    .catch(error => {
      console.error('Error loading events:', error);
    });
});
