import express from 'express';
<<<<<<< HEAD
=======
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp } from '../controller/userController.js';
>>>>>>> c845f37 (Email and otp)


const router = express.Router();


<<<<<<< HEAD
export default router;

import express from 'express';
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp } from '../controller/userController.js';


const router = express.Router();


=======
>>>>>>> c845f37 (Email and otp)
router.post('/api/user/send-register-otp', sendRegisterOtp);
router.post('/api/user/verify-register-otp', verifyRegisterOtp);
router.post('/api/user/send-login-otp', sendLoginOtp);
router.post('/api/user/verify-login-otp', verifyLoginOtp);
router.post('/api/user/register', registerUser);
router.post('/api/user/find', findUserByEmail);
router.post('/api/user/login', loginUser);


export default router;
