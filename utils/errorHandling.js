const errorHandel = (err,request,response,next)=>{
    response.status(err.statusCode||500).json({
        message:err.message,
        errors:(err.details)?err.details:err.message,
        status:false,
    })
}
export default errorHandel;