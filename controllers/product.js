import { validationResult } from "express-validator";
import Products from "../models/products.js";
import clearImage from "../utils/clearImage.js";
import path from 'path';
import Carts from "../models/cart.js";
const addProduct =async (request,response,next)=>{
    try{
        const errors = validationResult(request);
        const image = request.file;
        if(!errors.isEmpty()){
            await clearImage(image.path);
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        if(!image){
            const error = new Error('image not Exists or this is not image');
            error.statusCode = 422;
            return next(error); 
        }
        let {name,title,description,price,sizes,inStock,category,company,colors} = request.body;
        sizes = JSON.parse(sizes);
        colors = JSON.parse(colors);
        if(!Array.isArray(sizes)||!Array.isArray(colors)){
            const error = new Error('sizes or colors should be arrayes');
            error.statusCode = 422;
            return next(error); 
        }
        const product = new Products({name,title,description,price,imageUrl:image.filename,sizes,inStock,category,company,colors});
        await product.save();
        response.status(201).json({
            message:"product added successfully",
            status:true
        });
    }catch(e){
        // console.log(e);
        if(request.file){
            await clearImage(request.file.path);
        }
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const increaseSoketOfProduct = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const {inStock} = request.body;
        const product =await Products.findById({_id:id});
        if(!product){
            const error = new Error('this product not exist');
            error.statusCode = 422;
            return next(error);
        }
        product.inStock+=inStock;
        await product.save();
        response.status(201).json({
            message:"soket for this product updated successfully",
            status:true
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const updateProduct = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const errors = validationResult(request);
        const image = request.file;
        if(!errors.isEmpty()){
            if(image){
                await clearImage(image.path);
            }
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        let {name,title,description,price,sizes,inStock,category,company,colors} = request.body;
        sizes = JSON.parse(sizes);
        colors = JSON.parse(colors);
        if(!Array.isArray(sizes)||!Array.isArray(colors)){
            const error = new Error('sizes or colors should be arrayes');
            error.statusCode = 422;
            return next(error); 
        }
        if(image){
            const product = await Products.findOneAndUpdate({_id:id},{name,title,description,price,imageUrl:image.filename,sizes,inStock,category,company,colors});
            await clearImage(path.join('images',product.imageUrl));
        }else{
            await Products.updateOne({_id:id},{name,title,description,price,sizes,inStock,category,company,colors});
        }
        response.status(201).json({
            message:"product updated successfully",
            status:true
        });
    }catch(e){
        if(request.file){
            await clearImage(request.file.path);
        }
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const deleteProduct = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const deleteProduct = await Products.findByIdAndDelete(id);
        await Carts.updateMany({},{
            $pull:{cart:{product:id}}
        });
        await clearImage(path.join('images',deleteProduct.imageUrl));
        response.status(200).json({
            message:"product deleted successfully",
            status:true
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getSingleProduct = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const product = await Products.findById(id);
        response.status(200).json({
            message:"product deleted successfully",
            status:true,
            product:product
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getSingleShow = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const product = await Products.findById(id).populate('category company feedbacks.user');
        response.status(200).json({
            message:"product deleted successfully",
            status:true,
            product:product
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const filterOnProducts = async(request,response,next)=>{
    try{
        const docsPerPage = 6;
        const page = request.query.page||1;
        const errors = validationResult(request);
        const options = (request.options)||{};
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const docsCount = await Products.countDocuments(options);
        const numberOfPage = Math.ceil(docsCount / docsPerPage);
        const products =await Products.find(options).populate('company category','-_id -__v ').skip((page-1) * docsPerPage).limit(docsPerPage);
        response.status(200).json({
            message:"data retrieved successfully",
            status:true,
            products:products,
            numberOfPage:numberOfPage
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getProducts = async(request,response,next)=>{
    try{
        const docsPerPage = 6;
        const page = request.query.page||1;
        const title = request.query.title||null;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const options = {};
        if(title){
            options.title=new RegExp(title, 'i');
        }
        const docsCount = await Products.countDocuments(options);
        const numberOfPage = Math.ceil(docsCount / docsPerPage);
        const products =await Products.find(options).populate('company category','-_id -__v ').skip((page-1) * docsPerPage).limit(docsPerPage);
        response.status(200).json({
            message:"data retrieved successfully",
            status:true,
            products:products,
            numberOfPage:numberOfPage
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const addFeedbackToProduct = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const userId = request.userId;
        const {feedback,rate} = request.body;
        await Products.updateOne({_id:id},{
            $push:{feedbacks:{user:userId,feedback:feedback,rate:rate}}
        });
        const product = await Products.findById(id).populate('category company feedbacks.user');
        response.status(201).json({
            message:"product updated and feedback added successfully",
            status:true,
            product:product
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const deleteFeedbackToProduct = async (request,response,next)=>{
    try{
        const feedId = request.query.feedId;
        const {id} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const userId = request.userId;
        await Products.updateOne({_id:id},{
            $pull:{feedbacks:{user:userId,_id:feedId}}
        });
        const product = await Products.findById(id).populate('category company feedbacks.user');
        response.status(201).json({
            message:"product updated and feedback deleted successfully",
            status:true,
            product:product
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getFeedbackFromProduct = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const {feedbacks} = await Products.findById(id).select('feedbacks.user feedbacks.rate feedbacks.feedback -feedbacks._id  -_id').populate('feedbacks.user','-_id -__v -createdAt -updatedAt -password').select('-feedbacks._id');
        response.status(201).json({
            message:"feedback retrived successfully",
            status:true,
            feedbacks:feedbacks
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getproductsWithCategoryId = async(request,response,next)=>{
    try{
        const {categoryId} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const products =await Products.find({
            category:categoryId
        }).populate('company category','-_id -__v ');
        response.status(200).json({
            message:"data retrieved successfully",
            status:true,
            products:products,
            numberOfProducts:products.length
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getproductsWithCompanyId = async(request,response,next)=>{
    try{
        const {companyId} = request.params;
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const products =await Products.find({
            company:companyId
        }).populate('company category','-_id -__v ');
        response.status(200).json({
            message:"data retrieved successfully",
            status:true,
            products:products,
            numberOfProducts:products.length
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

export default {addProduct ,getSingleShow, deleteFeedbackToProduct,  getSingleProduct, increaseSoketOfProduct ,getProducts ,deleteProduct , updateProduct , filterOnProducts , addFeedbackToProduct,getFeedbackFromProduct , getproductsWithCompanyId  , getproductsWithCategoryId};