import jwt from 'jsonwebtoken';
const verifyAdminToken =async (request,response,next)=>{
   try{
        const authorization = request.headers['Authorization']||request.headers['authorization'];
        if(!authorization){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        const accessToken =  authorization.split(' ')[1];
        if(!accessToken){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        if(decodedToken?.role!==101){
            const error = new Error('un authorized');
            error.statusCode = 401;
            return next(error);
        }
        request.userId = decodedToken.userId;
        next();
   }catch(e){
        const error = new Error(e.message);
        error.statusCode = 500;
        next(error);
   }
}
export default verifyAdminToken;