// categories
import { Schema,model } from "mongoose";

const categorySchema =new Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    image:{
        type:String,
        required:true
    }
});

const Categories = model('categories',categorySchema);

export default Categories;