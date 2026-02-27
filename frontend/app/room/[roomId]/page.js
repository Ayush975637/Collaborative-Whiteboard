
import Whiteboard from "../../../components/whiteboard";

export default async function RoomPage({ params }) {
  const { roomId } = await params
  


  return (
    <main className="w-screen h-screen overflow-hidden">

      <Whiteboard roomId={roomId} />
    </main>
  )
}