import Carts from "../models/cart.js";
import Orders from "../models/orders.js";
import Stripe from "stripe";
import dotenv from 'dotenv';
dotenv.config();
const stripe = Stripe(process.env.Stripe_SECRET_KEY);

const getCart = async(request,response,next)=>{
    try{ 
        const userId = request.userId;
        const cartData = await Carts.findOne({userId:userId}).populate({
            path : 'cart.product',
            populate : {
              path : 'category company',
            },
          })
        const totalPrice = cartData.cart.reduce((acc,el)=>{
            return acc+(el.product.price * el.qty);
        },0);
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
            cart:cartData.cart,
            totalPrice:totalPrice
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const addToCart = async(request,response,next)=>{
    try{   
        const {id} = request.params; 
        const userId = request.userId;
        const cartData = await Carts.findOne({
            userId:userId
        });
        const foundProduct = cartData?.cart.find(({product,qty})=>product.toString()===id);
        if(foundProduct){
            foundProduct.qty+=1;
        }else{
            cartData?.cart.push({
                product:id,
                qty:1
            });
        }
        await cartData.save();
        response.status(201).json({
            message:'product added successfully to cart',
            status:true,
            cart:cartData?.cart
        })
    }catch(e){
        console.log(e);
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const deleteFromCart = async(request,response,next)=>{
    try{   
        const {id} = request.params; 
        const userId = request.userId;
        const cartData = await Carts.updateOne({userId:userId},{
            $pull:{cart:{product:id}}
        });
        response.status(201).json({
            message:'product deleted successfully from cart',
            status:true,
            cart:cartData?.cart
        })
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const decreaseinCart = async(request,response,next)=>{
    try{   
        const {id} = request.params; 
        const userId = request.userId;
        const cartData = await Carts.findOne({userId:userId});
        const foundProduct = cartData?.cart.find(({product,qty})=>product.toString()===id);
        if(foundProduct){
            if(foundProduct.qty==1){
                await Carts.updateOne({userId:userId},{
                    $pull:{cart:{product:id}}
                })
            }else{
                foundProduct.qty-=1;
                await cartData.save();
            }
        }else{
          const error = new Error('not founded in you cart');
          error.statusCode('422');
          return next(error); 
        }
        response.status(201).json({
            message:'product deleted successfully from cart',
            status:true,
            cart:cartData?.cart
        })
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const makeOrder = async(request,response,next)=>{
    try{   
        const {session_id} = request.query;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const {userId,orderId} = JSON.parse(session.client_reference_id);
        const success_url='https://comerce-ecru.vercel.app/successPage';
        if(session.status==='complete'){
            const cartData = await Orders.updateOne({userId:userId,_id:orderId},{
                paid:true,
                paymentStatus:'compeleted'
            });
            response.redirect(success_url)
        }
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const cancelOrder = async(request,response,next)=>{
    try{   
        const {session_id} = request.query;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const {userId,orderId} = JSON.parse(session.client_reference_id);
        const cancel_url='https://comerce-ecru.vercel.app/failedPage';
        if(session.status==='complete'){
            const cartData = await Orders.updateOne({userId:userId,_id:orderId},{
                paid:false,
                paymentStatus:'rejected'
            });
            response.redirect(cancel_url)
        }
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const checkout = async(request,response,next)=>{
    try{   
        const {success_url,cancel_url} = request.query;
        const userId = request.userId;
        const cartData = await Carts.findOne({userId:userId}).populate('cart.product').select('cart');
        let totalPrice=null;
        if(cartData.cart.length===0){
            return response.status(200).json({
                message:'no product in cart',
                status:false
            })
        }
        const lintTimes = cartData.cart.map(({product,qty})=>{
            totalPrice+=(product.price * qty);
            return {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: product.title,
                    description:product.description,
                  },
                  unit_amount: (product.price)*100, // amount in cents
                },
                quantity: qty,
              }
        });
        const newOrder = new Orders({userId:userId,cart:cartData.cart,paid:false,totalPrice:totalPrice});
        const orderDetails = await newOrder.save();
        cartData.cart = [];
        await cartData.save();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lintTimes,
            client_reference_id:JSON.stringify({
                userId:userId,
                orderId:orderDetails._id,
            }),
            mode: 'payment',
            success_url: 'http://localhost:3002/cart/makeOrder?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3002/cart/cancelOrder?session_id={CHECKOUT_SESSION_ID}',
        });
        response.json({
            url:session.url
        });
    }catch(e){
        console.log(e);
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const checkoutForExistsOrder = async(request,response,next)=>{
    try{   
        const {id} = request.params;
        const {success_url,cancel_url} = request.query;
        const userId = request.userId;
        const order = await Orders.findById(id);
        const cartData = order.cart;
        let totalPrice=null;
        if(cartData.length===0){
            return response.status(200).json({
                message:'no product in cart',
                status:false
            })
        }
        const lintTimes =cartData.map(({product,qty})=>{
            totalPrice+=(product.price * qty);
            return {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: product.title,
                    description:product.description,
                  },
                  unit_amount: (product.price)*100, // amount in cents
                },
                quantity: qty,
              }
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lintTimes,
            client_reference_id:JSON.stringify({
                userId:userId.toString(),
                orderId:id,
            }),
            mode: 'payment',
            success_url: 'http://localhost:3002/cart/makeOrder?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3002/cart/cancelOrder?session_id={CHECKOUT_SESSION_ID}',
        });
        response.json({
            url:session.url
        });
    }catch(e){
        console.log(e);
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

export default {getCart , addToCart , deleteFromCart ,checkoutForExistsOrder , makeOrder , cancelOrder , checkout , decreaseinCart};