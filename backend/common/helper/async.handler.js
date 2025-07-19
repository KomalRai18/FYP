const asyncHandler = (func)=>{
    return async(req, res, next)=>{
        try {
            await func(req,res,next)
        } catch (error) {
            res.status(error.code || 404).json({
                success:false,
                message: error.message
            })
        }
    }
}
export default asyncHandler