const mongoose = require('mongoose')



const lineSchema=new mongoose.Schema({
    points: [Number],
    color: String,
    width: Number,
})
const roomSchema=new mongoose.Schema({
    roomId:{
        type:String,
        required:true,
        unique:true,
    },
    lines:[lineSchema],
    updatedAt:{
        type:Date,
        default:Date.now,
    }
})
    
module.exports=mongoose.models.Room || mongoose.model('Room',roomSchema)