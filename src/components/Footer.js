// src/components/Footer.js
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react'; // Kept utility icons only
import styles from '../styles/Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.mainContainer}>
        
        {/* Column 1: Brand Manifesto and Logo */}
        <div className={styles.brandColumn}>
          <div className={styles.logoFrame}>
            <Image 
              src="/logo/logo.png" 
              alt="Nelcyra Exports Global Corporate Trading Hub" 
              fill
              className={styles.logoImg}
            />
          </div>
          <p className={styles.brandManifesto}>
            Bridging the gap between pure regional Indian farm collectives and international commodity procurement markets with complete, ethical traceability.
          </p>
          <div className={styles.socialLinks}>
            {/* LinkedIn Custom SVG */}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            
            {/* Instagram Custom SVG */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            
            {/* Facebook Custom SVG */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            
            {/* Twitter/X Custom SVG */}
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Twitter">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Corporate Exploration Links */}
        <div>
          <h4 className={styles.columnTitle}>Company</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}><Link href="/">Home</Link></li>
            <li className={styles.linkItem}><Link href="/our-story">Our Story</Link></li>
            <li className={styles.linkItem}><Link href="/why-nelcyra">Why Nelcyra</Link></li>
            <li className={styles.linkItem}><Link href="/products">Our Products</Link></li>
          </ul>
        </div>

        {/* Column 3: Trading Desk Support Links */}
        <div>
          <h4 className={styles.columnTitle}>Resources</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}><Link href="/certifications">Certifications</Link></li>
            <li className={styles.linkItem}><Link href="/faq">FAQ's</Link></li>
            <li className={styles.linkItem}><Link href="/gallery">Gallery</Link></li>
            <li className={styles.linkItem}><Link href="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        {/* Column 4: Corporate HQ Hub Contact Details */}
        <div>
          <h4 className={styles.columnTitle}>Corporate HQ</h4>
          <div className={styles.addressList}>
            <div className={styles.addressItem}>
              <MapPin size={18} strokeWidth={1.5} className={styles.iconWrapper} />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
            <div className={styles.addressItem}>
              <Phone size={18} strokeWidth={1.5} className={styles.iconWrapper} />
              <a href="tel:+919380904449">+91 9380904449</a>
            </div>
            <div className={styles.addressItem}>
              <Mail size={18} strokeWidth={1.5} className={styles.iconWrapper} />
              <a href="mailto:sales@nelcyraexports.com">sales@nelcyraexports.com</a>
            </div>
          </div>
        </div>

      </div>

      {/* Base Legal Row Line */}
      <div className={styles.bottomLegalBar}>
        <div className={styles.legalContainer}>
          <span>© {currentYear} Nelcyra Exports. All Rights Reserved.</span>
          <span>Sourced with Care — Delivered with Purpose.</span>
        </div>
      </div>
    </footer>
  );
}