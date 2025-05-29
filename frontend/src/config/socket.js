
import socket from 'socket.io-client'

//connection representation client and server
let socketinstance=null;

export const intializeSocket=(projectId)=>{
    console.log("Initializing socket for project:", projectId);

    socketinstance=socket(import.meta.env.VITE_API_URL,{
        auth:{
            //iske wajah se authenticate banda hi connect ho payega
            token:localStorage.getItem('token')

        },
        query:{
            projectId:projectId
        },
        
    });
    return socketinstance;
}

export const receiveMessage = (eventName, cb) => {
    if (!socketinstance) {
        throw new Error("Socket not initialized. Call intializeSocket first.");
    }
    socketinstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
    if (!socketinstance) {
        throw new Error("Socket not initialized. Call intializeSocket first.");
    }
    socketinstance.emit(eventName, data);
}