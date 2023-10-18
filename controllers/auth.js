import { body, validationResult } from "express-validator";
import Users from "../models/user.js";
import bcrypt from 'bcrypt';
import sendEmail from "../utils/maileHandler.js";
import clearImage from "../utils/clearImage.js";
import jwt from 'jsonwebtoken';
import Carts from "../models/cart.js";
import crypto from 'crypto';
const registeration = async(request,response,next)=>{
    try{
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
        if(!image){
            const error = new Error('image not Exists or this is not image');
            error.statusCode = 422;
            return next(error); 
        }
        const {name,password,email} = request.body;
        const hashedPassword =await bcrypt.hash(password,12);
        const userData = new Users({name,password:hashedPassword,email,image:image.filename});
        const user =  await userData.save();
        const cartDetails = new Carts({userId:user._id});
        await cartDetails.save();
        sendEmail(email,'signUp successFully','<h1>hello for our e-commerce</h1>');
        response.status(201).json({
            message:'user created successfuly',
            status:true,
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

const login = async(request,response,next)=>{
    try{
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const user = request.foundedUser;
        const refreshToken  = jwt.sign({
            userId:user._id.toString(),
            role:100
        },process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'});
        const accessToken =  jwt.sign({
            userId:user._id.toString(),
            role:100
        },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
        response.cookie('jwt',refreshToken,{
            path:'/',
            httpOnly: true,
            sameSite:'none',
            secure:true,
            maxAge:7 * 24 * 60 * 60 * 1000,
        });
        response.status(200).json({
            message:'user login successfuly',
            status:true,
            accessToken:accessToken,
            user:user
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const Adminlogin = async(request,response,next)=>{
    try{
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const user = request.foundedUser;
        const refreshToken  = jwt.sign({
            userId:user._id.toString(),
            role:101
        },process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'});
        const accessToken =  jwt.sign({
            userId:user._id.toString(),
            role:101
        },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
        response.cookie('jwt',refreshToken,{
            path:'/',
            httpOnly: true,
            sameSite:'none',
            secure:true,
            maxAge:7 * 24 * 60 * 60 * 1000,
        });
        response.status(200).json({
            message:'admin login successfuly',
            status:true,
            accessToken:accessToken,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const refresh = async(request,response,next)=>{
    try{
        const refreshToken = request.cookies.jwt;
        if(!refreshToken){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        if(decodedToken.role!==100){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        const accessToken =  jwt.sign({
            userId : decodedToken.userId,
            role:decodedToken.role
        },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
        response.status(200).json({
            message:'new accessToken generated',
            status:true,
            accessToken:accessToken,
            user:decodedToken.userId
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const Adminrefresh = async(request,response,next)=>{
    try{
        const refreshToken = request.cookies.jwt;
        if(!refreshToken){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        if(decodedToken.role!==101){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        const accessToken =  jwt.sign({
            userId : decodedToken.userId,
            role:decodedToken.role
        },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
        response.status(200).json({
            message:'new accessToken generated',
            status:true,
            accessToken:accessToken,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const logout = async(request,response,next)=>{
    try{
        response.cookie('jwt','',{
            path:'/',
            httpOnly: true,
            sameSite:'none',
            secure:true,
            expires: new Date(0)
        });
        response.status(200).json({
            message:'user logout successfuly',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const resetPassword = async(request,response,next)=>{
    try{
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const user = request.foundedUser;
        const hasedToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = hasedToken;
        user.resetPasswordExpire = Date.now() + 1 * 60 * 60 * 1000;
        await user.save();
        sendEmail(user.email,'Reset Password',`
            <a href="https://comerce-ecru.vercel.app/changePassword?token=${hasedToken}">reset password</a>
        `);
        response.status(200).json({
            message:'check your Email',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const changePassword = async(request,response,next)=>{
    try{
        const errors = validationResult(request);
        if(!errors.isEmpty()){
            const error = new Error('invalid Data');
            error.details = errors.array();
            error.statusCode = 422;
            return next(error);
        }
        const user = request.foundedUser;
        const {password} = request.body;
        const hassedPassword = await bcrypt.hash(password,12);
        user.password=hassedPassword;
        await user.save();
        sendEmail(user.email,'change Password',`
            <h1>Password changed succeefully<h1/>
        `);
        response.status(200).json({
            message:'check your Email',
            status:true,
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}

const getUser = async(request,response,next)=>{
    try{
        const {id} = request.params;
        const user =await Users.findById(id,{
            image:1,
        });
        if(!user){
            const error = new Error('this use not exists')
            error.statusCode = 422;
            return next(error);
        }
        response.status(200).json({
            message:'check your Email',
            status:true,
            user:user
        });
    }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        return next(error);
    }
}
export default {registeration ,getUser, login , refresh , logout , Adminlogin , Adminrefresh,resetPassword,changePassword}