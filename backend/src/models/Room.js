// const mongoose = require('mongoose')



// const lineSchema=new mongoose.Schema({
//     points: [Number],
//     color: String,
//     width: Number,
// })





// const roomSchema=new mongoose.Schema({
//     roomId:{
//         type:String,
//         required:true,
//         unique:true,
//     },
//     lines:[lineSchema],
//     updatedAt:{
//         type:Date,
//         default:Date.now,
//     }
// })
    
// module.exports=mongoose.models.Room || mongoose.model('Room',roomSchema)


const mongoose = require('mongoose')



const lineSchema=new mongoose.Schema({
    points: [Number],
    color: String,
    width: Number,
})

const userSchema=new mongoose.Schema({
 userId:    { type: String, required: true },   
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  avatarUrl: { type: String },   
  joinedAt:  { type: Date, default: Date.now },


},{_id:false})



const roomSchema=new mongoose.Schema({
    roomId:{
        type:String,
        required:true,
        unique:true,
    },
    name:      { type: String },       
    createdBy: { type: userSchema, required: true },
    lines:[lineSchema],
    users:[userSchema],
    isActive:  { type: Boolean, default: true },
   
}

, {
  timestamps: true  // ← auto createdAt + updatedAt, updates on every save
})




// indexing  fo fast history lookup 

roomSchema.index({ 'users.userId': 1 })
roomSchema.index({ 'createdBy.userId': 1 })
roomSchema.index({ updatedAt: -1 }) 



    
module.exports=mongoose.models.Room || mongoose.model('Room',roomSchema)







