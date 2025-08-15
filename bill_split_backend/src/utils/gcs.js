const { Storage } = require('@google-cloud/storage');

// TODO: Replace 'your-gcp-bucket-name' with your actual Google Cloud Storage bucket name.
const BUCKET_NAME = 'hackathon2025-bill-split';

const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

console.log('Google Cloud Storage initialized with default authentication.');

const uploadImageToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = `${Date.now()}_${file.originalname}`;
    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      console.error('GCS Upload Stream Error:', error);
      reject('GCS Upload failed: ' + error.message);
    });

    blobStream.on('finish', () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
}

module.exports = { uploadImageToGCS, bucket };
