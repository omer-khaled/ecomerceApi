const corsOption = {
    origin:'http://localhost:5173',
    methods:'OPTIONS,GET,POST,PUT,PATCH,DELETE',
    allowedHeaders:'Content-Type,Authorization',
    credentials:true,
}
export default corsOption;

