import { Router } from "express";
import verifyToken from "../utils/verifyToken.js";
import cartController from '../controllers/cart.js'
import {query} from 'express-validator';
const cartRouter = Router();

cartRouter.get('/addToCart/:id',verifyToken,cartController.addToCart);
cartRouter.get('/deleteFromCart/:id',verifyToken,cartController.deleteFromCart);
cartRouter.get('/decreaseinCart/:id',verifyToken,cartController.decreaseinCart);
cartRouter.get('/getCart',verifyToken,cartController.getCart);
cartRouter.get('/checkout',verifyToken,[
    query('success_url','should be url').notEmpty().isURL(),
    query('cancel_url','shoud be url').notEmpty().isURL(),
],cartController.checkout);
cartRouter.get('/checkoutForExistsOrder/:id',verifyToken,[
    query('success_url','should be url').notEmpty().isURL(),
    query('cancel_url','shoud be url').notEmpty().isURL(),
],cartController.checkoutForExistsOrder);
cartRouter.get('/makeOrder',cartController.makeOrder);
cartRouter.get('/cancelOrder',cartController.cancelOrder);
export default cartRouter;