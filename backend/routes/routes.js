import express from 'express';
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp, getProfile, updateProfile, upload, verifyToken } from '../controller/userController.js';
import { getAdmins, addAdmin, removeAdmin } from '../controller/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import studentController from '../controller/studentController.js';
import teacherController from '../controller/teacherController.js';
import parentController from '../controller/parentController.js';

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

// Public routes
router.post('/api/user/send-register-otp', sendRegisterOtp);
router.post('/api/user/verify-register-otp', verifyRegisterOtp);
router.post('/api/user/send-login-otp', sendLoginOtp);
router.post('/api/user/verify-login-otp', verifyLoginOtp);
router.post('/api/user/register', registerUser);
router.post('/api/user/find', findUserByEmail);
router.post('/api/user/login', loginUser);

// Student routes
router.post('/api/student/send-otp', studentController.sendOtp);
router.post('/api/student/register', studentController.register);
router.post('/api/student/find', studentController.find);

// Teacher routes
router.post('/api/teacher/send-otp', teacherController.sendOtp);
router.post('/api/teacher/register', teacherController.register);
router.post('/api/teacher/find', teacherController.find);

// Parent routes
router.post('/api/parent/send-otp', parentController.sendOtp);
router.post('/api/parent/register', parentController.register);
router.post('/api/parent/find', parentController.find);

// Protected routes (require JWT authentication)
router.get('/api/verify-token', authenticateToken, verifyToken);
router.get('/api/profile', authenticateToken, getProfile);
router.put('/api/profile', authenticateToken, memoryUpload.single('photo'), updateProfile);

// Admin routes
router.get('/api/getadmins', getAdmins);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);

export default router;
