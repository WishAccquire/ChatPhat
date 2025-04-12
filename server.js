import http from 'http'
import app from './app.js'
import  'dotenv/config'

const server=http.createServer(app);

server.listen(process.env.PORT||3000,()=>{
    console.log('server is running')
})