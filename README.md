# 🚆 RailGo Testing Platform

> Simulasi platform booking tiket kereta untuk pembelajaran **QA Manual Testing** dan **Automation Testing** menggunakan Katalon Studio.

---

## 📋 Daftar Isi

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Prerequisites](#prerequisites)
- [Instalasi Manual (Tanpa Docker)](#instalasi-manual-tanpa-docker)
- [Instalasi dengan Docker](#instalasi-dengan-docker)
- [Environment Variables](#environment-variables)
- [Akun Demo](#akun-demo)
- [Fitur Aplikasi](#fitur-aplikasi)
- [QA Sandbox](#qa-sandbox)
- [Testing dengan Katalon Studio](#testing-dengan-katalon-studio)

---

## Overview

RailGo Testing Platform adalah aplikasi fullstack simulasi pemesanan tiket kereta api yang dirancang khusus sebagai media pembelajaran QA Testing. Aplikasi ini memiliki:

- ✅ Struktur elemen yang ramah automation (ID unik, data-testid, name attribute)
- ✅ Skenario positif & negatif yang lengkap
- ✅ QA Sandbox berisi simulasi bug dan edge cases
- ✅ API RESTful untuk API Testing
- ✅ 20 Manual Test Case siap pakai

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React.js 18, TailwindCSS, Axios, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| Auth | JWT (JSON Web Token) |
| Notification | React Hot Toast |
| Container | Docker & Docker Compose |

---

## Struktur Folder

```
railgo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, Login, Me
│   │   │   ├── bookingController.js # CRUD booking
│   │   │   ├── paymentController.js # Submit & get payment
│   │   │   └── ticketController.js  # Search train schedules
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification
│   │   ├── routes/
│   │   │   └── index.js             # All API routes + QA sandbox
│   │   └── server.js                # Express app entry point
│   ├── database/
│   │   ├── migrations/
│   │   │   └── schema.sql           # Table definitions
│   │   └── seeds/
│   │       └── seed.js              # Dummy data seeder
│   ├── uploads/                     # Payment proof uploads
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.js
│   │   │   │   └── Skeleton.js
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.js
│   │   │       ├── Navbar.js
│   │   │       └── Sidebar.js
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── SchedulePage.js
│   │   │   ├── BookingPage.js
│   │   │   ├── PaymentPage.js
│   │   │   ├── MyTicketsPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── QASandboxPage.js
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + API calls
│   │   ├── styles/
│   │   │   └── index.css            # Tailwind + custom classes
│   │   ├── App.js
│   │   └── index.js
│   ├── .gitignore
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── docs/
│   ├── api_documentation.md         # Full API docs
│   └── test_cases.md                # 20 manual test cases
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

Pastikan sudah terinstall:

| Tool | Versi Minimum | Cek |
|------|--------------|-----|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| MySQL | 8.0 | `mysql --version` |
| Git | Any | `git --version` |
| Docker (opsional) | 20.x | `docker -v` |

---

## Instalasi Manual (Tanpa Docker)

### 1. Clone Repository

```bash
git clone https://github.com/yourname/railgo-testing-platform.git
cd railgo-testing-platform
```

### 2. Setup Database

Buka MySQL client dan jalankan:

```sql
CREATE DATABASE railgo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'railgo_user'@'localhost' IDENTIFIED BY 'railgo_pass';
GRANT ALL PRIVILEGES ON railgo_db.* TO 'railgo_user'@'localhost';
FLUSH PRIVILEGES;
```

Import schema:

```bash
mysql -u railgo_user -p railgo_db < backend/database/migrations/schema.sql
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
```

Edit file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=railgo_user
DB_PASSWORD=railgo_pass
DB_NAME=railgo_db
JWT_SECRET=railgo_super_secret_jwt_key_2024
FRONTEND_URL=http://localhost:3000
```

Buat folder uploads:

```bash
mkdir -p uploads
```

Jalankan seeder untuk dummy data:

```bash
node database/seeds/seed.js
```

Output yang diharapkan:
```
✅ Seeder completed successfully!
📊 Created: 4 users, 17 train schedules, 4 bookings, 4 passengers, 4 payments
```

Jalankan backend:

```bash
npm start
# atau untuk development dengan auto-reload:
npm run dev
```

Backend berjalan di: `http://localhost:5000`

Verifikasi dengan membuka: `http://localhost:5000/health`

### 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend

# Install dependencies
npm install

# Buat file .env.local (opsional, default sudah localhost:5000)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Jalankan frontend
npm start
```

Frontend berjalan di: `http://localhost:3000`

### 5. Verifikasi

Buka browser ke `http://localhost:3000` dan login dengan:
- **Email:** `test@railgo.com`
- **Password:** `RailGo123`

---

## Instalasi dengan Docker

### 1. Pastikan Docker & Docker Compose terinstall

```bash
docker -v          # Docker version 20.x.x
docker compose version  # Docker Compose version v2.x.x
```

### 2. Clone dan jalankan

```bash
git clone https://github.com/yourname/railgo-testing-platform.git
cd railgo-testing-platform

# Build dan jalankan semua service
docker compose up --build
```

Tunggu hingga semua container ready (±2 menit pertama kali).

### 3. Jalankan seeder

Setelah container berjalan:

```bash
docker exec railgo_backend node database/seeds/seed.js
```

### 4. Akses aplikasi

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

### Perintah Docker berguna:

```bash
# Lihat logs
docker compose logs -f

# Stop semua service
docker compose down

# Stop + hapus volume (reset database)
docker compose down -v

# Restart service tertentu
docker compose restart backend
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Default | Keterangan |
|----------|---------|------------|
| `PORT` | `5000` | Port backend server |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `railgo_user` | MySQL username |
| `DB_PASSWORD` | `railgo_pass` | MySQL password |
| `DB_NAME` | `railgo_db` | Nama database |
| `JWT_SECRET` | — | Secret key JWT (wajib diisi) |
| `FRONTEND_URL` | `http://localhost:3000` | Untuk CORS |

### Frontend (`.env.local`)

| Variable | Default | Keterangan |
|----------|---------|------------|
| `REACT_APP_API_URL` | `http://localhost:5000/api` | Base URL API backend |

---

## Akun Demo

### User Biasa
| Field | Value |
|-------|-------|
| Email | `test@railgo.com` |
| Password | `RailGo123` |

### Admin
| Field | Value |
|-------|-------|
| Email | `admin@railgo.com` |
| Password | `Admin123!` |

### Akun Tambahan (dari seeder)
| Email | Password |
|-------|----------|
| `budi@example.com` | `Budi1234` |
| `siti@example.com` | `Siti1234` |

---

## Fitur Aplikasi

### 🏠 Landing Page
- Hero section dengan CTA
- Features highlight
- Navbar responsif
- Footer

### 🔐 Authentication
- **Register:** Validasi lengkap (email format, password min 8 char, konfirmasi password, duplikasi email)
- **Login:** JWT session, remember me, show/hide password
- **Forgot Password:** Dummy page dengan skenario testing

### 📊 Dashboard
- Statistik booking user
- Shortcut quick booking
- Tabel transaksi terkini

### 🎫 Booking Tiket
- Cari kereta (origin, destination, tanggal, kelas)
- Filter dan sort hasil
- Seleksi kursi interaktif
- Passenger form
- Loading skeleton

### 💳 Pembayaran
- 3 metode pembayaran (Bank Transfer, E-Wallet, Credit Card)
- Upload bukti pembayaran
- Countdown timer (1 jam)
- Status tracking

### 🎟 My Tickets
- Filter by status (All / Confirmed / Pending / Cancelled)
- Detail tiket dengan QR dummy
- Download PDF
- Cancel booking

### 👤 Profile
- Data user
- Ganti password (dummy)

---

## QA Sandbox

Halaman `/sandbox` berisi tools khusus untuk latihan automation:

| Scenario | Path | Deskripsi |
|----------|------|-----------|
| Broken Validation | `/sandbox` | Form tanpa validasi benar |
| Slow Response | `/sandbox` | API delay 3 detik |
| Infinite Loading | `/sandbox` | Request tidak pernah selesai |
| Random Fail | `/sandbox` | 50% chance gagal |
| Disabled Button | `/sandbox` | Button tidak bisa diklik |
| Hidden Button | `/sandbox` | Button tersembunyi |
| Duplicate Submit | `/sandbox` | Selalu 409 Conflict |
| Session Expired | `/sandbox` | Selalu 401 Unauthorized |
| All Input Types | `/sandbox` | Radio, Checkbox, Select, File, Range, dll |

---

## Testing dengan Katalon Studio

### Setup Katalon

1. Download Katalon Studio dari [katalon.com](https://katalon.com)
2. Buat project baru: **Web UI Testing**
3. Set Base URL: `http://localhost:3000`

### Selector Reference

Semua elemen memiliki atribut berikut untuk memudahkan automation:

```html
<!-- Input fields -->
<input id="email-login" name="email" data-testid="email-input" />
<input id="password-login" name="password" data-testid="password-input" />

<!-- Buttons -->
<button id="btn-login" data-testid="login-button">Login</button>
<button id="btn-register" data-testid="register-button">Register</button>
<button id="btn-book-now" data-testid="book-now-button">Book Now</button>
```

### Cara Menulis Test di Katalon (Groovy)

```groovy
// Login test
WebUI.openBrowser('http://localhost:3000/login')
WebUI.setText(findTestObject('Object Repository/LoginPage/input_email'), 'test@railgo.com')
WebUI.setText(findTestObject('Object Repository/LoginPage/input_password'), 'RailGo123')
WebUI.click(findTestObject('Object Repository/LoginPage/btn_login'))
WebUI.waitForElementPresent(findTestObject('Object Repository/Dashboard/text_welcome'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard/text_welcome'), 10)
```

### XPath Examples

```xpath
// By ID
//*[@id="email-login"]

// By data-testid
//*[@data-testid="login-button"]

// By name
//input[@name="email"]

// By text content
//button[text()="Login"]

// Nested (form > input)
//form[@id="login-form"]//input[@name="email"]
```

### API Testing di Katalon

```groovy
// Test login API
def response = WS.sendRequest(findTestObject('API/Auth/POST_login'))
WS.verifyResponseStatusCode(response, 200)

def responseBody = new groovy.json.JsonSlurper().parseText(response.getResponseText())
assert responseBody.success == true
assert responseBody.data.token != null
```

---

## Scripts

### Backend

```bash
npm start        # Production mode
npm run dev      # Development mode (nodemon)
```

### Frontend

```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

### Database

```bash
# Jalankan seeder
node backend/database/seeds/seed.js

# Import ulang schema
mysql -u railgo_user -p railgo_db < backend/database/migrations/schema.sql
```

---

## Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan MySQL service berjalan: `sudo service mysql start`
- Cek kredensial di `.env`
- Pastikan user MySQL sudah dibuat dan diberi privilege

### Frontend tidak bisa fetch API
- Pastikan backend berjalan di port 5000
- Cek `REACT_APP_API_URL` di `.env.local`
- Pastikan tidak ada CORS error di browser console

### Seeder gagal
- Pastikan schema sudah diimport terlebih dahulu
- Cek koneksi database di `.env`

### Port sudah digunakan
```bash
# Cek proses yang menggunakan port
lsof -i :3000
lsof -i :5000

# Kill proses
kill -9 <PID>
```

---

## Lisensi

Proyek ini dibuat untuk tujuan pembelajaran. Bebas digunakan untuk keperluan edukasi.

---

**RailGo Testing Platform** — *Built for QA Learning* 🚆
