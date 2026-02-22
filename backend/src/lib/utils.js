const jwt=require('jsonwebtoken')

const generateToken=async(userId,res)=>{
    const token=await jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    });


    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,  // 7 days in milliseconds
        httpOnly:true,//prvents XSS attacks and cross-site sharing
        sameSite:"strict",  //CSRF attacks
        secure:process.env.NODE_ENV=== "development"? false : true
    })

    return token;
}

module.exports=generateToken;