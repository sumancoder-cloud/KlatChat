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

const getMessagesByUserId=async(req,res)=>{

    try{
    const myId=req.user._id

    const  {id:userToChatId}=req.params

    const Message=await Messages.find({
        $or:[
            {
                senderId:myId,
                receiverId:userToChatId
            },
            {
                senderId:userToChatId,
                receiverId:myId
            },
        ],
    });

    return res.status(200).json(Message)
}catch(error){
    console.log("Error occured at the getMessagesById endpoint",error.message)
    return res.status(500).json({
        error:"Internal Server Error"
    })
}

}

const sendMessage=async(req,res)=>{

    try{
        const {text,image}=req.body
        const {id:receiverId}=req.params

        senderId=req.user._id

        if(!text || !image){
            return res.status(400).json({
                message:"Text or Image field is required"
            })
        }

        if(senderId.equals(receiverId)){
            return res.status(400).json({
                message:"You cannot send messages to yourself"
            })
        }

        const receiverExists=await User.exists({_id:receiverId})

        if(!receiverExists){
            return res.status(400).json({
                message:"Receiver Not exists"
            })
        }

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image)

            imageUrl=uploadResponse.secure_url
        }

        const newMessage=new Messages({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        await newMessage.save()

        //todo: send message in real time using socket.io

        return res.status(201).json(newMessage)

    }catch(error){

    console.log("Error occured at the sendMessage endpoint",error.message)
    return res.status(500).json({
        error:"Internal Server Error"
    })


    }
}


const getChatPartners=async(req,res)=>{

        try{

            const loggedInUserId=req.user._id

            //find all messages where loggedId is either sender or receiver

            const messages=await Messages.find({
                $or:[
                    {
                        senderId:loggedInUserId
                    },
                    {
                        receiverId:loggedInUserId
                    }
                ]
            })

            const chatPartnersIds=[
                ...new Set(messages.map((msg)=>msg.senderId.toString()===loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString()
                ))
            ]

            const chatPartners=await User.find({_id:{$in:chatPartnersIds}}).select("-password")
            return res.status(200).json(chatPartners)

        }catch(error){
            console.log("Error occured at the getChatPartners endpoint",error.message)
            return res.status(500).json({
            error:"Internal Server Error"
    })
        }

}
module.exports={
    getAllContacts,
    getMessagesByUserId,
    sendMessage,
    getChatPartners
}