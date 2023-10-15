import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOption from './utils/corsConfig.js';
import mongoose from 'mongoose';
import errorHandel from './utils/errorHandling.js';
import authRouter from './routes/auth.js';
import path from 'path';
import dirname from './utils/path.js';
import dotenv from 'dotenv';
dotenv.config();
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/orders.js';
import companyRouter from './routes/company.js';
import categoryRouter from './routes/category.js';
import blogRouter from './routes/blog.js';
import compression from 'compression';
// import resizingMiddleware from './utils/handleImages.js';
import expressStaticGzip from 'express-static-gzip';
/*app*/ 
const app = express();
// compression
app.use(compression());
// app.use(expressStaticGzip('public', {
//     enableBrotli: true,
//     orderPreference: ['br', 'gz']
// }));
/* static images */
app.use('/images',express.static(path.join(dirname,'images')))
/*parsing and headers*/ 
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(cookieParser());
/*connect to mongodb*/ 
app.use('/auth',authRouter);
app.use('/products',productRouter);
app.use('/cart',cartRouter);
app.use('/order',orderRouter);
app.use('/category',categoryRouter);
app.use('/company',companyRouter);
app.use('/blog',blogRouter);
app.use(errorHandel);
const port = process.env.PORT || 3002;
mongoose.connect('mongodb://omerkhaledmohamedmohamed123:omerkhaledmohamedmohamed123@ac-pb3xiyu-shard-00-00.usyklnx.mongodb.net:27017,ac-pb3xiyu-shard-00-01.usyklnx.mongodb.net:27017,ac-pb3xiyu-shard-00-02.usyklnx.mongodb.net:27017/ecomerce?ssl=true&replicaSet=atlas-pn046e-shard-0&authSource=admin&retryWrites=true&w=majority').then(()=>{
    app.listen(port);
    console.log('server running');
}).catch(e=>{
    console.log(e);
});