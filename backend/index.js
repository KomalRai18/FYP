import express from 'express'
import dotenv from 'dotenv'
import cookieparser from 'cookie-parser'
// import twitterRouter from './routes/twitter.routes.js';
import userRouter from './routes/user.routes.js'
import ConnectionDB from './connection.js';
import cors from 'cors'

const app = express();
dotenv.config({'path': '.env.development'})
const port = process.env.PORT || 3000;
ConnectionDB()
app.use(express.json({limit: '16kb', type: 'application/json'}))
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(cookieparser())

const whitelist = ['http://localhost:5173', 'http://localhost:4000']
const corsOptions = {
    origin: function(origin, cb){
        if(whitelist.indexOf(origin) !== -1) {
            cb(null, true)
        } else{
            cb(new Error('Not allowed by cors'))
        }
    }
}

// app.use('/api/twitter', corsOptions(), twitterRouter)
app.use('/api/user', cors(corsOptions), userRouter)

app.listen(port, (req,res)=>{
    console.log(`Server has started at port ${port}`)
})