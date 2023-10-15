import fs from 'fs';
import path from 'path';
import dirname from './path.js'
const clearImage =async (fileName)=>{
    const filePath = path.join(dirname,fileName);
    await fs.promises.unlink(filePath);
}
export default clearImage;