const {isSpoofedBot}=require("@arcjet/inspect");

const aj=require('../lib/arcjet')

const arcjetProtection=async(req,res,next)=>{

    try{

        const decision=await aj.protect(req)

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                return res.status(429).json({
                    message:"Rate Limit Exceeded.Please try again Later."
                })
            }
         else if(decision.reason.isBot()){
            return res.status(403).json({
                message:"Bots access are denied."
            })
        }
         else{
            return res.status(403).json({
                message:"Access denied by security policy."
            })
        }
    }

        if(decision.results.some(isSpoofedBot)){
            return res.status(403).json({
                error:"Spoofed Bot detected",
                message:"Malicious bot activity detected."
            })
        }


        next();

    }catch(error){
        console.log("Arcjet Protection error",error.message)
        return res.status(500).json({
            message:"Internal Server error "
        })
        next();
    }

}

module.exports=arcjetProtection