

import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({

    receiverId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true

    },

    type:{
        type:String,
        enum:['appointment','emergency','system','remainder'],
        default:'system'
    },

    message:{
        type:String,
        required : true,
        trim : true,
    },

    title:{
        type:String,
        required : true,
        trim : true,
    },

    isRead:{
        type : Boolean,
        default : false,
    },

    realtedId:{
        type:mongoose.Schema.Types.ObjectId,
        default : null,
    },

},{timestamps:true});

export default mongoose.model('Notification',notificationSchema);