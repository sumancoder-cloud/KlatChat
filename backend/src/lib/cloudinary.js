const cloudinary=require('cloudinary')

const v2=cloudinary.config({
    name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret:process.env.CLOUDINARY_CLOUD_API_SECRET
})

module.exports=v2