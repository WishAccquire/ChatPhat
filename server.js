import http from 'http'
import app from './app.js'
import  'dotenv/config'
import { Server } from "socket.io";
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import Project from './models/project.model.js';

const server=http.createServer(app);


const io = new Server(server,{
    //if we not use this it will get blocked by cors policy and our frontend part will not connect
    cors:{
        origin:'*'
    }
});
io.use(async(socket,next)=>{
    try{
      //on the base of token we authenticate
       
      const token=socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
      const projectId=socket.handshake.query.projectId;
     
      if(!mongoose.Types.ObjectId.isValid(projectId)){
        return next(new Error("Project ID is required"))
      }

      socket.project=await Project.findById(projectId);
     
       
      if(!token){
        return next(new Error("authenticate error"))
      }
      const decoded=jwt.verify(token,process.env.JWT_SECRET)
      if(!decoded){
        return next(new Error("Authenticate error"))
      }
      console.log("Decoded user:", decoded);
      socket.user=decoded
      next();
    }catch(err){
        next(err)
    }
})

io.on('connection', socket => {
    if (!socket.project) {
        console.error("Project not found for this socket connection.");
        socket.disconnect();
        return;
    }
    socket.roomId = socket.project._id.toString();
    console.log(`User ${socket.user._id} connected to project ${socket.roomId}`);
    socket.on('message', (data) => {
        // Handle incoming messages
        console.log('Message received:', data);
        // Emit the message to all users in the project room, including sender
        socket.broadcast.to(socket.roomId).emit('message', data);
    });
        
  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});


server.listen(process.env.PORT||3000,()=>{
    console.log('server is running')
})