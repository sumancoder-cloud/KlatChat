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
    console.log("A user connected:", socket.user.fullName, "userId:", socket.userId);

    const userId=socket.userId

    userSocketMap[userId]=socket.id

    console.log("Online users map:", userSocketMap);
    console.log("Broadcasting online users:", Object.keys(userSocketMap));

    //send events to all clients 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    // Game events
    socket.on("gameInvite", (data) => {
        console.log("Game invite from:", data.from, "to:", data.to, "game:", data.gameId);
        console.log("Current userSocketMap:", userSocketMap);
        const receiverSocketId = userSocketMap[data.to];
        console.log("Receiver socket ID:", receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameInviteReceived", data);
            console.log("Game invite sent to:", receiverSocketId);
        } else {
            console.log("Receiver not online!");
        }
    });

    socket.on("acceptGame", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameAccepted", data);
        }
    });

    socket.on("declineGame", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameDeclined", data);
        }
    });

    socket.on("exitGame", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameExited", data);
        }
    });

    // TicTacToe
    socket.on("tttMove", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("tttMove", data);
    });
    socket.on("tttReset", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("tttReset", data);
    });

    // Snake & Ladders
    socket.on("snlMove", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("snlMove", data);
    });
    socket.on("snlReset", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("snlReset", data);
    });

    // Sudoku
    socket.on("sudokuMove", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("sudokuMove", data);
    });
    socket.on("sudokuReset", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("sudokuReset", data);
    });

    // Carrom
    socket.on("carromShot", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("carromShot", data);
    });
    socket.on("carromReset", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) io.to(receiverSocketId).emit("carromReset", data);
    });

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