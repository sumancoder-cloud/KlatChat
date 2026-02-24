const express=require('express');

const router=express.Router();

const {getAllContacts,getMessagesByUserId,sendMessage,getChatPartners}=require('../controllers/messages.controller')

const {protectRoute}=require('../middleware/auth.middleware')

router.get('/contacts',protectRoute,getAllContacts)

router.get('/chats',protectRoute,getChatPartners)

router.get('/:id',protectRoute,getMessagesByUserId)

router.post('/send/:id',protectRoute,sendMessage)

module.exports=router;