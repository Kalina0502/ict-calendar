let calendar;
let allEvents = [];
let selectedEvent = null;
let categoryColors = {
  monthly: "#6c5ce7",
  internal: "#0984e3",
  partner: "#00b894",
  training: "#fdcb6e"
};

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const categoryFilter = document.getElementById('categoryFilter');
  const locationFilter = document.getElementById('locationFilter');
  const organizerFilter = document.getElementById('organizerFilter');
  const keywordFilter = document.getElementById('keywordFilter');

  fetch('/events')
    .then(response => response.json())
    .then(events => {
      allEvents = events;

      calendar = new FullCalendar.Calendar(calendarEl, {
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
          openEditModal(info.event);
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

  function mapEvents(eventArray) {
    return eventArray.map(event => {
      const color = categoryColors[event.category] || '#b2bec3';

      return {
        ...event,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          category: event.category || '',
          location: event.location || '',
          organizer: event.organizer || '',
          description: event.description || ''
        }
      };
    });
  }
});

// ====== Modal logic ======
const modal = document.getElementById('eventModal');
const form = document.getElementById('eventForm');
const closeBtn = document.querySelector('.close-button');
const modalTitle = document.getElementById('modalTitle');

const idInput = document.getElementById('eventId');
const titleInput = document.getElementById('title');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const categoryInput = document.getElementById('category');
const locationInput = document.getElementById('location');
const organizerInput = document.getElementById('organizer');
const urlInput = document.getElementById('url');
const descriptionInput = document.getElementById('description');

document.getElementById('addEventBtn').addEventListener('click', () => {
  selectedEvent = null;
  modalTitle.textContent = 'Add New Event';
  form.reset();
  modal.style.display = 'flex';
});

function openEditModal(event) {
  selectedEvent = event;
  modalTitle.textContent = 'Edit Event';
  idInput.value = event.id || '';
  titleInput.value = event.title || '';
  startInput.value = event.startStr ? event.startStr.slice(0, 16) : '';
  endInput.value = event.endStr ? event.endStr.slice(0, 16) : '';
  categoryInput.value = event.extendedProps.category || '';
  locationInput.value = event.extendedProps.location || '';
  organizerInput.value = event.extendedProps.organizer || '';
  urlInput.value = event.url || '';
  descriptionInput.value = event.extendedProps.description || '';
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
  form.reset();
  selectedEvent = null;
}

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const eventData = {
    title: titleInput.value,
    start: startInput.value,
    end: endInput.value,
    category: categoryInput.value,
    location: locationInput.value,
    organizer: organizerInput.value,
    url: urlInput.value,
    description: descriptionInput.value,
  };

  const method = idInput.value ? 'PUT' : 'POST';
  const url = idInput.value ? `/events/${idInput.value}` : '/events';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  })
    .then(res => res.json())
    .then(updated => {
      if (selectedEvent) {
        // Редакция на съществуващо събитие
        selectedEvent.setProp('title', updated.title);
        selectedEvent.setStart(updated.start);
        selectedEvent.setEnd(updated.end);
        selectedEvent.setProp('url', updated.url);
        selectedEvent.setProp('backgroundColor', categoryColors[updated.category] || '#b2bec3');
        selectedEvent.setProp('borderColor', categoryColors[updated.category] || '#b2bec3');
        selectedEvent.setExtendedProp('category', updated.category);
        selectedEvent.setExtendedProp('location', updated.location);
        selectedEvent.setExtendedProp('organizer', updated.organizer);
        selectedEvent.setExtendedProp('description', updated.description);
      } else {
        // Добавяне на ново събитие
        calendar.addEvent({
          ...updated,
          backgroundColor: categoryColors[updated.category] || '#b2bec3',
          borderColor: categoryColors[updated.category] || '#b2bec3',
          extendedProps: {
            category: updated.category || '',
            location: updated.location || '',
            organizer: updated.organizer || '',
            description: updated.description || ''
          }
        });
      }
      closeModal();
    })
    .catch(err => {
      console.error('Error saving event:', err);
    });
});
