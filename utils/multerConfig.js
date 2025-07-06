const multer = require('multer');

// Set up multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB (adjust as necessary)
  },
});

module.exports = upload;
