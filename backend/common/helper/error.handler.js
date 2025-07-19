const ApiError = (err, req,res,next)=>{
    res.status(err.statusCode || 400).send({
        message: err.message
    })
}
export default ApiError