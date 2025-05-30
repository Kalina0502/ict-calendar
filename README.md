```markdown
# 📅 ICT Calendar

**ICT Calendar** is a responsive, dynamic calendar web application that synchronizes with Google Calendar and provides an interactive user interface for viewing and managing events. Built using FullCalendar.js, Express.js, and the Google Calendar API, it offers real-time integration and a rich UI experience.

---

## 🌟 Features

- 📆 Multiple calendar views: Month, Week, Day, and List
- 🔄 Auto-sync with Google Calendar every 15 seconds
- 📍 Interactive event preview with:
  - Title, time range, location (with Google Maps link), description
  - Export to Google Calendar or download `.ics` file
- 📱 Responsive layout for desktop and mobile
- 📤 Export-ready for printing or PDF (planned)
- 🧭 Custom navigation and day selector UI

---

## 🛠️ Technologies

- **Frontend:** HTML, CSS, JavaScript, FullCalendar
- **Backend:** Node.js, Express.js
- **External APIs:** Google Calendar API
- **PDF Export:** jsPDF (included, partially implemented)
- **.ICS Export:** [ics-js](https://github.com/nwcell/ics.js)

---

## 📁 Project Structure

```

project-root/
├── backend/               # Backend logic (Express server & Google Calendar sync)
├── frontend/              # Frontend code (HTML/CSS/JS)
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── styles\_responsive.css
├── libs/                  # FullCalendar library files
├── app.js                 # Express server entry
├── sync.js                # Google Calendar sync logic
├── .env                   # Contains sensitive keys (not committed)

````

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Kalina0502/ict-calendar.git
cd ict-calendar
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file inside `/backend`:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=credentials.json
```

Make sure the JSON file with your Google service account credentials is placed in the `/backend` folder.

### 4. Run the Server

```bash
node backend/app.js
```

The application will be available at:

```
http://localhost:3000
```

---

## 🔗 Google Calendar Integration

This project uses a Google Service Account to fetch events from a specific calendar. To set this up:

1. Create a Service Account in Google Cloud Console.
2. Share your Google Calendar with the service account email.
3. Download the credentials JSON and place it as `credentials.json` in the `backend/` directory.
4. Set the correct calendar ID in `sync.js`.

---

## 🧪 Development Notes

* Events are fetched via `/events` route, auto-refreshed every 15 seconds.
* The frontend uses FullCalendar's `interaction`, `dayGrid`, `timeGrid`, and `list` plugins.
* The UI includes additional components for smooth UX (glider tabs, mobile navigation, and event previews).

---

## 📄 License

This project is open-source and licensed under the MIT License.

---

## 👩‍💻 Author

Developed by [Kalina0502](https://github.com/Kalina0502)

```
