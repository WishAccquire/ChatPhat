import http from 'http'
import app from './app.js'
import 'dotenv/config'
import { Server } from "socket.io";
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import Project from './models/project.model.js';
import { generateResult } from './services/ai.service.js';


const server = http.createServer(app);


const io = new Server(server, {
  //if we not use this it will get blocked by cors policy and our frontend part will not connect
  cors: {
    origin: '*'
  }
});
io.use(async (socket, next) => {
  try {
    //on the base of token we authenticate

    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Project ID is required"))
    }

    socket.project = await Project.findById(projectId);


    if (!token) {
      return next(new Error("authenticate error"))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
      return next(new Error("Authenticate error"))
    }

    socket.user = decoded
    next();
  } catch (err) {
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

  socket.join(socket.roomId);
  socket.on('project-message', async data => {

    const message = data.message;


    const aiIsPresentInMessage = message.includes('@ai');
    socket.broadcast.to(socket.roomId).emit('project-message', data);
    if (aiIsPresentInMessage) {
      const prompt = message.replace('@ai', '');
      const result = await generateResult(prompt);
      io.to(socket.roomId).emit('project-message', {
        message: result,
        sender: {
          _id: 'ai',
          email: 'AI'
        }
      })
      return
    }

    

    
  })



  socket.on('disconnect', () => {
    console.log(`User ${socket.user.email} disconnected from project ${socket.project.name}`);
    socket.leave(socket.roomId);
  });

});
server.listen(process.env.PORT || 3000, () => {
    console.log('server is running')
  });