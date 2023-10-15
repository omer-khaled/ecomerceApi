import { Schema , model } from "mongoose";

const blogScema = new Schema({
    image:{
        type:String,
    },
    title:{
        type:String,
        required:true,
    },
    sumary:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    comments:{
        type:[{
            user:{
                type:Schema.Types.ObjectId,
                ref:'users'
            },
            comment:String
        }],
        default:[]
    }
});

const Blog = model('blog',blogScema);


export default Blog;