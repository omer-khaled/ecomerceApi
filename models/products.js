import { Schema,model } from "mongoose";

const productSchema =new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    imageUrl:{
        type:String,
        required:true,
    },
    sizes:{
        type:[{
            type:String
        }],
        required:true,
    },
    inStock:{
        type:Number,
        required:true,
        default:0
    },
    category:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'categories'
    },
    company:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'companies'
    },
    colors:{
        type:[{
            type:String
        }],
        required:true,
    },
    feedbacks:{
        type:[{
            user:{
                type:Schema.Types.ObjectId,
                ref:'users',
            },
            feedback:String,
            rate:Number
        }],
        default:[]
    }
},{timestamps:true});

const Products = model('products',productSchema);

export default Products;

export {productSchema};