![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)


# 🏥 Medixthon

> **An AI-Powered Full-Stack Hospital Management Platform built with the MERN Stack, Clerk Authentication, Gemini AI, Stripe, and Cloudinary.**

<p align="center">

<img src="https://img.shields.io/badge/MERN-FullStack-3DDC84?style=for-the-badge"/>
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge"/>
<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge"/>

</p>

---

## 📖 Overview

**Medixthon** is a modern AI-powered Hospital Management System designed to simplify healthcare workflows through secure authentication, intelligent AI features, online appointment booking, and efficient patient management.

The platform provides dedicated dashboards for **Admins**, **Doctors**, and **Patients**, enabling seamless appointment scheduling, medical record management, secure online payments, and AI-assisted healthcare services.

---

# ✨ Features

### 👨‍⚕️ Authentication & Roles

- Secure authentication with Clerk
- Role-Based Access Control
- Admin Dashboard
- Doctor Dashboard
- Patient Dashboard

---

### 📅 Appointment Management

- Book appointments online
- Appointment approval & cancellation
- Appointment history
- Doctor availability management
- Department-wise appointments

---

### 👨‍⚕️ Doctor Management

- Add/Edit/Delete Doctors
- Department Management
- Doctor Profiles
- Consultation Fees
- Availability Scheduling

---

### 👤 Patient Management

- Patient Registration
- Medical History
- Health Records
- Appointment Tracking
- Profile Management

---

### 🤖 AI Features

Powered by **Google Gemini AI**

- 🩺 Symptom Analyzer
- 💊 Medicine Scanner
- 📄 Lab Report Analyzer
- AI Health Assistant
- Smart Healthcare Recommendations

---

### 💳 Payments

- Secure Stripe Integration
- Online Appointment Payments
- Payment Status Tracking

---

### ☁ Cloud Storage

- Medical Report Upload
- Prescription Upload
- Cloudinary Image Storage
- Secure File Management

---

# 🛠 Tech Stack

## Frontend

- React.js
- Tailwind CSS
- Axios
- React Router

## Backend

- Node.js
- Express.js
- REST APIs

## Database

- MongoDB
- Mongoose

## Authentication

- Clerk

## AI

- Google Gemini API

## Payments

- Stripe

## Storage

- Cloudinary

## Tools

- Git
- GitHub
- Postman
- Vercel

---

# 🖼 Project Architecture

```
                React Frontend
                       │
                       │
                REST API Requests
                       │
                       ▼
              Express + Node.js
        ┌──────────┬───────────┐
        │          │           │
        ▼          ▼           ▼
    MongoDB     Gemini AI    Stripe
        │
        ▼
   Cloudinary Storage
```

---

# 📸 Screenshots

> Add screenshots here

| Home | Dashboard |
|------|-----------|
| Image | Image |

| AI Features | Appointment |
|-------------|-------------|
| Image | Image |

---

# 📂 Folder Structure

```
Medixthon
│
├── frontend
│   ├── components
│   ├── pages
│   ├── assets
│   └── context
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── config
│   └── utils
│
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/Medixthon.git
```

Go into the project

```bash
cd Medixthon
```

Install dependencies

```bash
npm install
```

Start Backend

```bash
npm run server
```

Start Frontend

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file

```env
MONGODB_URI=

CLERK_SECRET_KEY=
VITE_CLERK_PUBLISHABLE_KEY=

GEMINI_API_KEY=

STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# 🚀 Future Improvements

- Video Consultation
- AI Prescription Generator
- Email Notifications
- SMS Notifications
- Doctor Analytics Dashboard
- Electronic Health Records
- Admin Reports
- Mobile Application

---

# 👨‍💻 Author

**Nilesh Kumar**

📧 nileshkumar95559926@gmail.com

GitHub: https://github.com/NILESH2327

LinkedIn: https://www.linkedin.com/in/nilesh-kumar-51b3ba28b/

---

# ⭐ Support

If you found this project helpful,

⭐ Star this repository

🍴 Fork it

💙 Contribute to improve it.

---
