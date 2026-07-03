# 🏠 RentFlatmate AI — Find Your Flatmate with AI Precision

**RentFlatmate AI** is a next-generation rental matching platform that connects tenants to property listings and potential flatmates through intelligent compatibility scoring, real-time Socket.IO chat, and streamlined interest request workflows.

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| **🔐 Role-Based Auth** | Tenant, Owner, and Admin accounts authenticated via secure HTTP-Only JWT tokens (access + refresh token rotation). |
| **🏘️ Room Listings** | Full CRUD for listing flats/rooms with multiple image uploads, furnishing details, and amenity tagging. |
| **🤖 AI Compatibility Scoring** | Dynamic compatibility analysis powered by Google Gemini API, with automatic fallback to a deterministic local rule-based match engine. |
| **🎯 Ranked Recommendations** | Custom landing grids ranking available listings based on active compatibility scoring custom-tailored to the tenant's preferences. |
| **💬 Real-Time Chat** | Bidirectional Socket.IO private chat rooms, created automatically once an owner accepts a tenant's interest. |
| **📩 Email & System Notifications** | Instant alerts and transactional HTML emails when interest states change, or new chat messages arrive. |
| **🌗 Custom Glassmorphism Theme** | Modern dark-mode neon theme featuring interactive shader backgrounds, liquid-smooth animations, and glass panels. |
| **🛡️ Admin Moderation** | Full oversight system to manage, audit, and block spam users or listings instantly. |

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Next.js Frontend (React 19)"]
        UI["UI Pages & Components"]
        AuthCtx["Auth Context (JWT Storage)"]
        SocketCtx["Socket Context (Socket.IO Client)"]
    end

    subgraph Server ["Express.js Backend"]
        API["REST Router (Express)"]
        SocketServer["Socket.IO Server"]
        Midd["Auth & Role Middlewares"]
        AI_Eng["Gemini AI Matching Engine"]
    end

    subgraph Data ["Data Layer"]
        DB[(PostgreSQL Database)]
        ORM[Prisma Client]
    end

    UI -->|HTTPS Requests| API
    UI <-->|WebSocket Connection| SocketServer
    
    API --> Midd
    Midd --> ORM
    AI_Eng --> ORM
    
    ORM <--> DB
    AI_Eng -->|Prompt Analysis| GeminiAPI["Google Gemini API"]
```

---

## 🔄 Request Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant Gate as API Gateway / Router
    participant Auth as Auth Middleware (JWT)
    participant Ctrl as Route Controller
    participant DB as Prisma / Database
    
    Client->{Gate}: HTTP POST /api/listings (Headers: Authorization Bearer JWT)
    Gate->>Auth: Verify JWT & User Role
    alt Token Invalid / Expired
        Auth-->>Client: HTTP 401 Unauthorized
    else Role Mismatch (e.g. Tenant posting listing)
        Auth-->>Client: HTTP 403 Forbidden
    end
    Auth->>Ctrl: Call next() with req.user context
    Ctrl->>Ctrl: Validate Request Body (Schema check)
    Ctrl->>DB: Prisma query to store/retrieve data
    DB-->>Ctrl: Returns database records
    Ctrl-->>Client: HTTP 200/201 JSON Response
```

---

## 🔗 Interest → Chat Flow

```mermaid
graph TD
    Start([Tenant views Listing]) --> Action[Tenant clicks 'Send Interest']
    Action --> API_Interest[POST /api/interests]
    API_Interest --> DB_Interest[(Save Interest state: PENDING)]
    DB_Interest --> Realtime_Emit[Socket.IO: Emit notification to Owner]
    Realtime_Emit --> Notification[Owner receives toast/badge alert in Real-time]
    
    Notification --> Owner_Action{Owner reviews Tenant profile}
    Owner_Action -- Reject --> Reject_State[Set Interest state: REJECTED]
    Owner_Action -- Accept --> Accept_State[Set Interest state: ACCEPTED]
    
    Accept_State --> Create_Room[Create/Find Socket.IO Chat Room in DB]
    Create_Room --> Socket_Join[Emit join_room to Tenant & Owner]
    Socket_Join --> Chat_Open[Open chat window for instant messaging]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js 20, Express.js |
| **Database & ORM** | PostgreSQL + Prisma Client |
| **Authentication** | JWT (Access + Refresh tokens), bcryptjs |
| **AI Orchestrator** | Google Gemini (1.5 Flash) via API, fallback rule-based matching engine |
| **Real-time Comms** | Socket.IO (WebSockets with polling fallback) |
| **Images & Media** | Cloudinary (multipart photo uploads via Multer) |
| **Frontend UI** | Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, Three.js / OGL |

---

## 📁 Project Structure

```
rentflatmate/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Prisma schema & PostgreSQL relations
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Prisma client exporter
│   │   ├── controllers/           # Route logic (auth, listing, tenant, chat, compatibility)
│   │   ├── middleware/            # JWT validator, role guards, error handlers
│   │   ├── routes/                # REST endpoints
│   │   ├── services/              # Gemini API integrations & local match fallback engine
│   │   ├── sockets/               # Socket.IO connection & typing handlers
│   │   └── utils/                 # Helpers (emails, tokens)
│   ├── app.js                     # Express application configurations
│   └── server.js                  # App bootstrap and Socket.IO listener
│
└── frontend/
    ├── app/                       # Next.js App Router (Layouts & Pages)
    │   ├── admin/                 # Admin operations dashboard
    │   ├── auth/                  # Login, register, and reset passwords
    │   ├── owner/                 # Owner panel, listings creator
    │   └── tenant/                # Listings explorer, match recommendations
    ├── components/                # Glassmorphic panels, map visualizations, shaders
    │   ├── navbar/
    │   └── ui/
    ├── context/                   # Context states (Auth, Sockets, Theme)
    └── globals.css                # CSS variables, fonts, glassmorphism tokens
```

---

## 🚀 Quick Start

### Prerequisites
* Node.js 18+ installed
* PostgreSQL instance running locally or hosted on Neon
* Google Gemini API Key

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/rentflatmate.git
cd rentflatmate

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require
JWT_SECRET=super_random_jwt_secret_key_string
JWT_REFRESH_SECRET=another_super_random_refresh_token_secret_key
AI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM="RentFlatmate AI <no-reply@rentflatmate.com>"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 3. Setup Database & Prisma Client
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Run Locally
```bash
# Terminal 1: Start Express API & Socket.IO (http://localhost:3000)
cd backend
npm run dev

# Terminal 2: Start Next.js Development Server (http://localhost:3001)
cd frontend
npm run dev
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create owner or tenant profile.
* `POST /api/auth/login` - Authenticate credentials and return JWT tokens.
* `POST /api/auth/refresh` - Rotate access tokens using refresh tokens.
* `POST /api/auth/forgot-password` - Request verification link for resetting password.
* `POST /api/auth/reset-password` - Reset account password with token.

### Property Listings (`/api/listings` & `/api/owner`)
* `GET /api/listings` - Search and filter active rooms/apartments.
* `GET /api/listings/:id` - Fetch single listing with photos and specs.
* `POST /api/owner/listings` - Create new listing (Owner only).
* `PATCH /api/owner/listings/:id` - Modify listing details (Owner only).
* `DELETE /api/owner/listings/:id` - Soft-delete listing (Owner only).
* `POST /api/owner/listings/:id/images` - Upload listing photos to Cloudinary.

### Tenant Profile (`/api/tenant`)
* `GET /api/tenant/preferences` - Retrieve user profile preferences.
* `PATCH /api/tenant/preferences` - Update budgets, locations, bio, and habits.
* `GET /api/tenant/favorites` - Retrieve saved bookmarks.

### AI Engine (`/api/ai/compatibility`)
* `GET /api/ai/compatibility/:listingId` - Return matching score and Gemini explanation.
* `GET /api/ai/compatibility/sort/all` - Fetch listings sorted by highest matching score.

### Interests (`/api/interests`)
* `POST /api/interests/:listingId` - (Tenant) Express matching interest.
* `PATCH /api/interests/:id/accept` - (Owner) Accept interest request (enables Chat).
* `PATCH /api/interests/:id/reject` - (Owner) Reject interest request.

---

## 🤖 LLM Compatibility Engine

### Prompt Blueprint
```
You are a rental compatibility expert. Given a tenant profile and a room listing,
calculate a compatibility score between 0 and 100.

Consider these factors:
- Budget alignment (tenant's min/max budget vs listing rent)
- Location preference match
- Move-in date vs listing availability
- Room type and furnishing preferences

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "explanation": "<2-3 sentence explanation of the score>"
}
```

### Deterministic Fallback Rules
If LLM API timeouts or limits are reached, the platform switches to a local rule service:
* **Budget Alignment (60 pts):** Direct matching points within minimum-maximum budget boundaries.
* **Location Match (40 pts):** Exact matching or substring intersection score between desired locations.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
