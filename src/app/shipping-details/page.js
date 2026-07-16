// src/app/shipping-details/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
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
    quantity: '' // Added quantity variable to state allocation
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Structural strict validation strategy
  const isFormValid = 
    shippingInfo.name.trim() !== '' &&
    shippingInfo.email.trim().includes('@') &&
    shippingInfo.phone.trim().length >= 10 &&
    shippingInfo.address.trim() !== '' &&
    shippingInfo.city.trim() !== '' &&
    shippingInfo.pincode.trim().length >= 6 &&
    shippingInfo.quantity.trim() !== ''; // Verifies quantity metric is selected/written

const handlePlaceOrder = (e) => {
  e.preventDefault();
  if (!isFormValid) return;

  // 1. Build the manifest list with no spaces leading into the asterisks
  let itemManifest = '';
  cartItems.forEach(item => {
    const targetQty = item.quantity || shippingInfo.quantity || 'Standard Specs';
    itemManifest += `*• ${item.name.trim()}* - (${targetQty.trim()})\n`;
  });

  // 2. Swapped raw emoji header for a clean, bulletproof enterprise bracket tag
  const rawMessage = 
    `[📦] *NEW LOGISTICS ARRANGEMENT REQUEST - NELCYRA EXPORTS*\n\n` +
    `*Consignee Dispatch Details:*\n` +
    `*• Name:* ${shippingInfo.name.trim()}\n` +
    `*• Email:* ${shippingInfo.email.trim()}\n` +
    `*• Phone:* ${shippingInfo.phone.trim()}\n` +
    `*• Destination:* ${shippingInfo.address.trim()}\n` +
    `*• Location Hub:* ${shippingInfo.city.trim()}\n` +
    `*• Postal Code:* ${shippingInfo.pincode.trim()}\n` +
    `*• Global Volume/Qty:* ${shippingInfo.quantity.trim()}\n\n` +
    `*Procured Manifest Allocation:*\n${itemManifest || '*• Single Item Checkout Request*\n'}\n` +
    `---\n_Sent via Nelcyra Global Checkout System_`;

  // 3. Complete structural URI encoding pass
  const encodedMessage = encodeURIComponent(rawMessage);

  const commercialLine = "919380904449"; // Official Nelcyra Export WhatsApp contact
  window.open(`https://wa.me/${commercialLine}?text=${encodedMessage}`, '_blank');

  // Clear application container states
  clearCart();
  setShippingInfo({ name: '', email: '', phone: '', address: '', city: '', pincode: '', quantity: '' });
};

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        <div className={styles.headerBlock}>
          <h1>Shipping Details</h1>
          <p>Please enter your destination coordinates to finalize your procurement manifest.</p>
        </div>

        <form onSubmit={handlePlaceOrder} className={styles.formStructure}>
          
          {/* Name Field Input Group */}
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

          {/* Email Address Field Input Group */}
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

          {/* Phone Number Field Input Group */}
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

          {/* Quantity Field Input Group */}
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

          {/* Address Field Input Group */}
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

          {/* Balanced Split Grid Layout Box for City and Pincode */}
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

          {/* Action Execution Button Element */}
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={styles.placeOrderBtn}
          >
            <ShoppingBag size={18} strokeWidth={2} />
            Place Order via WhatsApp
          </button>

          <p className={styles.policyDisclaimer}>
            By proceeding, you agree to our logistics transit terms outlined in our<br></br>{' '}
            <Link href="/shipping-return-policy" target="_blank">
              Shipping, Return & Refund Policy
            </Link>.
          </p>

        </form>
      </div>
    </div>
  );
}