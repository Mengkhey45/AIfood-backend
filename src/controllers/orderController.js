import { db } from "../config/firebase.js";

export const createOrder = async (req, res) => {
  try {
    const order = req.body;

    const docRef = await db.collection("orders").add({
      ...order,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const snapshot = await db.collection("orders").get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const orderRef = db.collection('orders').doc(id);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await orderRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};