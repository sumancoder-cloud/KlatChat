const express=require('express');
const app=express();
app.use(express.json())
const {signUp,login,logOut}=require('../controllers/auth.controller')

const router=express.Router();

router.post('/signUp',signUp)

router.post('/login',login)

router.post('/logout',logOut)

router.put('/update-profile',protectRoute,updateProfile)

module.exports=router;