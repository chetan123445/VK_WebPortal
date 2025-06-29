import Announcement from '../models/Announcement.js';
import Admin from '../models/Admin.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer config for memory storage (buffer)
const storage = multer.memoryStorage();
export const announcementUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
  fileFilter: (req, file, cb) => {
    // Accept jpg/jpeg/png images and pdfs
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only jpg, png images and pdf files allowed'));
    cb(null, true);
  }
});

// Create announcement (images and pdfs as Buffer)
export const createAnnouncement = async (req, res) => {
  try {
    const { text, createdBy, classes } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: 'Announcement text is required' });
    }
    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({ message: 'At least one class is required' });
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: f.mimetype === 'application/pdf' ? 'pdf' : 'image'
      }));
    }
    const creatorEmail = createdBy || (req.user && req.user.email);
    if (!creatorEmail) {
      return res.status(400).json({ message: 'Creator email is required' });
    }
    const announcement = await Announcement.create({
      text,
      images,
      classes,
      createdBy: creatorEmail
    });
    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (err) {
    res.status(500).json({ message: 'Error creating announcement', error: err.message });
  }
};

// Get all announcements (convert images and pdfs to base64 or download link)
// Accepts optional ?class=10 parameter to filter for students
export const getAnnouncements = async (req, res) => {
  try {
    let studentClass = req.query.class;
    let announcements = await Announcement.find({}).sort({ createdAt: -1 });

    console.log("Backend: Received class from frontend:", studentClass); // <-- log class received

    // Only include announcements where the student's class is in the announcement's classes array
    if (studentClass) {
      announcements = announcements.filter(a =>
        Array.isArray(a.classes) && a.classes.includes(studentClass)
      );
    }

    // Log the announcements being sent back
    console.log(
      "Backend: Announcements being sent for class",
      studentClass,
      announcements.map(a => ({
        _id: a._id,
        text: a.text,
        classes: a.classes,
        createdBy: a.createdBy,
        createdAt: a.createdAt
      }))
    );

    const announcementsWithBase64 = announcements.map(a => {
      const images = (a.images || []).map(img => {
        if (!img || !img.data) return null;
        if (img.contentType === 'application/pdf') {
          // For PDFs, return a base64 data URL with fileType
          return {
            url: `data:application/pdf;base64,${img.data.toString('base64')}`,
            fileType: 'pdf'
          };
        }
        // For images
        return {
          url: `data:${img.contentType};base64,${img.data.toString('base64')}`,
          fileType: 'image'
        };
      }).filter(Boolean);
      return {
        _id: a._id,
        text: a.text,
        images,
        classes: a.classes,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      };
    });
    res.json({ announcements: announcementsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements', error: err.message });
  }
};

// Update announcement (replace/add images as Buffer, update classes)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    // Accept classes[] as array or string (from form-data)
    let classes = req.body['classes[]'] || req.body.classes;
    if (typeof classes === "string") {
      // If only one class, it will be a string, else array
      classes = [classes];
    }
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    if (typeof text === 'string') announcement.text = text;
    // Update classes if provided
    if (classes && Array.isArray(classes) && classes.length > 0) {
      announcement.classes = classes;
    }
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: f.mimetype === 'application/pdf' ? 'pdf' : 'image'
      }));
      announcement.images = [...(announcement.images || []), ...newImages];
    }
    announcement.updatedAt = Date.now();
    await announcement.save();
    // Convert images to base64 for response
    const images = (announcement.images || []).map(img =>
      img && img.data
        ? {
            url: img.contentType === 'application/pdf'
              ? `data:application/pdf;base64,${img.data.toString('base64')}`
              : `data:${img.contentType};base64,${img.data.toString('base64')}`,
            fileType: img.fileType || (img.contentType === 'application/pdf' ? 'pdf' : 'image')
          }
        : null
    ).filter(Boolean);
    res.json({
      message: 'Announcement updated',
      announcement: {
        _id: announcement._id,
        text: announcement.text,
        images,
        classes: announcement.classes,
        createdBy: announcement.createdBy,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating announcement', error: err.message });
  }
};

// Delete announcement (no disk files to remove)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await Announcement.findByIdAndDelete(id);
    res.json({ message: 'Announcement deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting announcement', error: err.message });
  }
};

// Remove a specific image from an announcement by index
export const removeAnnouncementImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIndex } = req.body;
    if (typeof imageIndex !== 'number') {
      return res.status(400).json({ message: 'imageIndex (number) is required in body' });
    }
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    if (!Array.isArray(announcement.images) || imageIndex < 0 || imageIndex >= announcement.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }
    announcement.images.splice(imageIndex, 1);
    announcement.updatedAt = Date.now();
    await announcement.save();
    res.json({ message: 'Image removed from announcement', announcement });
  } catch (err) {
    res.status(500).json({ message: 'Error removing image', error: err.message });
  }
};