// src/app/shipping-details/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, runTransaction } from 'firebase/firestore';
import { User, Mail, Phone, MapPin, Building, Hash, ShoppingBag, Scale } from 'lucide-react';
import styles from '../../styles/Shipping.module.css';

export default function ShippingDetailsPage() {
  const { cartItems, clearCart } = useCart();
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    quantity: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = 
    shippingInfo.name.trim() !== '' &&
    shippingInfo.email.trim().includes('@') &&
    shippingInfo.phone.trim().length >= 10 &&
    shippingInfo.address.trim() !== '' &&
    shippingInfo.city.trim() !== '' &&
    shippingInfo.pincode.trim().length >= 6 &&
    shippingInfo.quantity.trim() !== '';

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Generate unique Tracking ID with NEL- prefix
    const orderId = `NEL-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderTimestamp = new Date().toISOString();
    const formattedPhone = shippingInfo.phone.trim();

    let itemManifest = '';
    cartItems.forEach(item => {
      const targetQty = item.quantity || shippingInfo.quantity || 'Standard Specs';
      itemManifest += `*• ${item.name.trim()}* - (${targetQty.trim()})\n`;
    });

    const orderPayload = {
      id: orderId,
      orderId,
      customerName: shippingInfo.name.trim(),
      name: shippingInfo.name.trim(),
      customerEmail: shippingInfo.email.trim(),
      customerPhone: formattedPhone,
      address: shippingInfo.address.trim(),
      city: `${shippingInfo.city.trim()}, ${shippingInfo.pincode.trim()}`,
      globalQuantity: shippingInfo.quantity.trim(),
      status: 'NEW',
      createdAt: orderTimestamp,
      timestamp: orderTimestamp,
      items: cartItems.map(item => ({
        name: item.name,
        qty: item.quantity || shippingInfo.quantity || 'Standard Specs'
      })),
      pipeline: [
        { id: 1, label: 'Documentation Approved', checked: true },
        { id: 2, label: 'Freight Loaded', checked: false },
        { id: 3, label: 'Customs Cleared', checked: false },
        { id: 4, label: 'Port Delivered', checked: false }
      ]
    };

    try {
      const customerDocRef = doc(db, 'customers', formattedPhone);
      const orderDocRef = doc(db, 'orders', orderId);

      await runTransaction(db, async (transaction) => {
        const customerDoc = await transaction.get(customerDocRef);
        let orderCount = 1;

        if (customerDoc.exists()) {
          const currentCount = customerDoc.data().ordersPlaced || 0;
          orderCount = currentCount + 1;
        }

        transaction.set(orderDocRef, orderPayload);

        transaction.set(customerDocRef, {
          customerName: shippingInfo.name.trim(),
          customerPhone: formattedPhone,
          customerEmail: shippingInfo.email.trim(),
          ordersPlaced: orderCount,
          lastOrderDate: orderTimestamp
        }, { merge: true });
      });

      try {
        await addDoc(collection(db, 'activity_logs'), {
          action: 'PUBLIC_ORDER_SUBMITTED',
          details: `New enquiry ${orderId} received from ${shippingInfo.name.trim()} (${shippingInfo.city.trim()})`,
          user: 'Public Site Visitor',
          timestamp: orderTimestamp
        });
      } catch (logErr) {
        console.error("Activity logging skipped:", logErr);
      }

      await addDoc(collection(db, 'mail'), {
        to: shippingInfo.email.trim(),
        message: {
          subject: `Order Confirmation - ${orderId} | Nelcyra Exports`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; color: #12331F; line-height: 1.6;">
              <h2 style="border-bottom: 2px solid #038B45; padding-bottom: 10px;">Order Received!</h2>
              <p>Dear <strong>${shippingInfo.name.trim()}</strong>,</p>
              <p>We are pleased to inform you that your procurement request has been logged successfully under Reference ID: <strong>${orderId}</strong>.</p>
              <h3>Consignment Specifications:</h3>
              <p><strong>Required Volume/Qty:</strong> ${shippingInfo.quantity.trim()}</p>
              <p><strong>Port of Destination:</strong> ${shippingInfo.address.trim()}, ${shippingInfo.city.trim()}</p>
              <hr style="border: 0; border-top: 1px solid #E2E8E4; margin: 20px 0;">
              <p style="font-size: 11px; color: #728178;">This is an automated notification from Nelcyra Exports Global Logistics Network.</p>
            </div>
          `
        }
      });

      const rawMessage = 
        `■ *NEW LOGISTICS ARRANGEMENT REQUEST - NELCYRA EXPORTS*\n\n` +
        `*Order Reference:* ${orderId}\n` +
        `*Consignee Dispatch Details:*\n` +
        `*• Name:* ${shippingInfo.name.trim()}\n` +
        `*• Email:* ${shippingInfo.email.trim()}\n` +
        `*• Phone:* ${formattedPhone}\n` +
        `*• Destination:* ${shippingInfo.address.trim()}\n` +
        `*• Location Hub:* ${shippingInfo.city.trim()}\n` +
        `*• Postal Code:* ${shippingInfo.pincode.trim()}\n` +
        `*• Global Volume/Qty:* ${shippingInfo.quantity.trim()}\n\n` +
        `*Procured Manifest Allocation:*\n${itemManifest || '*• Single Item Checkout Request*\n'}\n` +
        `---\n_Sent via Nelcyra Global Checkout System_`;

      const encodedMessage = encodeURIComponent(rawMessage);
      const commercialLine = "916305313849"; 
      window.open(`https://wa.me/${commercialLine}?text=${encodedMessage}`, '_blank');

      clearCart();
      setShippingInfo({ name: '', email: '', phone: '', address: '', city: '', pincode: '', quantity: '' });

    } catch (error) {
      console.error("Database storage execution failed:", error);
      alert("Failed to process transaction. Please check your connection and try again.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        <div className={styles.headerBlock}>
          <h1>Shipping Details</h1>
          <p>Please enter your destination coordinates to finalize your procurement manifest.</p>
        </div>

        <form onSubmit={handlePlaceOrder} className={styles.formStructure}>
          
          <div className={styles.inputGroup}>
            <label>Full Name / Company Name</label>
            <div className={styles.inputFieldWrapper}>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your full name or company name" 
                value={shippingInfo.name}
                onChange={handleInputChange}
                className={styles.inputStructure}
                required
              />
              <User className={styles.inputIcon} size={18} strokeWidth={2} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Corporate Email Address</label>
            <div className={styles.inputFieldWrapper}>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email address" 
                value={shippingInfo.email}
                onChange={handleInputChange}
                className={styles.inputStructure}
                required
              />
              <Mail className={styles.inputIcon} size={18} strokeWidth={2} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Contact Number (WhatsApp Enabled)</label>
            <div className={styles.inputFieldWrapper}>
              <input 
                type="tel" 
                name="phone" 
                placeholder="Enter your contact number" 
                value={shippingInfo.phone}
                onChange={handleInputChange}
                className={styles.inputStructure}
                required
              />
              <Phone className={styles.inputIcon} size={18} strokeWidth={2} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Required Quantity / Target Volume</label>
            <div className={styles.inputFieldWrapper}>
              <input 
                type="text" 
                name="quantity" 
                placeholder="Ex: 500 grams, 5 Kgs, 2 Metric Tons, Sample Request" 
                value={shippingInfo.quantity}
                onChange={handleInputChange}
                className={styles.inputStructure}
                required
              />
              <Scale className={styles.inputIcon} size={18} strokeWidth={2} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Detailed Delivery / Port Address</label>
            <div className={styles.inputFieldWrapper}>
              <input 
                type="text" 
                name="address" 
                placeholder="Building Name / Industrial Area, street details" 
                value={shippingInfo.address}
                onChange={handleInputChange}
                className={styles.inputStructure}
                required
              />
              <MapPin className={styles.inputIcon} size={18} strokeWidth={2} />
            </div>
          </div>

          <div className={styles.splitRow}>
            
            <div className={styles.inputGroup}>
              <label>City / State</label>
              <div className={styles.inputFieldWrapper}>
                <input 
                  type="text" 
                  name="city" 
                  placeholder="Ex: Kochi, Kerala" 
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className={styles.inputStructure}
                  required
                />
                <Building className={styles.inputIcon} size={18} strokeWidth={2} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Postal Code / Pincode</label>
              <div className={styles.inputFieldWrapper}>
                <input 
                  type="text" 
                  name="pincode" 
                  placeholder="Enter your PIN code" 
                  value={shippingInfo.pincode}
                  onChange={handleInputChange}
                  className={styles.inputStructure}
                  maxLength={6}
                  required
                />
                <Hash className={styles.inputIcon} size={18} strokeWidth={2} />
              </div>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={!isFormValid}
            className={styles.placeOrderBtn}
          >
            <ShoppingBag size={18} strokeWidth={2} />
            Place Order via WhatsApp
          </button>

          <p className={styles.policyDisclaimer}>
            By proceeding, you agree to our logistics transit terms outlined in our<br />{' '}
            <Link href="/shipping-return-policy" target="_blank">
              Shipping, Return & Refund Policy
            </Link>.
          </p>

        </form>
      </div>
    </div>
  );
}