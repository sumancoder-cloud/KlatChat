const express=require('express');
const app=express();
app.use(express.json())
const {signUp,login,logOut,updateProfile}=require('../controllers/auth.controller')

const {protectRoute}=require('../middleware/auth.middleware')



const router=express.Router();

router.post('/signup',signUp)

router.post('/login',login)

router.post('/logout',logOut)

router.put('/update-profile',protectRoute,updateProfile)

router.get('/check',protectRoute,(req,res)=>{
    return res.status(200).json(req.user)
})

module.exports=router;