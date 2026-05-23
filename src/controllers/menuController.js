import { db } from "../config/firebase.js";

const normalizeCategoryId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getMenuItems = async (req, res) => {
  try {
    const snapshot = await db.collection("menu").get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMenuCategories = async (req, res) => {
  try {
    const snapshot = await db.collection("menuCategories").get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMenuCategory = async (req, res) => {
  try {
    const { name } = req.body ?? {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: "Category name is required." });
    }

    const categoryName = String(name).trim();
    const categoryId = normalizeCategoryId(categoryName);

    if (!categoryId) {
      return res.status(400).json({ success: false, error: "Category name is invalid." });
    }

    const categoryRef = db.collection("menuCategories").doc(categoryId);
    const existing = await categoryRef.get();

    if (existing.exists) {
      return res.status(200).json({
        success: true,
        message: "Category already exists.",
        data: { id: categoryId, ...existing.data() },
      });
    }

    const category = {
      name: categoryName,
      createdAt: new Date().toISOString(),
    };

    await categoryRef.set(category);

    res.status(201).json({ success: true, message: "Category created.", data: { id: categoryId, ...category } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body ?? {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: "Menu item name is required." });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({ success: false, error: "Category is required." });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, error: "Valid price is required." });
    }

    const trimmedImage = String(image || "").trim();
    if (!trimmedImage) {
      return res.status(400).json({ success: false, error: "Image upload is required." });
    }

    const menuItem = {
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: numericPrice,
      category: String(category).trim(),
      image: trimmedImage,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("menu").add(menuItem);

    res.status(201).json({
      success: true,
      message: "Menu item created.",
      data: { id: docRef.id, ...menuItem },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: "Menu item id is required." });
    }

    await db.collection("menu").doc(id).delete();

    res.json({ success: true, message: "Menu item deleted." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: "Category id is required." });
    }

    await db.collection("menuCategories").doc(id).delete();

    res.json({ success: true, message: "Category deleted." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const seedMenuItems = async (req, res) => {
  try {
    const snapshot = await db.collection("menu").get();
    if (!snapshot.empty) {
      // Clear existing menu documents before reseeding to ensure images are updated
      const deleteBatch = db.batch();
      snapshot.docs.forEach((doc) => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
    }

    const seedItems = [
      {
        name: "Classic Burger",
        description: "Juicy beef patty with fresh lettuce and tomato",
        price: 12.99,
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Pepperoni Pizza",
        description: "Classic pizza with mozzarella and pepperoni",
        price: 16.99,
        category: "Pizza",
        image: "https://images.unsplash.com/photo-1601924638867-3ec9f7aa3f3b?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Caesar Salad",
        description: "Crisp romaine with parmesan and croutons",
        price: 10.99,
        category: "Salads",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Spaghetti Carbonara",
        description: "Creamy pasta with bacon and egg sauce",
        price: 14.99,
        category: "Pasta",
        image: "https://images.unsplash.com/photo-1603133872874-2f9b9f4f78b5?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Fried Chicken Wings",
        description: "Crispy wings with your choice of sauce",
        price: 11.99,
        category: "Appetizers",
        image: "https://images.unsplash.com/photo-1617191511519-6f6c2b0f6d5a?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Chocolate Cake",
        description: "Rich chocolate cake with ganache",
        price: 8.99,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1542828132-2d3d9f0b1a1d?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Iced Lemonade",
        description: "Fresh lemonade with ice",
        price: 4.99,
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1542444459-db3e0c39c3d6?w=800&q=80&auto=format&fit=crop",
      },
      {
        name: "Grilled Fish",
        description: "Fresh grilled fish with lemon butter",
        price: 18.99,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
      },
    ];

    const batch = db.batch();
    seedItems.forEach((item) => {
      const docRef = db.collection("menu").doc();
      batch.set(docRef, item);
    });
    await batch.commit();

    const categoryNames = Array.from(new Set(seedItems.map((item) => item.category)));
    const categoryBatch = db.batch();
    categoryNames.forEach((name) => {
      const id = normalizeCategoryId(name);
      const categoryRef = db.collection("menuCategories").doc(id);
      categoryBatch.set(
        categoryRef,
        {
          name,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });
    await categoryBatch.commit();

    res.status(201).json({ success: true, message: "Menu seeded.", count: seedItems.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
