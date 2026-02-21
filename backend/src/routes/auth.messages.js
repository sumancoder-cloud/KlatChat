const express=require('express');

const router=express.Router();

router.get('/send',(req,res)=>{
    res.send('send message end point');
})

module.exports=router;