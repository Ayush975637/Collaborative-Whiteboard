import {io,Socket} from 'socket.io-client'

let socket:Socket | null = null
export const getSocket=()=>{
if(!socket){
    socket=io(process.env.NEXT_PUBLIC_BACKEND_URL!,{
        transports:['websocket'],
         reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('disconnected:', reason)
    })

    socket.on('reconnect', (attempt) => {
      console.log('reconnected after', attempt, 'attempts')
    })

    socket.on('reconnect_failed', () => {
      console.log('reconnection failed')
    })
}

return socket

}