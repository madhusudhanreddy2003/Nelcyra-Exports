// src/components/Hero.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const bgImages = [
    '/logo/hero.png',
    '/logo/farmer.jpg',
    '/logo/farmland.jpg',
    '/logo/village.png',
    '/logo/plantation.jpg',
    '/logo/plantation.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bgImages.length);
    }, 6000); // Transitions background frames cleanly every 6 seconds
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <section className={styles.heroWrapper}>
      
      <div className={styles.bgImageWrapper}>
        {bgImages.map((imagePath, index) => (
          <div 
            key={index} 
            className={`${styles.slide} ${index === currentSlide ? styles.slideActive : ''}`}
          >
            <Image
              src={imagePath}
              alt={`Nelcyra Background Frame ${index + 1}`}
              fill
              priority={index === 0}
              quality={100}
              className={styles.heroBgImage}
            />
          </div>
        ))}
      </div>

      <div className={styles.heroOverlay} />

      <div className={styles.contentBox}>
        <h1 className={styles.mainHeading}>
          Sourcing India’s Finest Spices & Agricultural Produce
        </h1>
        <Link href="#products" className={styles.ctaButton}>
          Learn More
        </Link>
      </div>

      <div className={styles.sliderIndicators}>
        {bgImages.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to frame ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}