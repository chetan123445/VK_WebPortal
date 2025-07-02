# Email Setup for Announcements

## Overview
The announcement system now includes automatic email notifications. When an announcement is created, emails are automatically sent to all relevant users based on the `announcementFor` field.

## Environment Variables Required

Create a `.env` file in the `backend` directory with the following variables:

```env
# Email Configuration for Announcements
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vk_publications

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=5000
```

## Email Configuration

### Gmail Setup
1. Use a Gmail account for sending emails
2. Enable 2-factor authentication on your Gmail account
3. Generate an "App Password" from Google Account settings
4. Use the app password as `EMAIL_PASS` (not your regular Gmail password)

### Email Behavior

#### When "All" is selected:
- Sends emails to all users (Student, Teacher, Parent) and all admins
- Email body: "A new announcement has been made for all users."

#### When specific roles are selected:
- **Student**: 
  - If specific classes are selected: Sends to students in those classes + parents whose children are in those classes
  - If "ALL" classes: Sends to all students + all parents
- **Teacher**: Sends to all teachers
- **Parent**: Sends to all parents
- **Admin**: Sends to all admins

#### Special Case - Student with Classes:
- Students get: "A new announcement has been made for your class (X)."
- Parents get: "A new announcement has been made for your child's class (X)."

## Database Indexes

The following indexes have been added to the User model for faster email queries:
- `registeredAs` field index
- `class` field index
- Compound index on `{ registeredAs: 1, childClass: 1 }`

## Email Template

Emails include:
- Professional HTML template with VK Publications branding
- Personalized greeting with user's name
- Role-specific message
- **Truncated announcement text** (first 15 characters only)
- Preview notice for long announcements
- **No images or PDFs** - only text preview
- Link to login to the portal for full announcement and attachments

## Email Content

### Text Truncation
- Announcement text is truncated to **15 characters** in emails
- Long announcements show "..." after truncation
- A preview notice is added for truncated announcements
- Users must log into the portal to read the complete announcement

### Attachments
- **Images and PDFs are NOT sent via email**
- Only text preview is included in emails
- Users must log into the portal to view attachments
- This keeps emails lightweight and prevents delivery issues

### Benefits
- Prevents email clients from rejecting long emails
- Keeps email size manageable and lightweight
- Encourages users to visit the portal for full content and attachments
- Maintains professional email appearance
- Avoids email delivery issues with large attachments

## Error Handling

- If email sending fails, the announcement creation still succeeds
- Failed emails are logged but don't prevent the announcement from being created
- Duplicate emails are automatically filtered out

## File Upload Limits

### Announcement Attachments
- **Maximum file size**: 10MB per file (increased from 2MB)
- **Maximum files**: 10 files per announcement
- **Supported formats**: JPG, JPEG, PNG images and PDF files
- **Error handling**: Clear error messages for file size and type violations

## Testing

To test the email functionality:
1. Set up the environment variables
2. Create an announcement through the admin dashboard
3. Check the console logs for email sending results
4. Verify emails are received by test users

### Testing File Uploads
- Try uploading files of different sizes (up to 10MB)
- Test with multiple files (up to 10 files)
- Verify error messages for oversized or unsupported files 