#Collaborative Whiteboard

A real-time collabrative whiteboard where multiple users can draw together simultaneously in shared rooms.

🔴 **Live Demo:** [collaborative-whiteboard-9zr3.vercel.app](https://collaborative-whiteboard-9zr3.vercel.app)


---
## Screenshots

<img width="1920" height="1080" alt="Screenshot (315)" src="https://github.com/user-attachments/assets/4adbf76e-d8f0-473c-913e-9f878d9ed32e" />
<img width="1920" height="1080" alt="Screenshot (316)" src="https://github.com/user-attachments/assets/e41ff61b-1cc0-4e88-aeeb-fb58a5154909" />

---

#Features
- 🎨 Real-time drawing sync across all users in a room
- 🖱️ Live cursor tracking with usernames
- 🚪 Room-based architecture — each room has unique URL
- 🔐 Authentication via Clerk
- 🔄 Auto reconnection with missed stroke recovery
- 🛠️ Toolbar with colors, brush sizes and eraser
- 📱 Works on desktop and mobile

---
#Tech Stack


**Frontend**
- Next.js 14, React, Tailwind CSS
- Konva.js for canvas rendering
- Socket.io client for real-time connection
- Clerk for authentication

**Backend**
- Node.js + Express
- Socket.io for WebSocket management
- Redis for write buffer and fast stroke storage
- MongoDB for canvas persistence

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

##Architecture
```
User draws stroke
      ↓
Socket.io emits 'draw' event to Node.js backend
      ↓
Backend writes stroke to Redis instantly (prevents data loss)
      ↓
Backend broadcasts to all users in same room
      ↓
Every 10 strokes → batch save to MongoDB
      ↓
On page refresh → load from MongoDB
On server crash → Redis preserves recent strokes
```
Frontend and backend are deployed separately because Vercel's 
serverless architecture does not support persistent WebSocket 
connections. Backend runs on Render as a dedicated Node.js server.

---
#Local Setup
**Prerequisites:** Node.js, MongoDB, Redis
**1. Clone the repo**
```bash
git clone https://github.com/Ayush975637/your-repo-name
cd collaborative-whiteboard
```
**2. Setup backend**
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

**3. Setup frontend**
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
**4. Open** `http://localhost:3000`
---

## Hard Problems Solved

**1. Canvas persistance on reconnect**
When a user reconnects after losing connection, sending the entire 
canvas again wastes bandwidth. I track the last stroke index on the 
client and emit it on rejoin — backend sends only missed strokes.

**2. Data loss on server crash**
In-memory roomStates are lost if server crashes. I implemented Redis 
as a write buffer — every stroke writes to Redis instantly before 
MongoDB. On restart, backend loads from Redis first then falls back 
to MongoDB.


**3. Websocket deployment**
Vercel doesn't support persistent connections. Separating frontend 
and backend into different deployment targets (Vercel + Render) 
solved this while keeping cold start times low.

---


## What I'd Improve
-[] Implement CRDT (Yjs) for proper conflict resolution instead of last-write-wins
-[] Add Redis Pub/Sub for horizontal scaling across multiple server instances
-[] Undo/redo functionality with operation history
-[] Export canvas as PNG
-[] Room access control (owner can lock room)

---

##Author 

**Ayush Aggrawal** -[GitHub](https://github.com/Ayush975637) · 
[LinkedIn](https://linkedin.com/in/ayush-aggrawal-6452a7358) · 
[LeetCode](https://leetcode.com/u/Ayush9756)





       



  
