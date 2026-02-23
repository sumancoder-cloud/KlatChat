const express=require('express');

const router=express.Router();

const {getAllContacts}=require('../controllers/messages.controller')

const {protectRoute}=require('../middleware/auth.middleware')

router.get('/contacts',protectRoute,getAllContacts)

// router.get('/chats',getAllChats)

// router.get('/:id',getMessagesById)

// router.post('/send',(req,res)=>{
//     res.send('send message end point');
// })

module.exports=router;