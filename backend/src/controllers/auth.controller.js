// Route → Controller → Model → Database → Response   without writing full login in routes we actually uses the controllers for overcome messy code

/* 

Let’s say you send POST request:

app.post("/login", (req, res) => {
   console.log(req.body);
});

Flow:

Request comes from frontend

express.json() middleware runs first

It checks:

Is Content-Type: application/json?

It reads raw data

Converts JSON → JS object

Attaches to req.body

Calls next()

Your /login route runs







// without express.json() middleware it cannot readd the json data and its becomes undefines to req.body

*/
const express=require('express');

const User=require('../models/User.model');

const bcrypt=require('bcryptjs');

const generateToken=require('../lib/utils')

const sendMail=require('../utils/sendEmail');

const EmailTemplate=require('../utils/EmailTemplate')

console.log("Signup API hit");

const signUp=async(req,res)=>{
    const {fullName,email,password}=req.body;
    try{
        
        if(!fullName || !email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        if(password.length<6){
            return  res.status(400).json({
                message:"Password must have atleast 6 characters"
            })
        }

        // const emailRegex=/^[a-zA-Z0-9-_.]+@[a-z]+\.+[a-z]{2,}$/;
        const emailRegex=/^[^\s@]+@[^\s@]+\.+[^\s@]+$/

        if(!emailRegex.test(email)){
            return res.status(400).json({
                message:"Email is in invalid format "
            })
        }


        const user=await User.findOne({email})
    if(user){
        return res.status(400).json({
            message:"Email already exists"
        })
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);

    const newUser=new User({
    fullName,
    email,
    password:hashedPassword,
});

if(newUser){
    await newUser.save();
    console.log("before generateToken");
    const token = await generateToken(newUser._id);
    console.log("After generateToken");

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // prevents XSS attacks and cross-site sharing
        sameSite: "strict", // CSRF attacks
        secure: process.env.NODE_ENV === "development" ? false : true,
    });

    res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        profilePic: newUser.profilePic,
    });

    // send email (use positional args expected by sendMail)
    (async () => {
        try {
            console.log('sending email to:', newUser.email);
            await sendMail(newUser.email, 'Regarding Account Creation', EmailTemplate(newUser.fullName));
            console.log('Email sent');
        } catch (err) {
            console.error('Email was not sent', err.message || err);
        }
    })();

} else {
    return res.status(400).json({
        message:"User Data is Invalid"
    })
}

    }catch(error){
        console.log("Error occured at signUp console")
        res.status(500).json({
            message:error.message,
            message:"Internal Server Error"
        })
    }
}

const login=async(req,res)=>{
    res.send("login end point working succesfully");
}

const logOut=(req,res)=>{
    res.send("logOut end point working succesfully");
}

module.exports={
    signUp,
    login,
    logOut
}

