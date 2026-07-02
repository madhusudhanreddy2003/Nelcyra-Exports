// src/components/Navbar.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import styles from '../styles/Navbar.module.css';

// --- Premium Custom Dropdown Component ---
function PremiumSelect({ value, onChange, placeholder, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={styles.customSelectContainer} ref={dropdownRef}>
      <div 
        className={`${styles.customSelectTrigger} ${isOpen ? styles.selectTriggerActive : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={styles.customSelectChevron}>▼</span>
      </div>
      
      {isOpen && (
        <div className={styles.customSelectOptionsList}>
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`${styles.customSelectOption} ${value === opt.value ? styles.customSelectOptionActive : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Navbar ---
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems, updateCartItemMeta, removeFromCart, clearCart, isCartOpen, setCartOpen } = useCart();

  const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '', city: '' });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = 
    clientDetails.name.trim() !== '' &&
    clientDetails.email.trim() !== '' &&
    clientDetails.phone.trim() !== '' &&
    clientDetails.city.trim() !== '' &&
    cartItems.length > 0 &&
    cartItems.every(item => (item.quantity || '').trim() !== '' && (item.packaging || '').trim() !== '');

  const handleSendEnquiry = () => {
    if (!isFormValid) return;

    let productManifestString = '';
    cartItems.forEach((item) => {
      productManifestString += `*${item.name}* (${item.category})%0A` +
                               `• Quantity: ${item.quantity}%0A` +
                               `• Packaging: ${item.packaging}%0A%0A`;
    });

    const baseMessage = `📦 *NEW B2B TRADE ENQUIRY - NELCYRA EXPORTS*%0A%0A` +
                        `*Client Details:*%0A` +
                        `• Name: ${clientDetails.name}%0A` +
                        `• Email: ${clientDetails.email}%0A` +
                        `• Phone: ${clientDetails.phone}%0A` +
                        `• City: ${clientDetails.city}%0A%0A` +
                        `*Requested Manifest:*%0A${productManifestString}` +
                        `---%0A_Sent via Nelcyra Global Procurement Terminal_`;

    const ownerPhoneNumber = "919380904449";
    window.open(`https://wa.me/${ownerPhoneNumber}?text=${baseMessage}`, '_blank');

    clearCart();
    setClientDetails({ name: '', email: '', phone: '', city: '' });
    setCartOpen(false);
  };

  // Predefined B2B Dropdown Configurations
  const qtyOptions = [
    { value: "50  grams", label: "50  grams" },
    { value: "100 grams", label: "100 grams" },
    { value: "250 grams", label: "250 grams" },
    { value: "500 grams", label: "500 grams" },
    { value: "1 Kilo-gram", label: "1 Kilo-gram" },
    { value: "Sample Request Only", label: "Sample Order" }
  ];

  const pkgOptions = [
    { value: "Bulk Jute Bags", label: "Bulk Jute Bags" },
    { value: "50kg High-Density PP Bags", label: "50kg PP Bags" },
    { value: "25kg Multi-Layer Paper Sacks", label: "25kg Paper Sacks" },
    { value: "Custom Private Labeling Packing", label: "Private Labeling" },
    { value: "Standard Wholesale Box Cartons", label: "Cardboard Cartons" }
  ];

  return (
    <>
      <div className={styles.announcementBar}>
        🌱 Sourced with Care - Delivered with Purpose.
      </div>

      <header className={`${styles.header} ${isScrolled ? styles.scrolledHeader : ''}`}>
        <div className={styles.container}>
          
          <div className={styles.logoGroup} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Image src="/logo/logo-2.png" alt="Nelcyra Logo" width={100} height={100} style={{ objectFit: 'contain' }} priority />
            <span className={styles.logoText}>
              <span className={styles.greenText}>NELCYRA</span>
              <span className={styles.whiteText}>EXPORTS</span>
            </span>
          </div>

          <div className={styles.menuWrapper}>
            <nav className={`${styles.nav} ${isMenuOpen ? styles.navActive : ''}`}>
              <ul className={styles.navList}>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/">Home</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/#products">Products</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/our-story">Our Story</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/why-nelcyra">Why Nelcyra</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/we-promise">We Promise</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/gallery">Gallery</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/faqs">FAQ's</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/#certifications">Certifications</Link></li>
                <li className={styles.navItem} onClick={() => setIsMenuOpen(false)}><Link href="/contact-us">Contact Us</Link></li>
              </ul>
            </nav>

            <div className={styles.actionIcons}>
              <button className={styles.iconBtn} onClick={() => setCartOpen(true)} aria-label="Open Cart">
                <svg className={styles.iconSvg} viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                {cartItems.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
              </button>

              <button className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Cart Drawer Modal */}
      <div className={`${styles.cartDrawerOverlay} ${isCartOpen ? styles.drawerOpen : ''}`} onClick={() => setCartOpen(false)}>
        <div className={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <div>
              <h2 className={styles.drawerTitle}>CART</h2>
              <span className={styles.drawerSubtitle}>{cartItems.length} Items</span>
            </div>
            <button className={styles.closeDrawerBtn} onClick={() => setCartOpen(false)}>✕</button>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCartBox}>
              <p>Your procurement list is empty.</p>
            </div>
          ) : (
            <div className={styles.drawerBodyContainer}>
              <div className={styles.drawerItemsScrollList}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.b2bCartCard}>
                    <div className={styles.b2bCardTop}>
                      <div className={styles.b2bMeta}>
                        <h4>{item.name}</h4>
                        <span>{item.category}</span>
                      </div>
                      <button className={styles.itemRemoveBtn} onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>

                    <div className={styles.b2bInputsRow}>
                      {/* Premium Custom Component Render Engines */}
                      <PremiumSelect 
                        value={item.quantity} 
                        onChange={(val) => updateCartItemMeta(item.id, 'quantity', val)}
                        placeholder="Select Quantity"
                        options={qtyOptions}
                      />
                      <PremiumSelect 
                        value={item.packaging} 
                        onChange={(val) => updateCartItemMeta(item.id, 'packaging', val)}
                        placeholder="Select Packaging"
                        options={pkgOptions}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form Context Fields */}
              <div className={styles.validationForm}>
                <input type="text" name="name" placeholder="Your Name" value={clientDetails.name} onChange={handleClientChange} />
                <input type="text" name="email" placeholder="Email Address" value={clientDetails.email} onChange={handleClientChange} />
                <input type="text" name="phone" placeholder="Phone Number" value={clientDetails.phone} onChange={handleClientChange} />
                <input type="text" name="city" placeholder="City" value={clientDetails.city} onChange={handleClientChange} />
                
                <button 
                  onClick={handleSendEnquiry} 
                  disabled={!isFormValid} 
                  className={`${styles.submitEnquiryBtn} ${isFormValid ? styles.submitActive : ''}`}
                >
                  Send RFQ via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}