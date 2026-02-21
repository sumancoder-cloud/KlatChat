const express=require('express');

const router=express.Router();

router.get('/signUp',(req,res)=>{
    console.log("Entered at signup endpoint ");
    res.status(200).json({
        message:"sign up endpoint working"
    })
})

router.get('/login',(req,res)=>{
    console.log("you are at the login end point");
    res.status(200).json({
        message:"login end point is working successfully"
    })
})

router.get('/logout',(req,res)=>{
    console.log("you are at the logout end point");
    res.status(200).json({
        message:"logout end point is working successfully"
    })
})

module.exports=router;