import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const diskStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename:(req,file,cb)=>{
        const actualName = file.originalname.slice(0,(file.originalname.length - ((file.mimetype.split('/')[1]).length + 1)))
        const fileName = uuidv4()+actualName+'.webp';
        cb(null,fileName);
    }
});

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === "image/jpeg"|| file.mimetype === "image/webp"  || file.mimetype === "image/jpg" || file.mimetype === "image/png"){
        cb(null,true);
    }
    cb(null,false);
}
const uploader = multer({
    storage:diskStorage,
    fileFilter:fileFilter
});

export default uploader;