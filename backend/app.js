import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import router from "./routes/routes.js";
import DBconnection from './database/db.js';
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);
app.use('/uploads', express.static('backend/public/uploads'));

app.get('/', (req, res) => {
    res.send('Welcome to the VK Publications');
});

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: `File too large. Maximum file size is 10MB. Your file size: ${(error.limit / 1024 / 1024).toFixed(2)}MB` 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: `Too many files. Maximum 10 files allowed.` 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: `Unexpected file field. Please check your form data.` 
      });
    }
    return res.status(400).json({ message: `File upload error: ${error.message}` });
  }
  
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

DBconnection();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
});