
import socket from 'socket.io-client'

//connection representation client and server
let socketinstance=null;

export const intializeSocket=()=>{

    socketinstance=socket(import.meta.env.VITE_API_URL,{
        auth:{
            token:localStorage.getItem('token')

        }
    });
    return socketinstance;
}

export const recieveMessage=(eventName,cb)=>{
    socketinstance.on(eventName,cb)
}

export const sendMessage=(eventName,cb)=>{
    socketinstance.emit(eventName,data)
}