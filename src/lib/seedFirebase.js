import { db } from './firebase'; // Adjust paths as needed
import { collection, addDoc } from 'firebase/firestore';

export async function seedFirebaseDatabase() {
  console.log("🚀 Initializing live Firebase seed execution...");
  
  try {
    // --- 1. SEED TEST PRODUCTS DATA ---
    const productsRef = collection(db, 'products');
    
    const mockProducts = [
      {
        sku: "SKU-BASMATI",
        name: "Premium Basmati Rice (Grade A)",
        category: "Grains & Cereals",
        stock: 14500,
        availableStock: 14500,
        value: "₹65L",
        assetValuation: "₹65L",
        imageUrl: "", // Left blank to display default package icons or test inline storage uploads
        createdAt: new Date().toISOString()
      },
      {
        sku: "SKU-ALMOND",
        name: "Organic Raw Almonds",
        category: "Nuts & Seeds",
        stock: 4200,
        availableStock: 4200,
        value: "₹28L",
        assetValuation: "₹28L",
        imageUrl: "",
        createdAt: new Date().toISOString()
      },
      {
        sku: "SKU-TURMERIC",
        name: "Pure Haldi Turmeric Powder",
        category: "Spices",
        stock: 8900,
        availableStock: 8900,
        value: "₹18.5L",
        assetValuation: "₹18.5L",
        imageUrl: "",
        createdAt: new Date().toISOString()
      }
    ];

    for (const product of mockProducts) {
      const docRef = await addDoc(productsRef, product);
      console.log(`✅ Indexed Product committed with ID: ${docRef.id}`);
    }

    // --- 2. SEED TEST ORDERS / SHIPMENTS DATA ---
    const ordersRef = collection(db, 'orders');

    const mockOrders = [
      {
        customerName: "Acme Global Logistics",
        city: "Rotterdam Port, NL",
        globalQuantity: "12,500 Metric Tons",
        status: "NEW",
        pipeline: [
          { id: 1, label: 'Documentation Approved', checked: true },
          { id: 2, label: 'Freight Loaded', checked: false },
          { id: 3, label: 'Customs Cleared', checked: false },
          { id: 4, label: 'Port Delivered', checked: false }
        ],
        createdAt: new Date().toISOString()
      },
      {
        customerName: "Zenith Trade Corp",
        city: "Port of Long Beach, USA",
        globalQuantity: "8,200 Metric Tons",
        status: "IN PROGRESS",
        pipeline: [
          { id: 1, label: 'Documentation Approved', checked: true },
          { id: 2, label: 'Freight Loaded', checked: true },
          { id: 3, label: 'Customs Cleared', checked: false },
          { id: 4, label: 'Port Delivered', checked: false }
        ],
        createdAt: new Date().toISOString()
      },
      {
        customerName: "Indo-Gulf Ventures",
        city: "Jebel Ali Port, UAE",
        globalQuantity: "22,000 Metric Tons",
        status: "HIGH PRIORITY",
        pipeline: [
          { id: 1, label: 'Documentation Approved', checked: false },
          { id: 2, label: 'Freight Loaded', checked: false },
          { id: 3, label: 'Customs Cleared', checked: false },
          { id: 4, label: 'Port Delivered', checked: false }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    for (const order of mockOrders) {
      const docRef = await addDoc(ordersRef, order);
      console.log(`✅ Logistics Manifest deployed with ID: ${docRef.id}`);
    }

    console.log("🎉 Database context successfully populated! Check your Admin Panel workspace.");
  } catch (error) {
    console.error("❌ Critical breakdown during Firebase seeding execution:", error);
  }
}