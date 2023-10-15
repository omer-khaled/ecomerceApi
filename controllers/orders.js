import Orders from "../models/orders.js";

const getOrders = async(request,response,next)=>{
    try{ 
        const userId = request.userId;
        const orders = await Orders.find({userId:userId});
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
            orders:orders,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const AdmingetOrders = async(request,response,next)=>{
    try{ 
        const userId = request.userId;
        const orders = await Orders.find();
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
            orders:orders,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getSingleOrder = async(request,response,next)=>{
    try{ 
        const {id} = request.params;
        const userId = request.userId;
        const {cart} = await Orders.findOne({userId:userId,_id:id}).populate({
            path:'cart.product',
            populate:{
                path:'category company'
            }
        });
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
            order:cart,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getSingleOrderAdmin = async(request,response,next)=>{
    try{ 
        const {id} = request.params;
        const userId = request.userId;
        const {cart} = await Orders.findOne({_id:id}).populate({
            path:'cart.product',
            populate:{
                path:'category company'
            }
        });
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
            order:cart,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const updateStatusOrder = async(request,response,next)=>{
    try{ 
        const {id} = request.params;
        const order = await Orders.findOne({_id:id});
        if(order.status==="in store"){
            order.status = "in shipping"
        }else if(order.status==="in shipping"){
            order.status = "Delivered"
        }
        await order.save();
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const lastestOrders = async(request,response,next)=>{
    try{ 
        const orders = await Orders.find({}).sort({createdAt:'descending'}).limit(5);
        response.status(200).json({
            message:'data retrived successfully',
            status:true,
            orders:orders,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}


export default {getOrders,getSingleOrder,AdmingetOrders,getSingleOrderAdmin,updateStatusOrder,lastestOrders};