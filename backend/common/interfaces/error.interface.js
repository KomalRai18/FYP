class ApiError extends Error {
    constructor(
        statusCode,
        message = 'something wrong',
        success,
        errors = [],
        stack= ''
    ) {
      super(message)
        this.statusCode = statusCode,
        this.data = null,
        this.message = message,
        this.errors = errors,
        this.success = success

        if(stack){
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
       
    }
}