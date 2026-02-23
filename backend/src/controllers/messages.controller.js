const Messages=require('../models/Messages.model')

const User=require('../models/User.model')

const getAllContacts=async(req,res)=>{
    try{

        const loggedInUserId=req.user._id

        const filteredUsers=await User.find({
            _id:{$ne:loggedInUserId}
        }).select("-password")

        console.log("Contacts end point working correctly")

        return res.status(200).json(filteredUsers)

    }catch(error){
        console.log("Error Occured at the getAllContacts Endpoint",error.message)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

module.exports={
    getAllContacts
}