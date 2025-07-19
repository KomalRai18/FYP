import mongoose, { mongo } from 'mongoose';
import bcrypt from 'bcrypt'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
    },
    email:{
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        minLength: 8,
        maxLenght: 30,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minLength: [8, 'Password should be atleast 8 characters long'],
        maxLength: [30, 'Password should be not more than 30 characters long'],
        validate: {
            validator: function(v){
                return /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/.test(v); 
            },
            message: props=> `Password must include atleast one small letter, one capital letter, any special character and number`
        }
    },
    confirmPassword:{
        type:String,
        required: true,
        minLength: [8, 'Password should be atleast 8 characters long'],
        maxLength: [30, 'Password should be not more than 30 characters long'],
        validate:{
            validator: function(v){
                return /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/.test(v); 
            },
            message: (props)=>`${props} is not a valid password`
        }

    },
    
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v){
                return /^\+92\d{10}$/.test(v);
            },
            message: props=> `${props} is not a valid phone number`
        }
    },
    is_verified:{
        type: Boolean,
        default: false,
    }
}, {timestamps: true})
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next() // this line of code checks if only there is change in the password field of doc, only then below lines of code gets to run else return next() and get outisde of the function  
    if(this.password !== this.confirmPassword) {
        throw new Error('Bad Request Exception: Password and Confirm Password doesnot match')
    } else {
        const salt = await bcrypt.genSalt()
        this.password = await bcrypt.hash(this.password, salt);
        console.log(`Password hashed ${this.password}`)
    }
    next()
})
userSchema.methods.isPasswordValidate = async function() {
    return await bcrypt.compare(password, this.password)
}
userSchema.pre(/^find/, function(next){
    
    this.startTime = Date.now()
    next()
})
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.name
    }, process.env.ACCESS_TOKEN, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}

export const User = model('User', userSchema)