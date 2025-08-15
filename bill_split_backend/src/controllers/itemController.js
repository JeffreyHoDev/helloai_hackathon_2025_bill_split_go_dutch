const admin = require('firebase-admin');

const createItem = async (req, res) => {
  try {
    const receiptRef = admin.firestore().collection('receipts').doc(req.params.receiptId);
    const receiptDoc = await receiptRef.get();

    if (!receiptDoc.exists) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }

    if (receiptDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden. You can only add items to your own receipts.' });
    }

    const newItem = req.body;
    const itemRef = await receiptRef.collection('items').add(newItem);

    res.status(201).json({ id: itemRef.id, ...newItem });
  } catch (error) {
    console.error('Error adding item to receipt:', error);
    res.status(500).json({ message: 'Error adding item to receipt.', error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const receiptRef = admin.firestore().collection('receipts').doc(req.params.receiptId);
    const receiptDoc = await receiptRef.get();

    if (!receiptDoc.exists) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }

    if (receiptDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden. You can only update items on your own receipts.' });
    }

    const itemRef = receiptRef.collection('items').doc(req.params.itemId);
    await itemRef.update(req.body);

    res.status(200).json({ message: 'Item updated successfully.' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item.', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const receiptRef = admin.firestore().collection('receipts').doc(req.params.receiptId);
    const receiptDoc = await receiptRef.get();

    if (!receiptDoc.exists) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }

    if (receiptDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden. You can only delete items from your own receipts.' });
    }

    const itemRef = receiptRef.collection('items').doc(req.params.itemId);
    await itemRef.delete();

    res.status(200).json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item.', error: error.message });
  }
};

module.exports = { createItem, updateItem, deleteItem };
