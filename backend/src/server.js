require('dotenv').config();

const express=require('express');

const dotenv=require('dotenv');

const cors=require('cors')

const{app,server}=require('./lib/socket.js')

app.use(
    cors({
        origin:"http://localhost:5173",
        credentials:true
    })
);

app.use(express.json())


const path=require('path')

const cookieParser=require('cookie-parser')

app.use(cookieParser())



//even we can useimport express from 'express'  but need to keep the type as module

const authRoutes=require('./routes/auth.route.js')

const messageRoutes=require('./routes/auth.messages.js')

const connectDb=require('./lib/db.js');



const PORT=process.env.PORT || 3001

console.log("PORT from env:", process.env.PORT);

app.use('/api/auth',authRoutes)

app.use('/api/messages',messageRoutes);



if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.use((req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
    })
}


server.listen(PORT,()=>{
    console.log("Server is running on port number "+PORT);
    connectDb();
})