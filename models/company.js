// Companies
import { Schema,model } from "mongoose";

const companiesSchema =new Schema({
    name:{
        type:String,
        unique:true,
        required:true,
    },
    image:{
        type:String,
        required:true
    }
});

const Companies = model('companies',companiesSchema);

export default Companies;