import express from 'express';
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp, deleteUser } from '../controller/userController.js';
import { getProfile, updateProfile, upload, verifyToken } from '../controller/profileController.js';
import { getAdmins, addAdmin, removeAdmin, isAdmin, adminLogin, checkSuperAdmin } from '../controller/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import studentController from '../controller/studentController.js';
import teacherController from '../controller/teacherController.js';
import * as parentController from '../controller/parentController.js';
import { getChildProfile } from '../controller/parentChildController.js';
import { findUserByEmail as manageFindUserByEmail, deleteUserByEmail as manageDeleteUserByEmail } from '../controller/manageUserController.js';

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
router.post('/api/user/find-by-email', findUserByEmail); // <-- Add this line
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
router.post('/api/parent/verify-child-email', parentController.verifyChildEmail);
router.post('/api/parent/verify-child-otp', parentController.verifyChildOtp); // <-- Add this line
router.get('/api/parent/child-profile', authenticateToken, getChildProfile);

// Protected routes (require JWT authentication)
router.get('/api/verify-token', authenticateToken, verifyToken);
router.get('/api/profile', authenticateToken, getProfile);
router.put('/api/profile', authenticateToken, memoryUpload.single('photo'), updateProfile);

// Admin routes
router.get('/api/getadmins', getAdmins);
router.post('/api/isadmin', isAdmin);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);
router.post('/api/admin/login', adminLogin); // Secure admin login route
router.post('/api/check-superadmin', checkSuperAdmin);
router.post('/api/user/delete', deleteUser);
router.post('/api/admin/find-user', manageFindUserByEmail); // Superadmin only
router.delete('/api/admin/delete-user', manageDeleteUserByEmail); // Superadmin only

export default router;
