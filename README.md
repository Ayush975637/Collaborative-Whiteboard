
# Collaborative Whiteboard

A real-time collaborative whiteboard where multiple users can draw together simultaneously in shared rooms.

🔴 **Live Demo:** [https://collaborative-whiteboard-9zr3.vercel.app](https://collaborative-whiteboard-9zr3.vercel.app)

---

## Screenshots

<img width="1920" height="1080" alt="Screenshot (346)" src="https://github.com/user-attachments/assets/9dd81600-f62a-4095-bf6a-246c62326c48" />
<img width="1920" height="1080" alt="Screenshot (335)" src="https://github.com/user-attachments/assets/ebc0677b-fc91-4a86-93ae-dd258722827e" />

<img width="1920" height="1080" alt="Screenshot (344)" src="https://github.com/user-attachments/assets/0ad971ae-bb85-41cd-a023-59ae8db92bc1" />
<img width="1920" height="1080" alt="Screenshot (345)" src="https://github.com/user-attachments/assets/fc8c39ee-fcc3-4245-93f4-d71b013e09b8" />




---

## Features

* 🎨 Real-time collaborative whiteboard
* ✏️ Freehand drawing (Pen tool)
* 🟥 Rectangle, 🟡 Circle, ↗️ Arrow, 💬 Text tools
* 🔄 Real-time element movement, resizing and rotation
* ❌ Delete selected elements
* ↩️ Undo / Redo
* 👥 Live cursor tracking with usernames
* 🚪 Room-based collaboration with unique shareable URLs
* 🔐 Authentication with Clerk
* 🔄 Auto reconnection with missed element recovery
* 💾 Canvas persistence using Redis + MongoDB
* 📤 Export canvas as an image
* 📱 Responsive interface for desktop and mobile
---

## Tech Stack

### Frontend

* Next.js 14, React, Tailwind CSS
* Konva.js for canvas rendering
* Socket.io client for real-time connection
* Clerk for authentication

### Backend

* Node.js + Express
* Socket.io for WebSocket management
* Redis for write buffer and fast stroke storage
* MongoDB for canvas persistence
* Zod for socket payload validation
### Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## Architecture

```
User creates or edits an element
            ↓
Socket.io emits operation to backend
            ↓
Backend updates in-memory room state
            ↓
Operation is written to Redis for fast recovery
            ↓
Backend broadcasts update to every connected client
            ↓
Dirty rooms are periodically synced to MongoDB
            ↓
On reconnect:
Redis → MongoDB fallback → missed element synchronization
```

Frontend and backend are deployed separately because Vercel's
serverless architecture does not support persistent WebSocket
connections. Backend runs on Render as a dedicated Node.js server.

---

## Local Setup

### Prerequisites

* Node.js
* MongoDB
* Redis

### 1. Clone the repo

```bash
git clone https://github.com/Ayush975637/your-repo-name
cd collaborative-whiteboard
```

### 2. Setup backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_redis_url
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

### 3. Setup frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

```bash
npm run dev
```

### 4. Open

```
http://localhost:3000
```

---

## Data Model

### Whiteboard Element

Each drawable object is stored as an element.

```json
{
  "id": "element-1",
  "type": "rect",
  "x": 120,
  "y": 180,
  "width": 150,
  "height": 80,
  "rotation": 25,
  "fill": "#ff6b6b"
}
```

Different element types (pen, rectangle, circle, arrow, text) store only the properties they require.
### Room Data Model

A room stores the full whiteboard state and participants.

```json
{
  "roomId": "ebeaf59c-19d2-4c88-834d-6177639f4b91",
  "name": "Design Session",
  "createdBy": {
    "userId": "u1",
    "name": "Ayush",
    "email": "ayush@example.com",
    "avatarUrl": "...",
    "joinedAt": "2026-04-25T10:00:00Z"
  },
  "users": [
    {
      "userId": "u1",
      "name": "Ayush"
    }
  ],
    "elements": [],
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Interesting Engineering Challenges

### 1. Efficient reconnect synchronization

Instead of sending the entire whiteboard every time a user reconnects, the client tracks its last received element index. The server sends only the missing operations, reducing bandwidth and reconnect time.

---

### 2. Reliable persistence

Active rooms are stored in memory for fast updates while every operation is immediately written to Redis. Dirty rooms are periodically synchronized to MongoDB, allowing recovery after server restarts.

---

### 3. Real-time collaborative editing

Creating elements is straightforward, but synchronizing movement, resizing, rotation and deletion required introducing dedicated socket events that update existing elements by ID across all connected clients.

---

### 4. Deployment with WebSockets

Since Vercel doesn't support long-lived WebSocket servers, the application uses a split deployment:

- Frontend → Vercel
- Backend → Render

allowing persistent Socket.io connections while keeping frontend deployment simple.

## Future Improvements

- [ ] CRDT/Yjs for conflict-free collaboration
- [ ] Redis Pub/Sub for horizontal scaling
- [ ] Element grouping
- [ ] Layers panel
- [ ] Image upload support
- [ ] Sticky notes
- [ ] Keyboard shortcuts
- [ ] Room permissions and owner controls
- [ ] Infinite canvas
- [ ] Version history

---



## Project Highlights

- Built a real-time collaborative whiteboard from scratch using Socket.io.
- Designed an element-based architecture supporting creation, movement, resizing, rotation and deletion.
- Implemented incremental synchronization so reconnecting users receive only missing updates.
- Used Redis as a write buffer to reduce data loss and improve recovery.
- Batched database writes to MongoDB to minimize unnecessary database operations.
- Added collaborative cursors and room presence tracking.
- Designed the application for future scalability with Redis Pub/Sub and CRDT support in mind.





## Author

**Ayush Aggrawal**

* GitHub: [https://github.com/Ayush975637](https://github.com/Ayush975637)
* LinkedIn: [https://linkedin.com/in/ayush-aggrawal-6452a7358](https://linkedin.com/in/ayush-aggrawal-6452a7358)
* LeetCode: [https://leetcode.com/u/Ayush9756](https://leetcode.com/u/Ayush9756)


       



  
