const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS
app.use(cors());

// Compression endpoint
app.post('/compress', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No PDF file uploaded');
    }
    
    const compressionLevel = req.body.compressionLevel || 'medium';
    const pdfBuffer = req.file.buffer;
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Apply compression based on level
    const saveOptions = {
      useObjectStreams: true,
      useCompression: true
    };
    
    if (compressionLevel === 'high') {
      // More aggressive compression settings
      saveOptions.throwIfEncrypted = false;
      // Additional high compression options would go here
    }
    
    // Save compressed PDF
    const compressedPdf = await pdfDoc.save(saveOptions);
    
    // Send back compressed PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');
    res.send(Buffer.from(compressedPdf));
    
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).send('Error compressing PDF');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});