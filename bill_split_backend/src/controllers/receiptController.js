const admin = require('firebase-admin');
const { uploadImageToGCS, bucket } = require('../utils/gcs');
const { analyzeReceiptWithAI } = require('../utils/ai');

const getAllReceipts = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Query for receipts owned by the user
    const ownedReceiptsQuery = admin.firestore().collection('receipts').where('ownerId', '==', userId);
    // Query for receipts where the user is a participant
    const participantReceiptsQuery = admin.firestore().collection('receipts').where('participantIds', 'array-contains', userId);

    const [ownedReceiptsSnapshot, participantReceiptsSnapshot] = await Promise.all([
      ownedReceiptsQuery.get(),
      participantReceiptsQuery.get(),
    ]);

    const receiptsMap = new Map();
    ownedReceiptsSnapshot.forEach(doc => receiptsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    participantReceiptsSnapshot.forEach(doc => receiptsMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const receipts = Array.from(receiptsMap.values());

    // Fetch user data for all participants
    const receiptsWithUsers = await Promise.all(receipts.map(async (receipt) => {
      const users = {};
      if (receipt.participantIds) {
        for (const participantId of receipt.participantIds) {
          const userDoc = await admin.firestore().collection('users').doc(participantId).get();
          if (userDoc.exists) {
            users[participantId] = userDoc.data();
          }
        }
      }
      return { ...receipt, users };
    }));

    res.status(200).json(receiptsWithUsers);
  } catch (error) {
    console.error('Error fetching all receipts:', error);
    res.status(500).json({ message: 'Error fetching all receipts.', error: error.message });
  }
};

const createReceipt = async (req, res) => {
  try {
    const imageInfo = [];
    if (req.files) {
      for (const file of req.files) {
        const gcsUrl = await uploadImageToGCS(file);
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const analysis = await analyzeReceiptWithAI(dataUri);
        imageInfo.push({ gcsUrl, analysis });
      }
    }

    const { ownerId, totalAmount, date, participantIds, tax, serviceCharge } = req.body;
    // Potentially use the title from the first analysis as the receipt title
    const title = imageInfo.length > 0 ? imageInfo[0].analysis.title : 'Untitled Receipt';
    // Aggregate all items from all analyses
    const items = imageInfo.flatMap(info => info.analysis?.items || []);

    const newReceipt = {
      ownerId: req.user.uid,
      title,
      totalAmount,
      date,
      items,
      participantIds: participantIds || [req.user.uid], // Ensure the owner is a participant
      images: imageInfo,
      createdAt: new Date().toISOString(),
      tax: tax || 0,
      serviceCharge: serviceCharge || 0,
    };

    const receiptRef = await admin.firestore().collection('receipts').add(newReceipt);
    res.status(201).json({ id: receiptRef.id, ...newReceipt });
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ message: 'Error creating receipt.', error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const receiptDoc = await admin.firestore().collection('receipts').doc(req.params.receiptId).get();
    if (!receiptDoc.exists) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }
    // Basic authorization: check if the user is a participant
    if (!receiptDoc.data().participantIds.includes(req.user.uid)) {
        return res.status(403).json({ message: 'Forbidden. You can only view receipts you are a part of.' });
    }
    res.status(200).json({ id: receiptDoc.id, ...receiptDoc.data() });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ message: 'Error fetching receipt.', error: error.message });
  }
};

const updateReceipt = async (req, res) => {
  try {
    const receiptRef = admin.firestore().collection('receipts').doc(req.params.receiptId);
    const receiptDoc = await receiptRef.get();

    if (!receiptDoc.exists) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }

    if (receiptDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden. You can only update your own receipts.' });
    }

    await receiptRef.update(req.body);
    res.status(200).json({ message: 'Receipt updated successfully.' });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ message: 'Error updating receipt.', error: error.message });
  }
};

const deleteReceipt = async (req, res) => {
  try {
    const receiptRef = admin.firestore().collection('receipts').doc(req.params.receiptId);
    const receiptDoc = await receiptRef.get();

    if (!receiptDoc.exists) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }

    if (receiptDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden. You can only delete your own receipts.' });
    }

    // Delete images from GCS
    const imageUrls = receiptDoc.data().imageUrls;
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        const filename = url.split(`${bucket.name}/`)[1];
        await bucket.file(filename).delete();
      }
    }

    await receiptRef.delete();
    res.status(200).json({ message: 'Receipt deleted successfully.' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ message: 'Error deleting receipt.', error: error.message });
  }
};

module.exports = { getAllReceipts, createReceipt, getReceipt, updateReceipt, deleteReceipt };