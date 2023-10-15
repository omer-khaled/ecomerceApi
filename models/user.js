import { Schema,model } from "mongoose";

const userSchema =new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    },
    role:{
        type:Number,
        default:100
    },
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpire:{
        type:Date,
    }
},{timestamps:true});

const Users = model('users',userSchema);

export default Users;