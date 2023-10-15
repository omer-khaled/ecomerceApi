import { Router } from "express";
import categoryController from '../controllers/category.js'
import {body} from 'express-validator';
import uploader from '../utils/uploader.js';
import verifyAdminToken from "../utils/verifyAdminToken.js";
const categoryRouter = Router();

categoryRouter.get('/getCategories',categoryController.getCategories);

categoryRouter.get('/getCategoriesPagination',verifyAdminToken,categoryController.getCategoriesPagination);

categoryRouter.get('/getSingleCategory/:id',verifyAdminToken,categoryController.getSingleCategory);

categoryRouter.post('/addCategory',uploader.single('image'),[
    body('name','name shuod contain caracters and digits at leaste 3 chracter').notEmpty().isAlphanumeric('en-US',{ignore:'\s'}).isLength({min:3})
],verifyAdminToken,categoryController.addCategories);

categoryRouter.put('/updateCategory/:id',uploader.single('image'),[
    body('name','name shuod contain caracters and digits at leaste 3 chracter').notEmpty().isAlphanumeric('en-US',{ignore:'\s'}).isLength({min:3})
],categoryController.updateProduct);

categoryRouter.delete('/deleteCategory/:id',categoryController.deleteCategories);

export default categoryRouter;