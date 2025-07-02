import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { generateToken } from '../middleware/auth.js';

const otpStore = {}; // { email: { otp, expires } }
const loginOtpStore = {}; // Separate store for login OTPs

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

if (!emailUser || !emailPass) {
  console.error("EMAIL_USER or EMAIL_PASS is not set in .env");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'backend', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});
export const upload = multer({ storage });

// Verify transporter at startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('Nodemailer transporter verification failed:', error);
  } else {
    console.log('Nodemailer transporter is ready');
  }
});

// Function to send announcement emails
export const sendAnnouncementEmails = async (announcementFor, classes, announcementText, createdBy) => {
  try {
    if (!emailUser || !emailPass) {
      console.error('EMAIL_USER or EMAIL_PASS missing for announcement emails');
      return { successful: 0, failed: 0, total: 0, error: 'Email credentials not configured' };
    }

    // Truncate announcement text for email (first 15 characters)
    const maxEmailLength = 50;
    const truncatedText = announcementText.length > maxEmailLength 
      ? announcementText.substring(0, maxEmailLength) + '...'
      : announcementText;

    const emailRecipients = [];
    const normalizedAnnouncementFor = announcementFor.map(role => role.toLowerCase());

    // Handle "All" option
    if (normalizedAnnouncementFor.includes('all')) {
      // Send to all users (Student, Teacher, Parent) and all admins
      const allUsers = await User.find({});
      const allAdmins = await Admin.find({});
      
      allUsers.forEach(user => {
        emailRecipients.push({
          email: user.email,
          name: user.name,
          registeredAs: user.registeredAs,
          message: `A new announcement has been made you.`
        });
      });
      
      allAdmins.forEach(admin => {
        emailRecipients.push({
          email: admin.email,
          name: admin.name || 'Admin',
          registeredAs: 'Admin',
          message: `A new announcement has been made for you.`
        });
      });
    } else {
      // Handle specific roles
      for (const role of normalizedAnnouncementFor) {
        if (role === 'admin') {
          // Send to all admins
          const admins = await Admin.find({});
          admins.forEach(admin => {
            emailRecipients.push({
              email: admin.email,
              name: admin.name || 'Admin',
              registeredAs: 'Admin',
              message: `A new announcement has been made for administrators.`
            });
          });
        } else if (role === 'student') {
          if (classes && classes.length > 0 && !classes.includes('ALL')) {
            // Send to students in specific classes
            const students = await User.find({ 
              registeredAs: 'Student', 
              class: { $in: classes } 
            });
            
            students.forEach(student => {
              emailRecipients.push({
                email: student.email,
                name: student.name,
                registeredAs: 'Student',
                message: `A new announcement has been made for your class (${student.class}).`
              });
            });

            // Send to parents whose children are in these classes
            const parents = await User.find({ 
              registeredAs: 'Parent', 
              childClass: { $in: classes } 
            });
            
            parents.forEach(parent => {
              emailRecipients.push({
                email: parent.email,
                name: parent.name,
                registeredAs: 'Parent',
                message: `A new announcement has been made for your child's class (${parent.childClass}).`
              });
            });
          } else {
            // Send to all students
            const students = await User.find({ registeredAs: 'Student' });
            students.forEach(student => {
              emailRecipients.push({
                email: student.email,
                name: student.name,
                registeredAs: 'Student',
                message: `A new announcement has been made for you.`
              });
            });

            // Send to all parents
            const parents = await User.find({ registeredAs: 'Parent' });
            parents.forEach(parent => {
              emailRecipients.push({
                email: parent.email,
                name: parent.name,
                registeredAs: 'Parent',
                message: `A new announcement has been made for your child.`
              });
            });
          }
        } else if (role === 'teacher') {
          // Send to all teachers
          const teachers = await User.find({ registeredAs: 'Teacher' });
          teachers.forEach(teacher => {
            emailRecipients.push({
              email: teacher.email,
              name: teacher.name,
              registeredAs: 'Teacher',
              message: `A new announcement has been made for you.`
            });
          });
        } else if (role === 'parent') {
          // Send to all parents
          const parents = await User.find({ registeredAs: 'Parent' });
          parents.forEach(parent => {
            emailRecipients.push({
              email: parent.email,
              name: parent.name,
              registeredAs: 'Parent',
              message: `A new announcement has been made for you.`
            });
          });
        }
      }
    }

    // Remove duplicates based on email
    const uniqueRecipients = emailRecipients.filter((recipient, index, self) => 
      index === self.findIndex(r => r.email === recipient.email)
    );

    // Send emails
    const emailPromises = uniqueRecipients.map(recipient => {
      const mailOptions = {
        from: emailUser,
        to: recipient.email,
        subject: 'New Announcement - VK Publications',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">VK Publications</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">New Announcement</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                Dear ${recipient.name},
              </p>
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                ${recipient.message}
              </p>
                             <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; margin: 15px 0;">
                 <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                   ${truncatedText}
                 </p>
               </div>
                             <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                 Please log in to your VK Publications portal to view the complete announcement with any attached images or documents.
               </p>
               ${announcementText.length > maxEmailLength ? 
                 '<p style="margin: 10px 0 0 0; font-size: 12px; color: #888; font-style: italic;">(This is a preview of the announcement. Full text and attachments available in the portal.)</p>' 
                 : ''
               }
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: #888;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      return transporter.sendMail(mailOptions).catch(error => {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return null; // Return null instead of throwing to continue with other emails
      });
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    
    // Log results
    const successful = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
    const failed = results.filter(result => result.status === 'rejected' || result.value === null).length;
    
    console.log(`Announcement emails sent: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, total: uniqueRecipients.length };
  } catch (error) {
    console.error('Error sending announcement emails:', error);
    throw error;
  }
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    otpStore[cleanEmail] = { otp, expires: Date.now() + 3 * 60 * 1000 }; // 3 min

    if (!emailUser || !emailPass) {
      console.error('EMAIL_USER or EMAIL_PASS missing at sendRegisterOtp');
      return res.status(500).json({ message: 'Email credentials not set on server.' });
    }

    // Log the email and OTP for debugging (remove in production)
    console.log(`Sending OTP ${otp} to ${cleanEmail}`);

    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Registration OTP',
      text: `Your OTP for registration is: ${otp}`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, registeredAs, email, password, school, class: userClass, phone, otp, childEmail, childClass } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    // OTP check
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      registeredAs,
      email: cleanEmail,
      password: hashedPassword,
      school,
      class: userClass,
      phone: phone || "",
      // Save childEmail and childClass only if registering as Parent
      ...(registeredAs === 'Parent' && childEmail ? { childEmail: childEmail.trim().toLowerCase() } : {}),
      ...(registeredAs === 'Parent' && childClass ? { childClass: childClass.trim() } : {})
    });
    await user.save();
    // Remove OTP after successful registration
    delete otpStore[cleanEmail];
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    // Check User collection
    let user = await User.findOne({ email: cleanEmail });
    if (user) return res.json({ user, type: 'user' });
    // Check Admin collection
    let admin = await Admin.findOne({ email: cleanEmail });
    if (admin) return res.json({ admin, type: 'admin' });
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: 'Error finding user', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    // Generate JWT token with role
    const token = generateToken(user._id, user.registeredAs);

    res.status(200).json({ 
      message: "Login successful", 
      token,
      user: { 
        id: user._id,
        email: user.email, 
        registeredAs: user.registeredAs,
        name: user.name
      } 
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    // Check User collection
    let user = await User.findOne({ email: cleanEmail });
    let isAdmin = false;
    if (!user) {
      // Check Admin collection
      let admin = await Admin.findOne({ email: cleanEmail });
      if (!admin) return res.status(404).json({ message: 'User not found' });
      isAdmin = true;
    }
    const otp = generateOtp();
    loginOtpStore[cleanEmail] = { otp, expires: Date.now() + 120 * 1000 }; // 2 min

    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Login OTP',
      text: `Your OTP for login is: ${otp}`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error("Failed to send login OTP:", err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = loginOtpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Check User collection
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      // Generate JWT token with role
      const token = generateToken(user._id, user.registeredAs);
      delete loginOtpStore[cleanEmail];
      return res.json({
        message: 'OTP verified',
        token,
        user: {
          id: user._id,
          email: user.email,
          registeredAs: user.registeredAs,
          name: user.name
        }
      });
    }
    // Check Admin collection
    let admin = await Admin.findOne({ email: cleanEmail });
    if (admin) {
      // Generate JWT token for admin
      const token = generateToken(admin._id, 'admin');
      delete loginOtpStore[cleanEmail];
      return res.json({
        message: 'OTP verified',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          isSuperAdmin: admin.isSuperAdmin
        }
      });
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const cleanEmail = email.trim().toLowerCase();
    const deleted = await User.deleteOne({ email: cleanEmail });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
};

