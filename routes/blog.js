import { Router } from "express";
import blogController from '../controllers/blog.js';
import uploader from "../utils/uploader.js";
import { body , query } from "express-validator";
import createDOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';
import verifyAdminToken from "../utils/verifyAdminToken.js";
import verifyToken from '../utils/verifyToken.js';
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const blogRouter = Router();

blogRouter.get('/getBlogs',blogController.getBlogs);

blogRouter.get('/getBlogsPagination',verifyAdminToken,blogController.getBlogsPagination);

blogRouter.post('/addBlog',verifyAdminToken,uploader.single('image'),(request,response,next)=>{
    if(request.body.content){
        request.body.content = DOMPurify.sanitize(request.body.content);
    }
    next();
},[
    body('title').notEmpty().withMessage('required feild').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('sholud be characters and numbers only').isLength({min:3}).withMessage('sholud be at least 3 character'),
    body('sumary').notEmpty().withMessage('required feild').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('sholud be characters and numbers only').isLength({min:3}).withMessage('sholud be at least 3 character'),
    body('content').notEmpty().withMessage('required feild').isLength({min:3}).withMessage('sholud be at least 3 character'),
],blogController.addBlog);

blogRouter.put('/editBlog/:id',verifyAdminToken,uploader.single('image'),(request,response,next)=>{
    if(request.body.content){
        request.body.content = DOMPurify.sanitize(request.body.content);
    }
    next();
},[
    body('title').notEmpty().withMessage('required feild').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('sholud be characters and numbers only').isLength({min:3}).withMessage('sholud be at least 3 character'),
    body('sumary').notEmpty().withMessage('required feild').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('sholud be characters and numbers only').isLength({min:3}).withMessage('sholud be at least 3 character'),
    body('content').notEmpty().withMessage('required feild').isLength({min:3}).withMessage('sholud be at least 3 character'),
],blogController.editBlog);

blogRouter.delete('/deleteBlog/:id',verifyAdminToken,blogController.deleteBlog);

blogRouter.get('/getSingleBlog/:id',blogController.getSingleBlog);

blogRouter.put('/addComment/:id',verifyToken,blogController.addComment);

blogRouter.delete('/deleteComment/:id',verifyToken,[
    query('blogId').isAlphanumeric('en-US').withMessage('only characters and digits').isLength({min:24,max:24})
],blogController.deleteComment);

export default blogRouter;