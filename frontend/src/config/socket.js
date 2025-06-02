
import socket from 'socket.io-client'

//connection representation client and server
let socketInstance = null;

export const initializeSocket = (projectId) => {
    console.log("Initializing socket for project:", projectId);

    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            //iske wajah se authenticate banda hi connect ho payega
            token: localStorage.getItem('token')

        },
        query: {
            projectId: projectId
        },

    });
    return socketInstance;
}

export const receiveMessage = (eventName, cb) => {
    if (!socketInstance) {
        throw new Error("Socket not initialized. Call intializeSocket first.");
    }
    socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
    if (!socketInstance) {
        throw new Error("Socket not initialized. Call intializeSocket first.");
    }
    socketInstance.emit(eventName, data);
}