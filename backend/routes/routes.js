import express from 'express';
import { registerUser, findUserByEmail, loginUser } from '../controller/userController.js';


const router = express.Router();


router.post('/api/user/register', registerUser);
router.post('/api/user/find', findUserByEmail);
router.post('/api/user/login', loginUser);


export default router;
