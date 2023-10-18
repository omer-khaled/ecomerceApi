import { validationResult } from "express-validator";
import Companies from "../models/company.js";
import clearImage from "../utils/clearImage.js";
import path from 'path';
const getCompanys = async(request,response,next)=>{
    try{
        const companies =await Companies.find({},{
            image:0
        });
        response.status(200).json({
            message:'categories retrived successfully',
            status:true,
            companies:companies
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

const getSingleCompany = async(request,response,next)=>{
    try{
        const {id} = request.params;
        const company =await Companies.findById(id);
        response.status(200).json({
            message:'category deleteed successfully',
            status:true,
            data:company
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

const getCompanysPagination = async(request,response,next)=>{
    try{
        const page = request.query.page||1;
        const name = request.query.name||null;
        const itemPerPage = 4;
        const options = {};
        if(name){
            options.name=new RegExp(name, 'i');
        }
        const docsCount = await Companies.countDocuments(options);
        const pages = Math.ceil(docsCount / itemPerPage);
        const companies =await Companies.find(options).skip((page-1) * itemPerPage).limit(itemPerPage);
        response.status(200).json({
            message:'categories retrived successfully',
            status:true,
            companies:companies,
            numberOfPage:pages
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}

const addCompanys = async (request,response,next)=>{
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
        const company = new Companies({name,image:image.filename});
        await company.save();
        response.status(201).json({
            message:"company added successfully",
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

const updateCompanys = async (request,response,next)=>{
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
            const company = await Companies.findOneAndUpdate({_id:id},{name,image:image.filename});
            await clearImage(path.join('images',company.image));
        }else{
            await Companies.updateOne({_id:id},{name});
        }
        response.status(201).json({
            message:"company updated successfully",
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

const deleteCompanys = async (request,response,next)=>{
    try{
        const {id} = request.params;
        const company =await Companies.findByIdAndDelete({_id:id});
        await clearImage(path.join('images',company.image));
        response.status(200).json({
            message:'company deleteed successfully',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}
export default {getCompanys,addCompanys,updateCompanys,deleteCompanys,getCompanysPagination,getSingleCompany};