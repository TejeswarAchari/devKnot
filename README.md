# DEVKNOT — BACKEND

Secure, scalable, real-time API powering DevKnot collaboration & chat.

<p align="center">
  <img src="https://img.shields.io/github/last-commit/TejeswarAchari/devKnot?style=flat-square" />
  <img src="https://img.shields.io/github/languages/top/TejeswarAchari/devKnot?style=flat-square" />
  <img src="https://img.shields.io/github/languages/count/TejeswarAchari/devKnot?style=flat-square" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=flat-square" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Nodemon-76D04B?style=flat-square&logo=nodemon&logoColor=white" />
</p>

---

## 🌐 About

This repository is the **backend API** for DevKnot — the platform where developers swipe to match collaborators and chat in real time.

It provides:

- 🔐 Secure authentication using **JWT in HTTP-only cookies**
- 👤 User profile & tech-stack storage  
- 🔁 Match requests & acceptance system  
- 💬 **Realtime chat via Socket.io**
- 📡 REST API for the DevKnot frontend

---

## 🚀 Tech Stack

| Layer       | Technology |
|------------|-------------|
| Runtime    | Node.js |
| Framework  | Express.js |
| Realtime   | Socket.io |
| Database   | MongoDB Atlas + Mongoose |
| Auth       | JWT (HTTP-only cookie) |
| Deployment | Render |

---

## 📦 Getting Started (Local Development)

### 1️⃣ Clone & install

git clone https://github.com/TejeswarAchari/devKnot.git  
cd devKnot  
npm install

### 2️⃣ Add `.env` in root

MONGODB_URI=mongodb+srv://<your-atlas-url>/devKnot  
JWT_SECRET_KEY=Your Secret Key  
PORT=7777  
CLIENT_ORIGIN=http://localhost:5173  
NODE_ENV=development

> Never commit `.env` to GitHub.

### 3️⃣ Start backend

npm run dev

API now runs at:

http://localhost:7777

---

## 🔗 Frontend Connection

The frontend (`devKnot-web`) automatically connects to the backend using:

| Website opened | Backend used |
|----------------|--------------|
| http://localhost:5173 | http://localhost:7777 |
| https://devknot.in | https://devknot-backend.onrender.com |

No manual switching required.

---

## 📌 Production Deployment

This backend is hosted on **Render**:

🔗 https://devknot-backend.onrender.com

Render Environment Variables:

MONGODB_URI=...  
JWT_SECRET_KEY=Your Secret key  
PORT=7777  
CLIENT_ORIGIN=https://devknot.in  
NODE_ENV=production

---

## 🧪 Testing (expected success points)

If backend is running properly:

- `/auth/*` → returns login/register responses  
- `/profile/*` → fetch & update profile  
- `/feed` → returns list of recommended users  
- Socket.io → connects without CORS issues  
- Cookies show inside browser → Application → Cookies

---

## 📁 Folder Structure (High-Level)

src/  
├─ config/  
├─ controllers/  
├─ middlewares/  
├─ models/  
├─ routes/  
├─ services/  
├─ utils/  
└─ app.js

---

## 🤝 Contribution

Pull requests are welcome!  
For major changes, start a feature branch:

git checkout -b feature/your-feature-name

Then open a PR.

---

🧡 **Backend built with scalability & realtime collaboration in mind.**
