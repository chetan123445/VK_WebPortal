import express from 'express';
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp } from '../controller/userController.js';
import { getAdmins, addAdmin, removeAdmin } from '../controller/adminController.js';

const router = express.Router();

router.post('/api/user/send-register-otp', sendRegisterOtp);
router.post('/api/user/verify-register-otp', verifyRegisterOtp);
router.post('/api/user/send-login-otp', sendLoginOtp);
router.post('/api/user/verify-login-otp', verifyLoginOtp);
router.post('/api/user/register', registerUser);
router.post('/api/user/find', findUserByEmail);
router.post('/api/user/login', loginUser);
router.get('/api/getadmins', getAdmins);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);

export default router;
