let calendar;
let allEvents = [];
let selectedEvent = null;


document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
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
        eventDidMount: function (info) {
          if (info.event.backgroundColor) {
            info.el.style.backgroundColor = info.event.backgroundColor;
          }
          if (info.event.borderColor) {
            info.el.style.borderColor = info.event.borderColor;
          }
          if (info.event.textColor) {
            info.el.style.color = info.event.textColor;
          }
        },

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
            const sameDay = start.toDateString() === end.toDateString();
            if (sameDay) {
              timeRangeText = `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`;
            } else {
              timeRangeText = `${formatDate(start)}, ${formatTime(start)} – ${formatDate(end)}, ${formatTime(end)}`;
            }
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

          window.selectedEvent = event;
          document.getElementById("googleCalBtn").href = generateGoogleCalendarLink(event);
        }
      });
      const processedEvents = mapEvents(events);
      calendar.addEventSource(processedEvents);
      calendar.render();

      // === Слушатели за иконки в popup-а ===//
      document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('eventPreview').classList.remove('show');
      });

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

  function mapEvents(eventArray) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return eventArray.map(event => {
      const startDate = new Date(event.start);
      let endDate = event.end ? new Date(event.end) : new Date(startDate);

      if (isNaN(startDate) || isNaN(endDate)) {
        console.warn('Invalid date:', event);
        return null;
      }

      // Сравняваме само по дата (не часове)
      const compareEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      const isPast = compareEnd < today;

      const color = isPast ? '#b2bec3' : '#0066cc'; 
      const textColor = isPast ? '#2d3436' : '#ffffff'; 

      return {
        ...event,
        start: startDate,
        end: endDate,
        backgroundColor: color,
        borderColor: color,
        textColor,
        extendedProps: {
          category: event.category || '',
          location: event.location || '',
          description: event.description || ''
        }
      };
    }).filter(Boolean);
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

const titleInput = document.getElementById('title');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const locationInput = document.getElementById('location');
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
  const { title, start, end, extendedProps } = event;

  const pad = (num) => String(num).padStart(2, '0');

  const formatDateTime = (date) =>
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    '00Z';

  const startStr = formatDateTime(new Date(start));
  const endStr = formatDateTime(new Date(end));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title || '')}` +
    `&dates=${startStr}/${endStr}` +
    `&details=${encodeURIComponent(extendedProps?.description || '')}` +
    `&location=${encodeURIComponent(extendedProps?.location || '')}` +
    `&sf=true&output=xml`;
}
