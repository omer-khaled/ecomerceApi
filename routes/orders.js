import { Router } from "express";
import verifyToken from "../utils/verifyToken.js";
import orderController from '../controllers/orders.js'
import verifyAdminToken from "../utils/verifyAdminToken.js";
const orderRouter = Router();

orderRouter.get('/getOrders',verifyToken,orderController.getOrders);

orderRouter.get('/AdmingetOrders',verifyAdminToken,orderController.AdmingetOrders);

orderRouter.get('/lastestOrders',verifyAdminToken,orderController.lastestOrders);

orderRouter.get('/getSingleOrder/:id',verifyToken,orderController.getSingleOrder);

orderRouter.get('/getSingleOrderAdmin/:id',verifyAdminToken,orderController.getSingleOrderAdmin);

orderRouter.patch('/updateStatusOrder/:id',verifyAdminToken,orderController.updateStatusOrder);


export default orderRouter;