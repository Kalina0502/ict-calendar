document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const categoryFilter = document.getElementById('categoryFilter');
  const locationFilter = document.getElementById('locationFilter');
  const organizerFilter = document.getElementById('organizerFilter');
  const keywordFilter = document.getElementById('keywordFilter');

  let allEvents = [];

  const categoryColors = {
    monthly: "#6c5ce7",
    internal: "#0984e3",
    partner: "#00b894",
    training: "#fdcb6e"
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

  fetch('../data/events.json')
    .then(response => response.json())
    .then(events => {
      allEvents = events;

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

      function exportToPDF() {
        const currentDate = calendar.getDate();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const eventsForMonth = calendar.getEvents().filter(event => {
          const eventDate = event.start;
          return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        });

        if (eventsForMonth.length === 0) {
          alert("There are no events for the current month.");
          return;
        }

        const doc = new window.jspdf.jsPDF();
        doc.setFontSize(14);
        doc.text("Exported Calendar Events", 14, 20);

        const tableData = eventsForMonth.map(evt => [
          evt.title || "-",
          evt.start ? new Date(evt.start).toLocaleString() : "-",
          evt.end ? new Date(evt.end).toLocaleString() : "-",
          evt.extendedProps?.location || "-",
          evt.extendedProps?.organizer || "-",
          evt.extendedProps?.category || "-"
        ]);

        doc.autoTable({
          head: [["Title", "Start", "End", "Location", "Organizer", "Category"]],
          body: tableData,
          startY: 30,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save("calendar-events.pdf");
      }

      window.exportToPDF = exportToPDF;

    })
    .catch(error => {
      console.error('Error loading events:', error);
    });
});
