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
  // const categoryFilter = document.getElementById('categoryFilter');
  // const locationFilter = document.getElementById('locationFilter');
  // const organizerFilter = document.getElementById('organizerFilter');
  // const keywordFilter = document.getElementById('keywordFilter');

  fetch('/events')
    .then(response => response.json())
    .then(events => {
      allEvents = events;

      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'parent',
        expandRows: true,
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

          const event = info.event;
          const preview = document.getElementById('eventPreview');
          const title = document.getElementById('previewTitle');
          const date = document.getElementById('previewDate');
          const location = document.getElementById('previewLocation');
          const description = document.getElementById('previewOrganizer');

          title.textContent = event.title || 'Untitled Event';

          function formatDate(dateObj) {
            return dateObj.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }

          function formatTime(dateObj) {
            return dateObj.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });
          }

          let start = event.start;
          let end = event.end;

          let timeRangeText = '';
          if (start && end) {
            const isAllDay =
              start.getHours() === 0 &&
              start.getMinutes() === 0 &&
              end.getHours() === 0 &&
              end.getMinutes() === 0;

            const sameDay = start.toDateString() === end.toDateString();

            if (isAllDay) {
              timeRangeText = `${formatDate(start)}`;
            } else if (sameDay) {
              timeRangeText = `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`;
            } else {
              timeRangeText = `${formatDate(start)}, ${formatTime(start)} - ${formatDate(end)}, ${formatTime(end)}`;
            }
          } else {
            timeRangeText = 'No time info';
          }

          date.textContent = timeRangeText;

          const rawLocation = event.extendedProps?.location || '-';

          if (rawLocation === '-') {
            location.innerHTML = 'Location: -';
          } else {
            const encodedLocation = encodeURIComponent(rawLocation);
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
            location.innerHTML = `Location: <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer">${rawLocation}</a>`;
          }


          const rawDesc = event.extendedProps?.description || 'No description';
          const safeDesc = rawDesc.includes('<a ') ? rawDesc : linkify(rawDesc);
          description.innerHTML = `Description: ${safeDesc}`;

          // Open new tab
          description.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });

          // === Позициониране в рамките на прозореца ===
          const popupWidth = 300;
          const popupHeight = 180;

          let left = info.jsEvent.pageX + 10;
          let top = info.jsEvent.pageY;

          if (left + popupWidth > window.innerWidth) {
            left = window.innerWidth - popupWidth - 10;
          }

          if (top + popupHeight > window.innerHeight + window.scrollY) {
            top = window.innerHeight + window.scrollY - popupHeight - 10;
          }

          preview.style.left = `${left}px`;
          preview.style.top = `${top}px`;
          preview.classList.add('show');

          // Save event globally for editing
          window.selectedEvent = event;
          document.getElementById("googleCalBtn").href = generateGoogleCalendarLink(event);

        }

      });

      calendar.render();

      // [categoryFilter, locationFilter, organizerFilter, keywordFilter].forEach(el =>
      //   el.addEventListener('input', filterEvents)
      // );

      // function filterEvents() {
      //   const category = categoryFilter.value.toLowerCase();
      //   const location = locationFilter.value.toLowerCase();
      //   const organizer = organizerFilter.value.toLowerCase();
      //   const search = keywordFilter.value.toLowerCase();

      //   const filtered = allEvents.filter(ev => {
      //     return (
      //       (category === 'all' || (ev.category || '').toLowerCase() === category) &&
      //       (location === 'all' || (ev.location || '').toLowerCase() === location) &&
      //       (organizer === 'all' || (ev.organizer || '').toLowerCase() === organizer) &&
      //       (search === '' || ev.title.toLowerCase().includes(search) || (ev.description || '').toLowerCase().includes(search))
      //     );
      //   });

      //   calendar.removeAllEvents();
      //   calendar.addEventSource(mapEvents(filtered));
      // }
      // === Слушатели за иконки в popup-а ===//
      document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('eventPreview').classList.remove('show');
      });

      // document.getElementById('editEventBtn').addEventListener('click', () => {
      //   document.getElementById('eventPreview').classList.remove('show');
      //   openEditModal(window.selectedEvent);
      // });


      // window.printView = function () {
      //   window.print();
      // };

      // function exportToPDF() {
      //   const currentDate = calendar.getDate();
      //   const currentMonth = currentDate.getMonth();
      //   const currentYear = currentDate.getFullYear();

      //   const eventsForMonth = calendar.getEvents().filter(event => {
      //     const eventDate = event.start;
      //     return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      //   });

      //   if (eventsForMonth.length === 0) {
      //     alert("There are no events for the current month.");
      //     return;
      //   }

      //   const doc = new window.jspdf.jsPDF();
      //   doc.setFontSize(14);
      //   doc.text("Exported Calendar Events", 14, 20);

      //   const tableData = eventsForMonth.map(evt => [
      //     evt.title || "-",
      //     evt.start ? new Date(evt.start).toLocaleString() : "-",
      //     evt.end ? new Date(evt.end).toLocaleString() : "-",
      //     evt.extendedProps?.location || "-",
      //     evt.extendedProps?.organizer || "-",
      //     evt.extendedProps?.category || "-"
      //   ]);

      //   doc.autoTable({
      //     head: [["Title", "Start", "End", "Location", "Organizer", "Category"]],
      //     body: tableData,
      //     startY: 30,
      //     theme: "grid",
      //     headStyles: { fillColor: [41, 128, 185] },
      //   });

      //   doc.save("calendar-events.pdf");
      // }

      // window.exportToPDF = exportToPDF;

    })
    .catch(error => {
      console.error('Error loading events:', error);
    });

  // function mapEvents(eventArray) {
  //   return eventArray.map(event => {
  //     const color = categoryColors[event.category] || '#b2bec3';

  //     return {
  //       ...event,
  //       backgroundColor: color,
  //       borderColor: color,
  //       extendedProps: {
  //         category: event.category || '',
  //         location: event.location || '',
  //         organizer: event.organizer || '',
  //         description: event.description || ''
  //       }
  //     };
  //   });
  // }

  function mapEvents(eventArray) {
    return eventArray.map(event => {
      const color = categoryColors[event.category] || '#b2bec3';

      const isAllDay = event.start.length === 10;
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      console.log(startDate.toISOString());


      return {
        ...event,
        start: startDate,
        end: endDate,
        allDay: isAllDay,
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

//Close preview section
document.addEventListener('click', (e) => {
  const preview = document.getElementById('eventPreview');
  const isInsidePopup = preview.contains(e.target);
  const isCalendarEvent = e.target.closest('.fc-event');

  if (!isInsidePopup && !isCalendarEvent) {
    preview.classList.remove('show');
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

function closeModal() {
  modal.style.display = 'none';
  form.reset();
  selectedEvent = null;
}

if (closeBtn) {
  closeBtn.addEventListener('click', closeModal);
}

window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

function linkify(inputText) {
  let replacedText = inputText;

  // Откриване на URL адреси, започващи с http://, https:// или ftp://
  const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  replacedText = replacedText.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');

  // Откриване на URL адреси, започващи с www.
  const wwwPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gi;
  replacedText = replacedText.replace(wwwPattern, '$1<a href="http://$2" target="_blank">$2</a>');

  // Откриване на имейл адреси
  const emailPattern = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gi;
  replacedText = replacedText.replace(emailPattern, '<a href="mailto:$1">$1</a>');

  return replacedText;
}

function generateGoogleCalendarLink(event) {
  const { title, start, end, extendedProps, allDay } = event;

  const pad = (num) => String(num).padStart(2, '0');

  const formatDateOnly = (date) =>
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate());

  const formatDateTime = (date) =>
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    '00Z';

  let startStr, endStr;

  if (event.allDay) {
    startStr = formatDateOnly(start);
    endStr = formatDateOnly(end);
  } else {
    startStr = formatDateTime(start);
    endStr = formatDateTime(end);
  }

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title || '')}` +
    `&dates=${startStr}/${endStr}` +
    `&details=${encodeURIComponent(extendedProps?.description || '')}` +
    `&location=${encodeURIComponent(extendedProps?.location || '')}` +
    `&sf=true&output=xml`;

  return url;
}
