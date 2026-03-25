
import Notification from '../models/Notification.js';



export const sendNotification = async (req,res) =>{
    try{

        const {receiverId,type,title,message,relatedId} = req.body;

        const notification = new Notification({
            receiverId,
            type : type || 'system',
            title,
            message,
            relatedId : relatedId || null
        })

        await notification.save();

        res.status(200).json({
            success:true,
            data:notification,
            message:'Notification sent'
        });
    }
    catch(error){
        res.status(500).json({success:false,message:error.message});
    }
};


export const getUserNotifications = async (req,res) => {
    try{
        const userId = req.user.id;

        const notifications = await Notification.find({receiverId:userId})
            .sort({createdAt:-1})
            .limit(50);
        
        const unreadCount =  notifications.filter(n => !n.isRead).length;

        res.status(200).json({
            success:true,
            data : notifications,unreadCount
        })

    }
    catch(error){
        res.json(400).json({success:false,message:error.messagd});
    }
}

export const markAsRead = async (req,res) => {
    try{
        const notificationId = req.params.id;
        const userId = req.user.id;

        const notification = await Notification.findById(notificationId);
        
        if (!notification){
            res.status(404).json({
                success : false,
                message : "Notification is not found",
            })
        }

        if (notification.receiverId.toString() !== userId){
            res.status(403).json({
                sucess:false,
                message : 'Unauthorized',
            })
        }

        notification.isRead = true

        await notification.save()

        res.status(200).json({
            success:true,
            data:notification,
        })
    }
    catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}


export const markAllAsRead = async (req,res) => {
    try{
        const userId = req.user.id;

        await Notification.updateMany(
            {receiverId:userId,isRead :false},
            {$set:{isRead:true}}
        );

        res.status(200).json({
            sucess:true,
            message:"All marked as read"
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message : error.message,
        })
    }
}