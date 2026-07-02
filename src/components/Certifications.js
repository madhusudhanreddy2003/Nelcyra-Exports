// src/components/Certifications.js
'use client';

import Image from 'next/image';
import styles from '../styles/Certifications.module.css';

export default function Certifications() {
  // Certified international regulatory compliance bodies
  const standardLogos = [
    { id: 'fssai', name: 'FSSAI Certified', img: '/logo/fssai.png' },
    { id: 'apeda', name: 'APEDA Member', img: '/logo/apeda.png' },
    { id: 'iso', name: 'ISO 22000 Certified', img: '/logo/iso.png' },
    { id: 'SBI', name: 'SBI Certified', img: '/logo/Spices_Board_of_India.png' },
    { id: 'MSME', name: 'MSME Certified', img: '/logo/MSME.png' },
    { id: 'make-in-india', name: 'Make in India Certified', img: '/logo/lion.png' },


  ];

  // Concatenating the track loop to guarantee a seamless seamless loop transition wrap
  const continuousTrackList = [...standardLogos, ...standardLogos];

  return (
    <section id="certifications" className={styles.sectionWrapper}>
      
      <div className={styles.sectionHeader}>
        <h2>Our Certifications</h2>
        <p>Nelcyra Exports conforms strictly to premium international safety, residue thresholds, and wholesale logistics standards.</p>
      </div>

      {/* Ticker Horizon Shell */}
      <div className={styles.tickerContainer}>
        <div className={styles.tickerTrack}>
          {continuousTrackList.map((logo, index) => (
            <div key={`${logo.id}-${index}`} className={styles.logoWrapper}>
              <Image
                src={logo.img}
                alt={`${logo.name} Global Clearances`}
                fill
                sizes="140px"
                className={styles.logoImg}
              />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}