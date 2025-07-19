import express from 'express'
import { signup, login, logout, resetPassword, forgotPassword} from '../controllers/user.controller.js';
const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/forgot-password', forgotPassword)

export default userRouter