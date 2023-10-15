import { Schema,model } from "mongoose";
import { productSchema } from "./products.js";

const productsInCartSchema = new Schema({
    product:productSchema,
    qty:Number
},{_id:false});
productsInCartSchema.virtual('totalPrice').get(function(){
    return this.product.price * this.qty
})
const orderSchema =new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    cart:{
        type:[productsInCartSchema],
        required:true,
    },
    status:{
        type:String,
        default:'in store'
    },
    paid:{
        type:Boolean,
        required:true,
    },
    paymentStatus:{
        type:String,
        default:'pending'
    },
    paymentUrl:{
        type:String,
    },
    totalPrice:Number
},{timestamps:true});

const Orders = model('orders',orderSchema);

export default Orders;