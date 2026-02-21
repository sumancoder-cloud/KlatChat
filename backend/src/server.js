require('dotenv').config();
const express=require('express');
const dotenv=require('dotenv');
const app=express();
//even we can useimport express from 'express'  but need to keep the type as module

const authRoutes=require('./routes/auth.route.js')
const messageRoutes=require('./routes/auth.messages.js')
const PORT=process.env.PORT || 3001
console.log("PORT from env:", process.env.PORT);

app.use('/api/auth',authRoutes)
app.use('/api/messages',messageRoutes);
app.listen(PORT,()=>{
    console.log("Server is running on port number "+PORT);
})