import { Router } from "express";
import productController from '../controllers/product.js'
import { body , param , query } from "express-validator";
import uploader from "../utils/uploader.js";
import verifyToken from "../utils/verifyToken.js";
import verifyAdminToken from "../utils/verifyAdminToken.js";

const productRouter = Router();

productRouter.post('/addproduct',uploader.single('image'),[
    body('title').notEmpty().withMessage('title is required').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('title containe numbers and character only').isLength({min:4}).withMessage('title should container 4 character at least'),
    body('description').notEmpty().withMessage('description is required').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('description containe numbers and character only').isLength({min:4}).withMessage('description should container 4 character at least'),
    body('price').notEmpty().withMessage('price is required').isFloat({min:0.0}),
    body('inStock').isInt({min:0}),
    body('company').isString().isLength({min:24,max:24}),
    body('category').isString().isLength({min:24,max:24}),
    body('sizes').isString().withMessage('should be array of sizes avaliable for this product'),
    body('colors').isString().withMessage('should be array of colors avaliable for this product')
],productController.addProduct);

productRouter.put('/updateProduct/:id',uploader.single('image'),[
    body('title').notEmpty().withMessage('title is required').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('title containe numbers and character only').isLength({min:4}).withMessage('title should container 4 character at least'),
    body('description').notEmpty().withMessage('description is required').isAlphanumeric('en-US',{ignore:'\s'}).withMessage('description containe numbers and character only').isLength({min:4}).withMessage('description should container 4 character at least'),
    body('price').notEmpty().withMessage('price is required').isFloat({min:0.0}),
    body('inStock').isInt({min:0}),
    body('company').isString().isLength({min:24,max:24}),
    body('category').isString().isLength({min:24,max:24}),
    body('sizes').isString().withMessage('should be array of sizes avaliable for this product'),
    body('colors').isString().withMessage('should be array of colors avaliable for this product')
],productController.updateProduct);


productRouter.patch('/updateInsoket/:id',[
    param('id','invaild params').notEmpty().isAlphanumeric('en-US').isLength({min:24,max:24}),
    body('inStock','should be integer and posistive').notEmpty().isInt({min:0})
],productController.increaseSoketOfProduct);

productRouter.get('/deleteProduct/:id',[
    param('id','invaild params').notEmpty().isAlphanumeric('en-US').isLength({min:24,max:24}),
],verifyAdminToken,productController.deleteProduct);

productRouter.get('/getSingleProduct/:id',[
    param('id','invaild params').notEmpty().isAlphanumeric('en-US').isLength({min:24,max:24}),
],verifyAdminToken,productController.getSingleProduct);

productRouter.get('/getShowSingleProduct/:id',[
    param('id','invaild params').notEmpty().isAlphanumeric('en-US').isLength({min:24,max:24}),
],productController.getSingleShow);

productRouter.get('/filters',(request,response,next)=>{
    request.options = {};
    next();
},[
    query('categories','categories should be arrays').optional().isString().custom((value,{req})=>{
        if(value){
            req.options.category={$in:(value.split(','))};
        }
        return true;
    }),
    query('companies','companies should be arrays').optional().isString().custom((value,{req})=>{
        if(value){
            req.options.company={$in:(value.split(','))};
        }
        return true;
    }),
    query('min').optional().isFloat({min:0}).custom((value,{req})=>{
        if(value){
            req.options.price={$gte:value};
        }
        return true;
    }),
    query('max').optional().isFloat({min:0}).custom((value,{req})=>{
        if(value){
            if(req.options.price){
                req.options.price.$lte=value;
            }else{
                req.options.price={$lte:value};
            }
        }
        return true;
    })
],productController.filterOnProducts);

productRouter.get('/getProducts',productController.getProducts);


productRouter.patch('/addFeedback/:id',verifyToken,[
    body('rate','rate shuold be float from 0 to 5.0').isFloat({min:0.0,max:5.0}),
    body('feedback','feedback shuold be string').isAlphanumeric('en-US',{ignore:'\s'})
],productController.addFeedbackToProduct);

productRouter.patch('/deleteFeedback/:id',verifyToken,productController.deleteFeedbackToProduct);

productRouter.get('/getFeedback/:id',productController.getFeedbackFromProduct);

productRouter.get('/getProductByCategory/:categoryId',[
    param('categoryId').isAlphanumeric('en-US').isLength({min:24,max:24})
],productController.getproductsWithCategoryId);

productRouter.get('/getProductByCompany/:companyId',[
    param('companyId').isAlphanumeric('en-US').isLength({min:24,max:24})
],productController.getproductsWithCompanyId);
export default productRouter;