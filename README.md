# 🍽️ Lunch Predictions App

A simple web application where users predict the lunch delivery time.
The winner is the person who predicts the **exact arrival time**.

Built as a learning project using **HTML, CSS, Vanilla JavaScript**, and **Supabase** as a backend.

---

## 🚀 Features

- Submit a lunch delivery time prediction
- One prediction per person per day
- No duplicate times allowed per day
- Predictions open only between **09:00 – 12:00**
- Admin can enter actual delivery time
- Automatic winner detection
- Winners are stored permanently
- Old non-winning predictions are cleaned daily
- Deployed on **GitHub Pages**

---

## 🛠️ Tech Stack

**Frontend**
- HTML
- CSS
- Vanilla JavaScript

**Backend**
- Supabase (PostgreSQL + API)
- Row Level Security (RLS)
- Scheduled cleanup using `pg_cron`

**Hosting**
- GitHub Pages

---

## 📂 Project Structure

```text
/
├── index.html
├── style.css
├── predictions_script.js
├── assets/
│   ├── logo.jpg
│   └── favicon.svg
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

---

### 2️⃣ Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Create a table `predictions` with columns:
   - `id` (uuid, primary key)
   - `name` (text, not null)
   - `predicted_time` (time, not null)
   - `submitted_at` (timestamp, default `now()`)
   - `winner` (boolean)

4. Enable Row Level Security (RLS)
5. Add insert/select policies

---

### 3️⃣ Connect Supabase to Frontend

In your `predictions_script.js`:

```js
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_PUBLIC_ANON_KEY";

const sb = window.supabase.createClient(supabaseUrl, supabaseKey);
```

> ⚠️ Never use your **service role key** in frontend code.

---

### 4️⃣ Run Locally

Just open `index.html` in the browser:

```bash
open index.html
```

(or double-click it)

---

## 🧹 Daily Cleanup Logic

Old predictions are automatically removed using a scheduled SQL job:

```sql
delete from predictions
where submitted_at < date_trunc('day', now())
  and winner is not true;
```

Winners are **never deleted**.

---

## 🔐 Admin Access

- Admin panel is currently UI-based
- Only admin can:
  - Enter actual arrival time
  - Trigger winner calculation
- Future improvement: authentication & roles

---

## 📌 Game Rules

1. Only office attendees may participate
2. One prediction per person per day
3. No duplicate predicted times
4. Predictions open from **09:00 – 12:00**
5. Exact match wins
6. If nobody wins, last winner keeps the trophy
7. Rule violations lead to permanent disqualification

---

## 🌱 Future Improvements

- User accounts (username + password)
- Admin roles in database
- Daily history view
- Mobile-friendly UI
- Notifications
- Analytics

---

## 🧠 Learning Goals

This project was built to learn:
- Frontend ↔ Backend communication
- SQL constraints and cleanup strategies
- Supabase RLS and policies
- Real-world app architecture

---

## 📄 License

This project is for internal / learning use.

---

Made with ☕, 🍕 and curiosity.