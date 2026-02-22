const mongoose=require('mongoose');
const dotenv=require('dotenv');

const connectDb=async ()=>{
    
    try{
        const {MONGO_URI}=process.env;
        if(!MONGO_URI) throw new error("Mongodb connection string was interrupted");
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo db connected Succesfully : ",conn.connection.host);
    }
    catch(error){
        console.log("Mongo Db connection Failed",error.message);
        process.exit(1); //here 1 means failure and 0 means success 
    }
}

module.exports=connectDb;