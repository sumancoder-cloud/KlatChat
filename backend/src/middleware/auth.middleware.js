const jwt=require('jsonwebtoken')

const user=require('../models/User.model')

const protectRoute=async(req,res,next)=>{
    try{

        const token=req.cookies.jwt

        if(!token){
            return res.status(401).json({
                message:"Unauthorized - No token Found"
            })
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({
                message:"Unauthorized-Invalid Data"
            })
        }

        const user=await User.findByOne(decoded.userid);

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }

        next();

    }catch(error){
        console.log("Error while doing the Protected routes")
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

module.exports=protectRoute