import { validationResult } from "express-validator";
import Categories from "../models/category.js"
import clearImage from "../utils/clearImage.js";
import path from 'path';

const getCategories = async(request,response,next)=>{
    try{
        const categories =await Categories.find({});
        response.status(200).json({
            message:'categories retrived successfully',
            status:true,
            categories:categories
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

const getSingleCategory = async(request,response,next)=>{
    try{
        const {id} = request.params;
        const category =await Categories.findById(id);
        response.status(200).json({
            message:'category deleteed successfully',
            status:true,
            data:category
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

const getCategoriesPagination = async(request,response,next)=>{
    try{
        const page = request.query.page||1;
        const name = request.query.name||null;
        const itemPerPage = 4;
        const options = {};
        if(name){
            options.name=new RegExp(name, 'i');
        }
        const docsCount = await Categories.countDocuments(options);
        const pages = Math.ceil(docsCount / itemPerPage);
        const categories =await Categories.find(options).skip((page-1) * itemPerPage).limit(itemPerPage);
        response.status(200).json({
            message:'categories retrived successfully',
            status:true,
            categories:categories,
            numberOfPage:pages
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

const addCategories = async (request,response,next)=>{
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
        const {name} = request.body;
        const category = new Categories({name,image:image.filename});
        await category.save();
        response.status(201).json({
            message:"category added successfully",
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
        const {name} = request.body;
        if(image){
            const category = await Categories.findOneAndUpdate({_id:id},{name,image:image.filename});
            await clearImage(path.join('images',category.image));
        }else{
            await Categories.updateOne({_id:id},{name});
        }
        response.status(201).json({
            message:"category updated successfully",
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

const deleteCategories = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const category =await Categories.findByIdAndDelete(id);
        await clearImage(path.join('images',category.image));
        response.status(200).json({
            message:'category deleteed successfully',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

export default {getCategories,addCategories,updateProduct,deleteCategories,getCategoriesPagination,getSingleCategory};