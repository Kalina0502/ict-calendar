document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  // Зареждане на събития от JSON файл
  fetch('../data/events.json')
    .then(response => response.json())
    .then(events => {
      // Цветове според категория
      const categoryColors = {
        monthly: "#6c5ce7",    // Месечна среща
        internal: "#0984e3",   // Собствено събитие
        partner: "#00b894",    // Партньорско
        training: "#fdcb6e"    // Обучение
      };

      // Добавяне на цвят към всяко събитие
      const coloredEvents = events.map(event => ({
        ...event,
        backgroundColor: categoryColors[event.category] || '#b2bec3',
        borderColor: categoryColors[event.category] || '#b2bec3'
      }));

      // Инициализация на календара
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
        events: coloredEvents,
        eventClick: function (info) {
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
