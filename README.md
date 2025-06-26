# VK Web Portal

A comprehensive web portal for VK Publications with multi-user authentication, role-based access control, and secure communication features.

## 🏗️ Architecture Overview

### Backend Architecture (Node.js + Express + MongoDB)

```
backend/
├── app.js                 # Main server entry point
├── database/
│   └── db.js             # MongoDB connection configuration
├── models/
│   ├── User.js           # User schema (Students, Teachers, Parents)
│   └── Admin.js          # Admin schema with superadmin support
├── controller/
│   ├── userController.js     # User authentication & management
│   ├── adminController.js    # Admin management & authentication
│   ├── profileController.js  # Profile management & file uploads
│   ├── studentController.js  # Student-specific operations
│   ├── teacherController.js  # Teacher-specific operations
│   ├── parentController.js   # Parent-specific operations
│   └── parentChildController.js # Parent-child relationship management
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── routes/
│   └── routes.js         # API route definitions
└── public/
    └── uploads/          # File upload storage
```

### Frontend Architecture (Next.js + React)

```
frontend/
├── app/                  # Next.js 13+ app directory
│   ├── layout.js         # Root layout component
│   ├── page.js           # Home page
│   └── login/
│       └── page.js       # Login page
├── pages/                # Legacy pages directory
│   ├── Login.js          # Main login component
│   ├── MainHome.js       # Protected home page
│   ├── ProfileMenu.js    # Profile management
│   ├── apiurl.js         # API configuration
│   ├── admin/
│   │   └── dashboard.js  # Admin dashboard
│   ├── student/
│   │   └── dashboard.js  # Student dashboard
│   ├── teacher/
│   │   └── dashboard.js  # Teacher dashboard
│   ├── parent/
│   │   └── dashboard.js  # Parent dashboard
│   └── register-*.js     # Registration pages
├── components/
│   └── ProtectedRoute.js # Route protection component
├── service/
│   └── api.js           # API service layer
├── utils/
│   └── auth.js          # Authentication utilities
└── public/              # Static assets
```

## 🔐 Authentication System

### Multi-Method Authentication
- **Email & Password**: Traditional login with bcrypt hashing
- **Email & OTP**: Secure OTP-based authentication with 3-minute expiration
- **JWT Tokens**: Persistent sessions with 7-day expiration

### User Types & Roles
1. **Students**: Can register and access student-specific features
2. **Teachers**: Can register and access teacher-specific features  
3. **Parents**: Can register and link to child accounts
4. **Admins**: Can manage users and system settings
5. **Super Admins**: Full system control with admin management

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- OTP expiration (3 minutes for registration, 15 seconds for login)
- Protected routes with middleware
- Email verification for OTP delivery

## 📧 Email System

### OTP Delivery
- Uses Nodemailer with Gmail SMTP
- Separate OTP stores for registration and login
- Automatic email notifications for admin operations

### Email Templates
- Registration OTP emails
- Login OTP emails
- Admin credential emails
- Admin removal notifications

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  registeredAs: String (enum: ['Student', 'Teacher', 'Parent']),
  email: String (required, unique),
  password: String (hashed),
  school: String,
  class: String,
  phone: String (10 digits),
  childEmail: String (for parents),
  photo: { data: Buffer, contentType: String }
}
```

### Admin Model
```javascript
{
  email: String (required, unique),
  password: String (hashed),
  isSuperAdmin: Boolean (default: false),
  name: String,
  phone: String,
  photo: { data: Buffer, contentType: String }
}
```

## 🚀 API Endpoints

### Public Routes
- `POST /api/user/send-register-otp` - Send registration OTP
- `POST /api/user/verify-register-otp` - Verify registration OTP
- `POST /api/user/send-login-otp` - Send login OTP
- `POST /api/user/verify-login-otp` - Verify login OTP
- `POST /api/user/register` - Register new user
- `POST /api/user/find-by-email` - Find user by email
- `POST /api/user/login` - User login

### Student Routes
- `POST /api/student/send-otp` - Send student registration OTP
- `POST /api/student/register` - Register student
- `POST /api/student/find` - Find student

### Teacher Routes
- `POST /api/teacher/send-otp` - Send teacher registration OTP
- `POST /api/teacher/register` - Register teacher
- `POST /api/teacher/find` - Find teacher

### Parent Routes
- `POST /api/parent/verify-child-email` - Verify child email
- `GET /api/parent/child-profile` - Get child profile (protected)

### Protected Routes (JWT Required)
- `GET /api/verify-token` - Verify JWT token
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile (with file upload)

### Admin Routes
- `GET /api/getadmins` - Get all admins
- `POST /api/isadmin` - Check if email is admin
- `POST /api/addadmins` - Add new admin
- `DELETE /api/removeadmin` - Remove admin
- `POST /api/admin/login` - Admin login
- `POST /api/check-superadmin` - Check superadmin status

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Gmail account for email services

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Server
   PORT=8000
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email (Gmail)
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

## 🔧 Key Features

### User Management
- **Multi-role registration**: Students, Teachers, Parents
- **Profile management**: Update personal information and photos
- **Secure authentication**: Multiple login methods
- **Session persistence**: JWT-based sessions

### Admin System
- **Super Admin**: Full system control
- **Admin Management**: Add/remove admins
- **User oversight**: Monitor and manage users
- **Secure admin login**: Separate admin authentication

### File Management
- **Profile photos**: Upload and store user photos
- **Multer integration**: Secure file upload handling
- **Image compression**: Optimized image storage

### Security Features
- **Password hashing**: bcrypt encryption
- **JWT tokens**: Secure session management
- **OTP verification**: Time-limited one-time passwords
- **Protected routes**: Role-based access control
- **Input validation**: Server-side validation

## 📱 User Experience

### Login Flow
1. User enters email
2. Chooses login method (Password or OTP)
3. If OTP: Receives email with 6-digit code
4. If Password: Direct authentication
5. JWT token generated and stored
6. Redirected to role-specific dashboard

### Registration Flow
1. User selects registration type
2. Enters personal information
3. Receives OTP via email
4. Verifies OTP
5. Account created with hashed password
6. Redirected to login

### Dashboard Access
- **Students**: Access student-specific features
- **Teachers**: Access teacher-specific features
- **Parents**: Access parent dashboard with child linking
- **Admins**: Access admin panel with user management

## 🔒 Security Considerations

### Production Recommendations
1. **Change JWT Secret**: Use strong, unique secret
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Consider httpOnly cookies
4. **Rate Limiting**: Add rate limiting to auth endpoints
5. **Environment Variables**: Secure all sensitive data
6. **Database Security**: Use MongoDB Atlas or secure MongoDB setup

### Current Security Features
- Password hashing with bcrypt
- JWT token expiration (7 days)
- OTP expiration (3 minutes registration, 15 seconds login)
- Protected API routes
- Input sanitization and validation
- Secure file upload handling

## 🐛 Troubleshooting

### Common Issues
1. **Email not sending**: Check Gmail app password and EMAIL_USER/EMAIL_PASS
2. **Database connection**: Verify MONGODB_URI in .env
3. **JWT errors**: Ensure JWT_SECRET is set
4. **File uploads**: Check uploads directory permissions

### Development Tips
- Use `console.log` for debugging OTP delivery
- Check browser console for frontend errors
- Monitor MongoDB connection in backend logs
- Verify all environment variables are set

## 📄 License

This project is proprietary software for VK Publications.

---

**Note**: Make sure the backend is running before using the frontend. Place your `default-avatar.png` in the `frontend/public/` folder for the default profile picture.
