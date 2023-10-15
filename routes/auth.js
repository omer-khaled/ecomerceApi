import { Router } from "express";
import { body,query } from "express-validator"
import authController from '../controllers/auth.js'
import uploader from "../utils/uploader.js";
import Users from "../models/user.js";
import bcrypt from 'bcrypt';
const authRouter = Router();

authRouter.post('/register',uploader.single('image'),[
    body('email').notEmpty().withMessage('email is required').isEmail().withMessage('invalied email').normalizeEmail().matches(/^\w+\@gmail\.com$/).withMessage('should be gmail account').custom(async(value)=>{
        try{
            const user = await Users.findOne({email:value});
            if(user){
                return Promise.reject('this email alerady exists');
            }
        }catch(e){
            return Promise.reject(e.message);
        }
    }),
    body('name').trim().notEmpty().isLength({min:3}),
    body('password').notEmpty().isLength({min:8}).matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)[\w\W]{8,}$/)
],authController.registeration);

authRouter.post('/login',[
    body('email').notEmpty().withMessage('email is required').isEmail().withMessage('invalied email').normalizeEmail().matches(/^\w+\@gmail\.com$/).withMessage('should be gmail account').custom(async(value,{req})=>{
        try{
            const user = await Users.findOne({email:value});
            if(!user){
                return Promise.reject('this email not exists');
            }
            if(!(await bcrypt.compare(req.body.password,user.password))){
                return Promise.reject('Wrong password');
            }
            req.foundedUser = user;
        }catch(e){
            return Promise.reject(e.message);
        }
    }),
    body('password').notEmpty().isLength({min:8}).matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)[\w\W]{8,}$/)
],authController.login);

authRouter.post('/resetPassword',[
    body('email').notEmpty().withMessage('email is required').isEmail().withMessage('invalied email').normalizeEmail().matches(/^\w+\@gmail\.com$/).withMessage('should be gmail account').custom(async(value,{req})=>{
        try{
            const user = await Users.findOne({email:value});
            if(!user){
                return Promise.reject('this email not exists');
            }
            req.foundedUser = user;
        }catch(e){
            return Promise.reject(e.message);
        }
    }),
],authController.resetPassword);

authRouter.post('/changePassword',[
    query('token').notEmpty().isLength().custom(async(value,{req})=>{
        try{
            const user = await Users.findOne({resetPasswordToken:value,resetPasswordExpire:{$gt:Date.now()},role:100});
            if(!user){
                return Promise.reject('token is expired or not exist');
            }
            req.foundedUser = user;
        }catch(e){
            return Promise.reject(e.message);
        }
    }),
    body('password').notEmpty().isLength({min:8}).matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)[\w\W]{8,}$/)
],authController.changePassword);


authRouter.post('/Adminlogin',[
    body('email').notEmpty().withMessage('email is required').isEmail().withMessage('invalied email').normalizeEmail().matches(/^\w+\@gmail\.com$/).withMessage('should be gmail account').custom(async(value,{req})=>{
        try{
            const user = await Users.findOne({email:value,role:101});
            if(!user){
                return Promise.reject('this email not exists');
            }
            if(!(await bcrypt.compare(req.body.password,user.password))){
                return Promise.reject('Wrong password');
            }
            req.foundedUser = user;
        }catch(e){
            return Promise.reject(e.message);
        }
    }),
    body('password').notEmpty().isLength({min:8}).matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)[\w\W]{8,}$/)
],authController.Adminlogin);

authRouter.get('/refresh',authController.refresh);

authRouter.get('/adminrefresh',authController.Adminrefresh);

authRouter.get('/logout',authController.logout);

authRouter.get('/getuser/:id',authController.getUser);

export default authRouter;