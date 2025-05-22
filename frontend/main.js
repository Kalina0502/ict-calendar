let calendar;
let allEvents = [];
let selectedEvent = null;
let icsLib;
let lastOpenedEventId = null;


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
          left: '',
          center: 'title',
          right: ''
        },
        views: {
          listMonth: {
            buttonText: 'List'
          }
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

          if (lastOpenedEventId === info.event.id) {
            document.getElementById('eventPreview').classList.remove('show');
            lastOpenedEventId = null;
            return;
          }
          lastOpenedEventId = info.event.id;

          const event = info.event;
          const preview = document.getElementById('eventPreview');
          const title = document.getElementById('previewTitle');
          const date = document.getElementById('previewDate');
          const description = document.getElementById('previewDescription');

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
          const locationEl = document.getElementById('previewLocation');

          if (rawLocation === '-') {
            locationEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> <strong>Location:</strong> -`;
          } else {
            const encodedLocation = encodeURIComponent(rawLocation);
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
            locationEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> <strong>Location:</strong> <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer">${rawLocation}</a>`;
          }

          const rawDesc = event.extendedProps?.description || 'No description';
          const safeDesc = rawDesc.includes('<a ') ? rawDesc : linkify(rawDesc);
          const descEl = document.getElementById('previewDescription');
          descEl.innerHTML = `<span class="desc-label"><i class="fa-solid fa-align-left"></i> <strong>Description:</strong></span><span class="desc-text">${safeDesc}</span>`;

          descEl.classList.remove('expanded');
          descEl.onclick = () => {
            descEl.classList.toggle('expanded');
          };

          // Open new tab
          description.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });

          const popupWidth = preview.offsetWidth;
          const popupHeight = preview.offsetHeight;

          const margin = 10;
          let left = info.jsEvent.pageX + margin;
          let top = info.jsEvent.pageY + margin;

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const scrollX = window.scrollX;
          const scrollY = window.scrollY;

          const maxLeft = scrollX + viewportWidth - popupWidth - margin;
          const maxTop = scrollY + viewportHeight - popupHeight - margin;

          if (left > maxLeft) left = maxLeft;
          if (top > maxTop) top = maxTop;
          if (left < scrollX + margin) left = scrollX + margin;
          if (top < scrollY + margin) top = scrollY + margin;

          preview.style.left = `${left}px`;
          preview.style.top = `${top}px`;
          preview.classList.add('show');

          window.selectedEvent = event;
          document.getElementById("googleCalBtn").href = generateGoogleCalendarLink(event);
          document.getElementById("icsCalBtn").onclick = () => downloadEventAsICS(event);

        }
      });
      const processedEvents = mapEvents(events);
      calendar.addEventSource(processedEvents);
      calendar.render();


      function updateGliderPosition() {
        const activeTab = document.querySelector('.container input[type="radio"]:checked + label');
        const glider = document.querySelector('.glider');
        if (activeTab && glider) {
          const offsetLeft = activeTab.offsetLeft;
          const tabWidth = activeTab.offsetWidth;
          glider.style.width = `${tabWidth}px`;
          glider.style.transform = `translateX(${offsetLeft}px)`;
        }
      }

      const toolbarRight = document.querySelector('.fc-toolbar .fc-toolbar-chunk:last-child');
      const tabContainer = document.querySelector('.tabs');
      if (toolbarRight && tabContainer) {
        toolbarRight.appendChild(tabContainer);
        tabContainer.style.display = "flex";
        updateGliderPosition();
      }

      ['radio-1', 'radio-2', 'radio-3', 'radio-4'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateGliderPosition);
      });

      document.getElementById('radio-1').addEventListener('change', () => {
        calendar.changeView('dayGridMonth');
      });
      document.getElementById('radio-2').addEventListener('change', () => {
        calendar.changeView('timeGridWeek');
      });
      document.getElementById('radio-3').addEventListener('change', () => {
        calendar.changeView('timeGridDay');
      });
      document.getElementById('radio-4').addEventListener('change', () => {
        calendar.changeView('listMonth');
      });


      const toolbarLeft = document.querySelector('.fc-toolbar .fc-toolbar-chunk:first-child');
      const navButtons = document.querySelector('#nav-buttons-hidden .nav-tabs');
      if (toolbarLeft && navButtons) {
        toolbarLeft.appendChild(navButtons);
        navButtons.style.display = "flex";
      }

      document.getElementById('prevBtn').addEventListener('click', () => {
        calendar.prev();
      });
      document.getElementById('todayBtn').addEventListener('click', () => {
        calendar.today();
      });
      document.getElementById('nextBtn').addEventListener('click', () => {
        calendar.next();
      });

      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const todayBtn = document.getElementById('todayBtn');

      function isTodayView() {
        const currentDate = calendar.getDate();
        const now = new Date();
        return currentDate.getMonth() === now.getMonth() &&
          currentDate.getFullYear() === now.getFullYear();
      }

      function updateActiveState(activeButton) {
        prevBtn.classList.remove('active');
        nextBtn.classList.remove('active');
        todayBtn.classList.remove('active');

        if (isTodayView()) {
          todayBtn.classList.add('active');
        } else {
          activeButton?.classList.add('active');
        }
      }

      updateActiveState();

      // Слушатели
      prevBtn.addEventListener('click', () => {
        calendar.prev();
        setTimeout(() => updateActiveState(prevBtn), 10);
      });

      nextBtn.addEventListener('click', () => {
        calendar.next();
        setTimeout(() => updateActiveState(nextBtn), 10);
      });

      todayBtn.addEventListener('click', () => {
        calendar.today();
        setTimeout(() => updateActiveState(), 10);
      });


      // Слушатели за иконки в popup-а
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

window.addEventListener('scroll', () => {
  const preview = document.getElementById('eventPreview');
  if (preview && preview.classList.contains('show')) {
    preview.classList.remove('show');
    lastOpenedEventId = null;
  }
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

function downloadEventAsICS(event) {
  const toIsoDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return year + month + day + 'T' + hours + minutes + seconds + 'Z';
  };

  const isAllDay = event.allDay ||
    ((event.start instanceof Date) && event.start.getHours() === 0 && event.end && event.end.getHours() === 0);

  let dtStartStr, dtEndStr;
  if (isAllDay) {
    const startYear = event.start.getFullYear();
    const startMonth = String(event.start.getMonth() + 1).padStart(2, '0');
    const startDay = String(event.start.getDate()).padStart(2, '0');
    dtStartStr = `${startYear}${startMonth}${startDay}`;

    const endYear = event.end.getFullYear();
    const endMonth = String(event.end.getMonth() + 1).padStart(2, '0');
    const endDay = String(event.end.getDate()).padStart(2, '0');
    dtEndStr = `${endYear}${endMonth}${endDay}`;
  } else {
    dtStartStr = toIsoDate(event.start);
    dtEndStr = toIsoDate(event.end);
  }

  // 2. Сглобяване на ICS съдържанието
  const uid = event.id || Date.now();
  const now = new Date();
  const dtStampStr = toIsoDate(now);
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MyCalendar//Events//BG
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStampStr}
SUMMARY:${event.title || 'Без заглавие'}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
DTSTART:${isAllDay ? dtStartStr : dtStartStr}
DTEND:${isAllDay ? dtEndStr : dtEndStr}
END:VEVENT
END:VCALENDAR`;

  icsContent = icsContent.replace(/\n/g, '\r\n');

  // 3. Създаване на Blob и стартиране на изтеглянето
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (event.title || 'event') + '.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function closePopupOnScroll() {
  const preview = document.getElementById('eventPreview');
  if (preview && preview.classList.contains('show')) {
    preview.classList.remove('show');
    lastOpenedEventId = null;
  }
}

function observeCalendarScrollContainer() {
  const observer = new MutationObserver(() => {
    const scrollAreas = document.querySelectorAll('.fc-scroller, .fc-timegrid-body, .fc-scrollgrid-sync-table, .fc-list-day-cushion');

    scrollAreas.forEach(el => {
      el.addEventListener('scroll', closePopupOnScroll, { passive: true });
    });
  });

  observer.observe(document.getElementById('calendar'), {
    childList: true,
    subtree: true
  });
}

observeCalendarScrollContainer();
