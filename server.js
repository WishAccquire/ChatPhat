import http from 'http'
import app from './app.js'
import  'dotenv/config'
import { Server } from "socket.io";
import jwt from 'jsonwebtoken'

const server=http.createServer(app);


const io = new Server(server,{
    //if we not use this it will get blocked by cors policy and our frontend part will not connect
    cors:{
        origin:'*'
    }
});
io.use((socket,next)=>{
    try{
      //on the base of token we authenticate
      const token=socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

      if(!token){
        return next(new Error("authenticate error"))
      }
      const decoded=jwt.verify(token,process.env.JWT_SECRET)
      if(!decoded){
        return next(new Error("Authenticate error"))
      }
      socket.user=decoded
      next();
    }catch(err){
        next(err)
    }
})

io.on('connection', socket => {
    //when a connection done from client side then this will occur
    console.log("a user is connected")
  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});


server.listen(process.env.PORT||3000,()=>{
    console.log('server is running')
})