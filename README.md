```markdown
# 🎆 Canada Day Night Planner App

A full-stack web application built with **React**, **Express.js**, **Stripe**, and **Google Maps JavaScript API** to help users **plan custom night routes**, **order event merchandise**, and **download their plans** — all in one seamless flow.

🌐 **Live App:** [Launch the Planner](https://google-maps-night-planner-frontend.onrender.com/)

![React](https://img.shields.io/badge/Frontend-React-blue)
![Express](https://img.shields.io/badge/Backend-Express.js-lightgrey)
![Stripe](https://img.shields.io/badge/Payment-Stripe-blueviolet)
![Google Maps](https://img.shields.io/badge/Maps-GoogleMaps-brightgreen)
![Hosting](https://img.shields.io/badge/Deployed-Render-green)

---

## 🧭 Key Features

- 🌆 **Smart City Detection** with Google Places API.
- 🗺️ **Dynamic Venue Routing** with time, category, and count.
- 👕 **Product Customization** (T-Shirts, Tank Tops, Hats) with color, size & quantity.
- 🛒 **Cart Preview** and live total updates.
- 💳 **Stripe Checkout Integration** with metadata tracking.
- 📄 **Downloadable Plan Summary** before checkout.
- 📱 **Responsive UI** built with Material UI and React Hooks.

---

## 🖼️ Screenshots

### 🏠 Home Page – Venue Selection
![Home Page](frontend/SS/Home.PNG)

### 📍 Route Planning
![Plan Page](frontend/SS/Plan.PNG)

### 👕 Product Customization & Cart
![Order Page](frontend/SS/Order.PNG)

### ✅ Final Review Before Checkout
![Review Page](frontend/SS/Review.PNG)

### 💳 Stripe Checkout
![Stripe Payment](frontend/SS/Stripe.jpg)

---

## 🛠 Tech Stack

| Layer     | Technologies                         |
|-----------|--------------------------------------|
| Frontend  | React.js, Vite, Material UI          |
| Backend   | Express.js (Node.js)                 |
| Maps      | Google Maps JavaScript API, Places API |
| Payment   | Stripe Checkout                      |
| Hosting   | Render (Frontend & Backend)          |

---

## 📂 Folder Structure

```

google-maps-night-planner/
├── backend/           # Express.js backend
│   └── server.js
├── frontend/          # React frontend
│   └── SS/            # Screenshots
│   └── pages/
│   └── components/
└── README.md

````

---

## ⚙️ Local Setup Instructions

1. **Clone Repository**

```bash
git clone https://github.com/hayatkhan20/google-maps-night-planner.git
cd google-maps-night-planner
````

2. **Install Frontend**

```bash
cd frontend
npm install
```

3. **Install Backend**

```bash
cd ../backend
npm install
```

4. **Run App Locally**

```bash
# In one terminal (backend)
cd backend
node server.js

# In another terminal (frontend)
cd frontend
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in `/backend`:

```env
STRIPE_SECRET_KEY=sk_test_******************
FRONTEND_URL=http://localhost:5173
```

---

## 👨‍💻 Developer

**Hayat Ullah Abid**
[GitHub](https://github.com/hayatkhan20)
[LinkedIn](https://www.linkedin.com/in/hayatullahabid)

---

## 📝 License

This project is open-sourced under the [MIT License](LICENSE).

```

---

Let me know if you want a `.md` file download or additions like deployment instructions for Render.
```
