const {Server}=require('socket.io')

const express=require('express')

const http=require('http')

const socketAuthMiddleware=require('../middleware/socket.auth.middleware')

const app=express()

const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    }
})

//middle ware ikkada vundidhi like manamu hhtp rest api kosam ela aothey chesamoo under socket vatini merge cheyyali

io.use(socketAuthMiddleware)

//storing online users

const userSocketMap={};

io.on("connection",(socket)=>{
    console.log("A user connected",socket.user.fullName);

    const userId=socket.userId

    userSocketMap[userId]=socket.id

    //send events to all clients 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User disconnected",socket.user.fullName)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    });
});

module.exports={
    io,
    app,
    server
}