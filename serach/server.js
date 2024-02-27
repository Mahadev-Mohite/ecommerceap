import express from 'express';
import routes from './routes/index.js'
import dotenv from 'dotenv';
dotenv.config();
const app =express();
const PORT = process.env.PORT || 5000;


app.use('/',routes);






app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})


app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(statusCode).json({
        sucess:false,
        statusCode,
        message
    })

});