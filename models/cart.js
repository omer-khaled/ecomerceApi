import { Schema,model } from "mongoose";

const productsInCartSchema = new Schema({
    product:{
        type:Schema.Types.ObjectId,
        // unique:true,
        ref:'products'
    },
    qty:Number
},{_id:false});
const cartSchema =new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        unique:true,
        ref:'users'
    },
    cart:{
        type:[productsInCartSchema],
        required:true,
        default:[]
    },
});

const Carts = model('carts',cartSchema);

export default Carts;