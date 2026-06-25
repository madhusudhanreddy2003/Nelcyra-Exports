// src/components/HomeContact.js
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/ContactCTA.module.css';

export default function HomeContact() {
  return (
    <section className={styles.sectionWrapper}>
      
      {/* Immersive Background Assets Frame */}
      <div className={styles.bgWrapper}>
        <Image 
          src="/logo/plantation.png" 
          alt="Nelcyra International Cultivation Map Banner"
          fill
          priority
          className={styles.bgImg}
        />
      </div>

      {/* Vignette Filter Layer */}
      <div className={styles.overlay} />

      {/* Typography and Actions Matrix */}
      <div className={styles.contentContainer}>
        <h2 className={styles.mainTitle}>For Healthy Living & Sustainable Growth</h2>
        <p className={styles.subTitle}>We are always Ready to Serve You.</p>
        
        <div className={styles.buttonGroup}>
          <Link href="/contact-us" className={styles.solidBtn}>
            Connect With Us
          </Link>
          <Link href="/why-nelcyra" className={styles.ghostBtn}>
            Why Nelcyra
          </Link>
        </div>
      </div>

    </section>
  );
}