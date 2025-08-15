const { uploadImageToGCS } = require('../utils/gcs');
const { analyzeReceiptWithAI } = require('../utils/ai');

const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded.' });
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      // 1. Upload to GCS
      const gcsUrl = await uploadImageToGCS(file);

      // 2. Convert to data URI for AI analysis
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // 3. Call Gemini AI
      const analysis = await analyzeReceiptWithAI(dataUri);

      return { gcsUrl, analysis };
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Error uploading images.', error: error.message });
  }
};

module.exports = { uploadImages };
