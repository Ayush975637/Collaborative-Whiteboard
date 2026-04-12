// lib/api.js  — reusable fetch function
export async function getRoomUsers(roomId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/${roomId}/users`
  )

  if (!res.ok) throw new Error('Failed to fetch users')

  return res.json()
}