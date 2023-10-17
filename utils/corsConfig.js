const corsOption = {
    origin:['https://omer-khaled.github.io','https://comerce-ecru.vercel.app'],
    methods:'OPTIONS,GET,POST,PUT,PATCH,DELETE',
    allowedHeaders:'Content-Type,Authorization',
    credentials:true,
}
export default corsOption;

