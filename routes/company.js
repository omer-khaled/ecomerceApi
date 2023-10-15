import { Router } from "express";
import companyController from '../controllers/company.js'
import {body} from 'express-validator';
import uploader from '../utils/uploader.js';
import verifyAdminToken from "../utils/verifyAdminToken.js";
const companyRouter = Router();

companyRouter.get('/getCompany',companyController.getCompanys);

companyRouter.get('/getCompanysPagination',verifyAdminToken,companyController.getCompanysPagination);

companyRouter.get('/getSingleCompany/:id',verifyAdminToken,companyController.getSingleCompany);

companyRouter.post('/addCompany',uploader.single('image'),[
    body('name','name shuod contain caracters and digits at leaste 3 chracter').notEmpty().isAlphanumeric('en-US',{ignore:'\s'}).isLength({min:3})
],verifyAdminToken,companyController.addCompanys);

companyRouter.put('/updateCompany/:id',uploader.single('image'),[
    body('name','name shuod contain caracters and digits at leaste 3 chracter').notEmpty().isAlphanumeric('en-US',{ignore:'\s'}).isLength({min:3})
],companyController.updateCompanys);

companyRouter.delete('/deleteCompany/:id',companyController.deleteCompanys);

export default companyRouter;