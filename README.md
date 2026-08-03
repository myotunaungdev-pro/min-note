# ⚡ MIN NOTE

A stunning, production-ready premium SaaS note-taking workspace built on the **MERN Stack** (MongoDB, Express, React, Node.js). Engineered with a fanatical focus on pixel-perfect UI/UX, fluid animations, and highly performant state management, this application serves as a masterclass in modern frontend architecture, premium dark-mode aesthetics, and robust SaaS integrations.

---

## ✨ Key Features

Our note-taking application is packed with robust features designed for both power users and minimalists, now elevated with powerful premium SaaS capabilities.

### 💼 Premium SaaS Experience (Free vs. Pro)
- **Free Tier:** Experience the core of MIN NOTE with essential note-taking, rich text editing, standard themes, and basic categorization.
- **Pro Tier:** Unlock the ultimate productivity workspace. Pro users gain access to exclusive premium card designs, advanced OCR capabilities, unlimited note storage, and priority support. 
- **Stripe Integration:** A seamless, highly secure subscription flow powered by Stripe. Features a fully integrated Checkout flow, dedicated webhook listeners for real-time subscription state synchronization, and bespoke Payment Success / Cancel redirection routing.

### 👁️ Advanced OCR Capabilities
- **Optical Character Recognition:** Extract text directly from images uploaded to your notes. Powered by cutting-edge OCR technology, this feature allows you to digitize physical documents, receipts, and whiteboard snapshots instantly (Pro feature).

### 📝 Core Functionalities (CRUD)
- **Create & Edit:** Write notes seamlessly with a fully integrated Rich Text Editor (`react-quill-new`), supporting complex formatting and inline images.
- **Archive & Restore:** Declutter your workspace by sending completed or idle notes to the Archive. Easily restore them at any time.
- **Trash & Permanent Delete:** Safely move items to a Trash bin before permanently destroying them, providing a safety net for accidental clicks.
- **Bulk Operations:** Engineered a robust bulk-selection engine. Users can individually toggle or mass-select notes to execute batch API payloads (Archive, Trash, Restore) with instantaneous optimistic UI updates.

### 🎨 Custom Note Card Designs
Personalize your workspace layout instantly with beautifully crafted, interactive card themes.
- **Cyber Design (Pro):** A futuristic, glassmorphic layout featuring a locked 220px grid track, neon accent glows (`#00d4aa`), strict text constraints, and a cleanly docked action bar.
- **Dynamic 3D Design:** An immersive card utilizing perspective transforms and cubic-bezier animations for a deeply tactile hover experience.
- **Minimal Design:** A clean, distraction-free card layout for maximum readability.

### 📐 Responsive UI & Layout Architecture
- **Fluid CSS Grid:** Implements a highly robust CSS Grid system (`repeat(auto-fill, minmax)`) fortified with strict constraints to guarantee note cards never stretch unnaturally. Beautifully scales from 4-column ultra-wide monitors down to a perfect 1-column mobile stack.
- **Premium Glassmorphism & Animations:** Leverages `react-confetti` and custom CSS keyframes (like `magicalSlideUp`) for stunning, celebratory UI elements, particularly in the Payment Success flows.
- **High-Performance DOM Manipulation:** 60FPS Drag-to-Resize Sidebar bypasses standard React state-driven re-renders during drag operations.

### 🌐 Dynamic Localization (i18n)
- **Multi-Language Support:** Flawlessly localizes the entire workspace across three distinct languages: **English**, **Burmese**, and **Thai**.
- **Instant Translation:** Powered by `i18next` and `react-i18next`, language toggles apply translations dynamically across the entire UI without requiring a page reload.

---

## 🛠️ Tech Stack

### Frontend Engineering
- **React 19** (Functional Components, Custom Hooks)
- **Redux Toolkit** (Global State, Slices, Thunks)
- **React Router DOM v7** (Client-side Routing)
- **Vanilla CSS3** (Custom Modules, CSS Variables, Advanced Grid/Flexbox)
- **i18next / react-i18next** (Dynamic Multi-Language Localization)
- **React Quill New** (Rich Text Editor)
- **DOMPurify** (Secure HTML Sanitization)
- **React Confetti** (Premium UI celebratory effects)

### Backend Architecture & Integrations
- **Node.js & Express.js** (RESTful API Design)
- **MongoDB & Mongoose** (Schema modeling, Cloud Atlas)
- **Stripe API** (Payment processing, Subscription management, Webhooks)

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites
- Node.js (v18+ recommended)
- A running MongoDB instance or a MongoDB Atlas connection string.
- A Stripe Developer Account (for obtaining publishable and secret keys).

### 1. Clone the Repository
```bash
git clone https://github.com/myotunaungdev-pro/min-note.git
cd min-note
```

### 2. Configure the Backend
Initialize the Node server and connect the database.
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory and add your required keys:
```env
# Server
PORT=8000

# Database
MONGO_URI=your_mongodb_connection_string

# Stripe Integrations
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:3000
```
Boot the server:
```bash
npm run dev
```

### 3. Configure the Frontend
In a new terminal window, spin up the React application.
```bash
cd frontend
npm install --legacy-peer-deps
```

```bash
npm start
```

### 4. Launch the App
The application will automatically ignite at `http://localhost:3000` and seamlessly interface with your backend running on port `8000`.

---
*Built with ❤️ focusing on premium user experiences, robust software architecture, and seamless SaaS integration.*