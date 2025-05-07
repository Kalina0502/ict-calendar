document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const categoryFilter = document.getElementById('categoryFilter');
  const locationFilter = document.getElementById('locationFilter');
  const organizerFilter = document.getElementById('organizerFilter');
  const keywordFilter = document.getElementById('keywordFilter');

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
        eventClick: function (info) {
          info.jsEvent.preventDefault();
          if (info.event.url) {
            window.open(info.event.url, '_blank');
          }
        }
      });

      calendar.render();

      [categoryFilter, locationFilter, organizerFilter, keywordFilter].forEach(el =>
        el.addEventListener('input', filterEvents)
      );

      function filterEvents() {
        const category = categoryFilter.value.toLowerCase();
        const location = locationFilter.value.toLowerCase();
        const organizer = organizerFilter.value.toLowerCase();
        const search = keywordFilter.value.toLowerCase();
      
        const filtered = allEvents.filter(ev => {
          return (
            (category === 'all' || (ev.category || '').toLowerCase() === category) &&
            (location === 'all' || (ev.location || '').toLowerCase() === location) &&
            (organizer === 'all' || (ev.organizer || '').toLowerCase() === organizer) &&
            (search === '' || ev.title.toLowerCase().includes(search) || (ev.description || '').toLowerCase().includes(search))
          );
        });
      
        calendar.removeAllEvents();
        calendar.addEventSource(mapEvents(filtered));
      }


      window.printView = function () {
        window.print();
      };

      window.exportToPDF = function () {
        import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(jsPDF => {
          const { jsPDF: PDF } = jsPDF;
          const doc = new PDF();

          doc.text("Upcoming Events", 10, 10);
          let y = 20;
          calendar.getEvents().forEach(ev => {
            const title = ev.title;
            const start = ev.start?.toLocaleString() || '';
            doc.text(`${start} - ${title}`, 10, y);
            y += 10;
          });

          doc.save("calendar-export.pdf");
        });
      };

      function mapEvents(eventArray) {
        return eventArray.map(event => {
          const color = categoryColors[event.category] || '#b2bec3';

          const extended = {
            category: event.category || '',
            location: event.location || '',
            organizer: event.organizer || '',
            description: event.description || ''
          };

          return {
            ...event,
            backgroundColor: color,
            borderColor: color,
            extendedProps: extended
          };
        });
      }

    })
    .catch(error => {
      console.error('Error loading events:', error);
    });
});
