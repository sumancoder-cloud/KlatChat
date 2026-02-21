require('dotenv').config();
const express=require('express');
const dotenv=require('dotenv');
const app=express();
const path=require('path')
//even we can useimport express from 'express'  but need to keep the type as module
const authRoutes=require('./routes/auth.route.js')
const messageRoutes=require('./routes/auth.messages.js')
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


app.listen(PORT,()=>{
    console.log("Server is running on port number "+PORT);
})