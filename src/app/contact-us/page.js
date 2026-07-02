// src/app/contact-us/page.js

'use client';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import styles from '../../styles/Contact.module.css';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: '', city: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateField = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Enter a valid business email address.';
    } else if (name === 'phone' && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s+/g, ''))) {
      error = 'Enter a valid phone number.';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = 
    formData.name.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.message.trim() !== '' &&
    Object.values(errors).every(err => !err);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitStatus('sending');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', city: '', email: '', phone: '', message: '' });
        setTouched({});
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    }
  };

  return (
    <main className={styles.pageWrapper}>
      
      {/* 1. Header Banner */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBg}>
          <Image 
            src="/logo/contact.jpg" 
            alt="Nelcyra International Trading Hub Header" 
            fill 
            priority 
            quality={95} 
            className={styles.heroImg} 
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.subtitleTag}>Procurement Desk</span>
          <h1 className={styles.mainTitle}>Contact Us</h1>
        </div>
      </div>

      {/* 2. Centered Content Form & Info Card Area */}
      <div className={styles.splitGridContainer}>
        
        {/* Left Form */}
        <section className={styles.formSection}>
          <span className={styles.tagline}>Corporate & Bulk Exports</span>
          <h2>Bulk Orders & Custom Partnerships</h2>
          <p className={styles.formIntro}>
            Elevate your establishment's sourcing profile. We deliver premium export-grade commodities, custom bulk packaging options, and agile cross-border logistical tracking parameters.
          </p>

          <form onSubmit={handleFormSubmit}>
            <div className={styles.formGrid}>
              <div>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Your Name *" className={`${styles.inputField} ${errors.name ? styles.fieldError : ''}`}
                />
                {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
              </div>

              <div>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Email Address *" className={`${styles.inputField} ${errors.email ? styles.fieldError : ''}`}
                />
                {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
              </div>

              <div>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Contact Number *" className={`${styles.inputField} ${errors.phone ? styles.fieldError : ''}`}
                />
                {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
              </div>

              <div>
                <input 
                  type="text" name="city" value={formData.city} onChange={handleChange} onBlur={handleBlur}
                  placeholder="City / Establishment Region *" className={`${styles.inputField} ${errors.city ? styles.fieldError : ''}`}
                />
                {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
              </div>

              <div className={styles.inputGroupFull}>
                <textarea 
                  name="message" value={formData.message} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Tell us about your volume requirements or custom packaging preferences... (Optional)" 
                  className={`${styles.textField} ${errors.message ? styles.fieldError : ''}`}
                />
                {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValid || submitStatus === 'sending'} 
              className={`${styles.submitBtn} ${isFormValid ? styles.submitActive : ''}`}
            >
              {submitStatus === 'sending' ? 'Sending...' : 'Send Enquiry →'}
            </button>

            {submitStatus === 'success' && (
              <div className={`${styles.statusNotification} ${styles.statusSuccess}`}>
                ✓ Enquiry sent successfully to sales@nelcyraexports.com
              </div>
            )}
            {submitStatus === 'error' && (
              <div className={`${styles.statusNotification} ${styles.statusError}`}>
                ✕ Transmission error. Please verify input variables or connection routes.
              </div>
            )}
          </form>
        </section>

        {/* Right Info Card */}
        <section className={styles.brandCard}>
          <div className={styles.logoFrame}>
            <Image 
              src="/logo/logo.png" 
              alt="Nelcyra Official Seal" 
              fill
              className={styles.logoImage}
            />
          </div>
          
          <div className={styles.establishmentTag}>Est. 2026 / Official Brand</div>
          <div className={styles.divider} />
          
          {/* Replace your old metaInfoList layout with this premium vector configuration */}
          <div className={styles.metaInfoList}>
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <MapPin size={18} strokeWidth={1.5} />
              </span>
              <span>Chennai, Tamil Nadu, India</span>
            </div>
            
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <Phone size={18} strokeWidth={1.5} />
              </span>
              <span>+91 9380904449</span>
            </div>
            
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <Mail size={18} strokeWidth={1.5} />
              </span>
              <span>sales@nelcyraexports.com</span>
            </div>
          </div>
        </section>

      </div>

      {/* 3. 100% Full-Width Horizontal Google Maps Footer Section */}
{/* 3. 100% Full-Width Horizontal Google Maps Footer Section */}
{/* 3. 100% Full-Width Horizontal Google Maps Footer Section */}
<div className={styles.fullWidthMapSection}>
  <div className={styles.mapOverlay}>

      <h3>We Located At</h3>

  </div>
  <iframe 
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3947.2847055964893!2d77.02845601131102!3d8.381335899955375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05af0016951e8b%3A0xfb5676f8a7b14507!2sGreen%20house!5e0!3m2!1sen!2sin!4v1719320000000!5m2!1sen!2sin"
    className={styles.mapFrame}
    allowFullScreen="" 
    loading="lazy" 
    referrerPolicy="no-referrer-when-downgrade"
    title="Nelcyra Corporate Coordinates - Green House"
  ></iframe>
</div>

    </main>
  );
}