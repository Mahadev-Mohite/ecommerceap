//for custom errors
export default function errorHandeler(statusCode,message){
    //statuscode and message will be passed

    //error created
    const error = new Error();
    //statuscode assigned
    error.statusCode = statusCode;
    //meassage assigned
    error.message = message;
    //return
    return error;
}