import { body, validationResult } from "express-validator";
import Blog from "../models/blog.js"
import sharp from "sharp";
import clearImage from "../utils/clearImage.js";
import path, { dirname } from 'path';

const getBlogs = async(request,response,next)=>{
    try{
        const blogs = await Blog.find({});
        response.status(200).json({
            message:'blogs retrived sucessfully',
            status:true,
            blogs:blogs
        })
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getBlogsPagination = async(request,response,next)=>{
    try{
        const page = request.query.page||1;
        const title = request.query.title||null;
        const itemPerPage = 4;
        const options = {};
        if(title){
            options.title = new RegExp(title,'i')
        }
        const docsCount = await Blog.countDocuments(options);
        const pages = Math.ceil(docsCount / itemPerPage);
        const blogs =await Blog.find(options).skip((page-1) * itemPerPage).limit(itemPerPage);
        response.status(200).json({
            message:'blogs retrived successfully',
            status:true,
            blogs:blogs,
            numberOfPage:pages
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        next(error);
    }
}


const addBlog = async(request,response,next)=>{
    try{
        const errors = validationResult(request);
        const image = request.file;
        if(!errors.isEmpty()){
            if(image){
                // await clearImage(path.join(image.path));
            }
            const error = new Error('invalid data');
            error.statusCode = 442;
            error.details = errors.array();
            return next(error);
        }
        if(!image){
            const error = new Error('this is not image or not exists');
            error.statusCode = 442;
            return next(error);
        }
        const {title,sumary,content} = request.body;
        const blog = new Blog({image:image.filename,title:title,sumary:sumary,content:content});
        await blog.save();
        response.status(200).json({
            message:'blog added successfully',
            status:true,
        });
    }catch(e){
        if(request.file){
            await clearImage(path.join(request.file.path));
        }
        const error = new Error(e.message);
        error.statusCode=500;
        return next(error);
    }
}

const editBlog = async(request,response,next)=>{
    try{
        const id = request.params.id;
        const errors = validationResult(request);
        const image = request.file;
        if(!errors.isEmpty()){
            if(image){
                await clearImage(path.join(image.path));
            }
            const error = new Error('invalid data');
            error.statusCode=442;
            error.details = errors.array();
            return next(error);
        }
        const {title,sumary,content} = request.body;
        const blog =await Blog.findById(id);
        blog.title = title;
        blog.sumary = sumary;
        blog.content = content;
        if(image){
            await clearImage(path.join('images',blog.image));
            blog.image = image.filename
        }
        await blog.save();
        response.status(200).json({
            message:'blog updated successfully',
            status:true,
        });
    }catch(e){
        if(request.file){
            await clearImage(path.join(request.file.path));
        }
        const error = new Error(e.message);
        error.statusCode=500;
        return next(error);
    }
}

const deleteBlog = async(request,response,next)=>{
    try{
        const id = request.params.id;
        const blog =await Blog.findByIdAndDelete(id,{returnDocument:true});
        if(blog.image){
            await clearImage(path.join('images',blog.image));
        }
        response.status(200).json({
            message:'blog deleted successfully',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        return next(error);
    }
}

const getSingleBlog = async(request,response,next)=>{
    try{
        const id = request.params.id;
        const blog =await Blog.findById(id).populate('comments.user','-password');
        response.status(200).json({
            message:'blog retrived successfully',
            status:true,
            blog:blog
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        return next(error);
    }
}

const addComment = async(request,response,next)=>{
    try{
        const id = request.params.id;
        const userId = request.userId;
        const {comment} = request.body;
        const blog = await Blog.findById(id);
        blog.comments.push({user:userId,comment:comment});
        await blog.save();
        const newBlog = await Blog.findById(id).populate('comments.user');
        response.status(200).json({
            message:'blog retrived successfully',
            status:true,
            blog:newBlog
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        return next(error);
    }
}

const deleteComment = async(request,response,next)=>{
    try{
        const id = request.params.id;
        const userId = request.userId;
        const {blogId} = request.query;
        const de = await Blog.updateOne({_id:id},{
            $pull : {comments:{_id:blogId,user:userId}}
        });
        const newBlog = await Blog.findById(id).populate('comments.user');
        response.status(200).json({
            message:'blog retrived successfully',
            status:true,
            blog:newBlog
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode=500;
        return next(error);
    }
}

export default {getBlogs,addBlog,editBlog,deleteBlog,getSingleBlog,getBlogsPagination,addComment,deleteComment};