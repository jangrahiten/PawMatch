# PawMatch 🐾

A full-stack pet adoption platform that helps adopters discover pets, submit adoption requests, connect with shelters or owners, and communicate in real time.

PawMatch is designed as a modern, production-deployed application with role-based authentication, pet management, adoption workflows, image uploads, real-time messaging, and responsive UI.

## Live Demo

**Frontend:** https://paw-match-azure.vercel.app/

**Backend API:** https://pawmatch-7frk.onrender.com/

---

## Features

### Adopters
- Register and log in securely
- Browse available pets
- View detailed pet profiles
- Like and unlike pets
- Submit adoption requests
- Track adoption request status
- Withdraw pending requests
- Manage adopter profile and preferences
- Chat with shelters after an adoption request is accepted

### Shelters / Owners
- Create and manage pet listings
- Upload and remove pet images
- Edit pet details and availability status
- View incoming adoption requests
- Accept or reject requests
- Mark an adoption as completed
- Manage shelter profile information
- Chat with accepted adopters in real time

### Real-Time Messaging
- Socket.io-powered chat
- Typing indicators
- Unread message counts
- Conversation previews
- Live read receipts
- Reconnection handling
- Short-lived socket authentication tokens

### Authentication & Security
- JWT-based authentication
- HTTP-only authentication cookies
- Role-based route protection
- Short-lived JWTs for Socket.io authentication
- Password hashing with bcrypt
- Zod request validation
- Helmet security middleware
- Production CORS configuration

---

## Tech Stack

### Frontend
- Next.js
- React
- JavaScript
- Tailwind CSS
- Axios
- Socket.io Client
- React Toastify

### Backend
- Node.js
- Express.js
- Socket.io
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Zod
- Multer
- Cloudinary
- Helmet
- Morgan

### Infrastructure
- **Vercel** — Next.js frontend
- **Render** — Express + Socket.io backend
- **Neon** — PostgreSQL database
- **Cloudinary** — Pet image storage

---

## Architecture

```text
                   ┌──────────────────────┐
                   │       Browser        │
                   │  Desktop / Mobile    │
                   └──────────┬───────────┘
                              │
                    Next.js / REST requests
                              │
                              ▼
                   ┌──────────────────────┐
                   │       Vercel         │
                   │   Next.js Frontend   │
                   └──────────┬───────────┘
                              │
                     API proxy / rewrite
                              │
                              ▼
                   ┌──────────────────────┐
                   │       Render         │
                   │ Express + Socket.io  │
                   └───────┬──────┬───────┘
                           │      │
                       Prisma    Cloudinary
                           │      │
                           ▼      ▼
                  ┌────────────┐  Pet Images
                  │    Neon    │
                  │ PostgreSQL │
                  └────────────┘
```

REST API requests are proxied through the Next.js deployment so authentication cookies remain reliable across browsers and mobile devices.

Socket.io uses a short-lived token generated through the authenticated REST API, avoiding dependency on third-party cookies for real-time connections.

---

## Adoption Workflow

```text
Pet AVAILABLE
      │
      ▼
Adopter likes pet
      │
      ▼
Adopter submits request
      │
      ▼
Shelter reviews request
      │
      ├──────────────► REJECTED
      │
      ▼
   ACCEPTED
      │
      ▼
Pet becomes PENDING
      │
      ▼
Conversation enabled
      │
      ▼
Real-time chat
      │
      ▼
Shelter marks adoption complete
      │
      ▼
Pet becomes ADOPTED
```

When one request is accepted, other pending requests for the same pet are automatically rejected.

---

## Project Structure

```text
pet-adoption-platform/
│
├── client/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── messages/
│   │   ├── pets/
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.js
│   │   └── page.js
│   │
│   ├── components/
│   ├── lib/
│   │   ├── api.js
│   │   └── socket.js
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

## Database Models

The application uses Prisma with PostgreSQL.

Main models include:

- `User`
- `AdopterProfile`
- `ShelterProfile`
- `Pet`
- `PetImage`
- `Like`
- `AdoptionRequest`
- `Conversation`
- `Message`

### User Roles

```text
ADOPTER
SHELTER
OWNER
ADMIN
```

### Pet Status

```text
AVAILABLE
PENDING
ADOPTED
INACTIVE
```

### Adoption Request Status

```text
PENDING
ACCEPTED
REJECTED
CANCELLED
```

---

## API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/socket-token
```

### Pets

```http
POST   /api/pets
GET    /api/pets
GET    /api/pets/mine
GET    /api/pets/:id
PATCH  /api/pets/:id
DELETE /api/pets/:id

POST   /api/pets/:id/images
DELETE /api/pets/:petId/images/:imageId
```

### Likes

```http
POST   /api/likes/:petId
GET    /api/likes
DELETE /api/likes/:petId
```

### Adoption Requests

```http
POST  /api/adoptions/:petId
GET   /api/adoptions/mine
GET   /api/adoptions/received
PATCH /api/adoptions/:requestId/status
PATCH /api/adoptions/:requestId/complete
PATCH /api/adoptions/:requestId/cancel
```

### Profiles

```http
GET   /api/profile/me
PATCH /api/profile/adopter
PATCH /api/profile/shelter
```

### Conversations

```http
GET   /api/conversations
POST  /api/conversations/request/:requestId
GET   /api/conversations/:conversationId/messages
POST  /api/conversations/:conversationId/messages
PATCH /api/conversations/:conversationId/read
```

---

## Socket.io Events

### Client → Server

```text
join-conversation
leave-conversation
send-message
typing
stop-typing
mark-conversation-read
```

### Server → Client

```text
new-message
user-typing
user-stop-typing
conversation-unread-update
conversation-read-update
conversation-preview-update
socket-error
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd pet-adoption-platform
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE"
PORT=5000
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NODE_ENV="development"
```

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Optional demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
BACKEND_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

Start Next.js:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

---

## Production Environment

### Vercel

Frontend environment variables:

```env
BACKEND_URL="https://your-backend.onrender.com"
NEXT_PUBLIC_SOCKET_URL="https://your-backend.onrender.com"
```

### Render

Backend environment variables:

```env
DATABASE_URL="your-neon-postgresql-url"
JWT_SECRET="your-production-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="https://your-app.vercel.app"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NODE_ENV="production"
```

Recommended build command:

```bash
npm install && npx prisma generate
```

Recommended start command:

```bash
npm start
```

For production migrations:

```bash
npx prisma migrate deploy
```

---

## Authentication Design

PawMatch uses two related authentication flows.

### REST API Authentication

After login, the backend issues a JWT through an HTTP-only cookie.

```text
Login
  ↓
JWT created
  ↓
HTTP-only cookie
  ↓
Protected API requests
```

The frontend proxies REST API requests through its Next.js domain, improving cookie reliability across desktop and mobile browsers.

### Socket Authentication

The real-time connection does not directly depend on the login cookie.

Instead:

```text
Authenticated REST request
        ↓
GET /api/auth/socket-token
        ↓
Short-lived socket JWT
        ↓
Socket.io handshake
        ↓
Backend verifies token
        ↓
Authenticated real-time connection
```

The temporary socket token is kept in memory and is not stored in localStorage.

---

## Image Uploads

Pet images are uploaded through Multer using memory storage and then stored on Cloudinary.

The application supports:

- Multiple images per pet
- Image deletion
- Cloudinary `publicId` tracking
- Maximum image count validation
- File-size validation
- Image MIME-type validation

---

## Validation & Error Handling

PawMatch uses Zod schemas to validate incoming requests for:

- Authentication
- Pet creation and updates
- Profiles
- Adoption requests
- Messages

Reusable validation middleware prevents invalid data from reaching service logic.

---

## Responsive Design

The interface is designed for both desktop and mobile usage.

Key UI features include:

- Responsive navigation
- Pet card grids
- Interactive image galleries
- Mobile-friendly forms
- Status badges
- Confirmation modals
- Toast notifications
- Loading states
- Empty states
- Responsive chat layout

---

## Future Improvements

- Google OAuth
- Advanced pet recommendations
- Location-based pet discovery
- Email or push notifications
- Shelter verification workflow
- Admin dashboard
- Saved search filters
- Adoption analytics
- Custom production domain
- Automated testing
- CI/CD checks
- Rate limiting

---

## Key Engineering Challenges

Some of the more interesting problems solved while building PawMatch include:

- Designing a multi-role authentication and authorization system
- Creating a complete adoption lifecycle instead of simple CRUD
- Preventing conflicting adoption requests using database transactions
- Implementing real-time messaging with read receipts and typing indicators
- Authenticating Socket.io independently of cross-site cookies
- Making authentication reliable across mobile and desktop production environments
- Managing images in Cloudinary while keeping database metadata synchronized
- Deploying a monorepo across multiple cloud services

---

## Author

**Hiten Jangra**

Electrical Engineering @ Delhi Technological University  
Minor in Computer Science

---

## License

This project is intended for educational and portfolio purposes.

You can add an open-source license such as MIT if you plan to allow reuse or redistribution.
