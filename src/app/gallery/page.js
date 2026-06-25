// src/app/gallery/page.js
'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../../styles/Gallery.module.css';

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxData, setLightboxData] = useState(null);

  // Elite, highly immersive content collection catalog
  const galleryItems = [
    { id: 1, title: "Cardamom Plantations", category: "Farms", img: "/logo/plantation.jpg", size: styles.itemTall, desc: "Direct farm-level tracking across pristine hill clusters in Kerala." },
    { id: 2, title: "Sun-Dried Whole Pepper", category: "Processing", img: "/logo/hero.png", size: styles.itemWide, desc: "Traditional slow curing locks in essential high-piperine compounds." },
    { id: 3, title: "Empowering Rural Farmers", category: "People", img: "/logo/farmer.jpg", size: styles.itemLarge, desc: "Nurturing deep generational partnerships and transparent trade networks." },
    { id: 4, title: "Sustainable Spices Harvest", category: "Farms", img: "/logo/plantation.png", size: styles.itemNormal, desc: "Ethically harvested premium spice yields packed on site." },
    { id: 5, title: "Rich Farmland Agriculture", category: "Farms", img: "/logo/farmland.jpg", size: styles.itemWide, desc: "Expansive fertile landscapes cultivation backing export supply chains." },
    { id: 6, title: "Traditional Spice Sorting", category: "Processing", img: "/logo/village.png", size: styles.itemTall, desc: "Meticulous quality inspection routines verifying pure density metrics." }
  ];

  const categories = ['All', 'Farms', 'Processing', 'People'];

  const filteredItems = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <main className={styles.pageWrapper}>
      
      {/* 1. Immersive Banner Background */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBg}>
          <Image 
            src="/logo/farmland.jpg" 
            alt="Nelcyra Agricultural Gallery Banner" 
            fill 
            priority
            quality={95}
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.subtitleTag}>Visual Chronicles</span>
          <h1 className={styles.mainTitle}>Gallery</h1>
        </div>
      </div>

      <div className={styles.container}>
        
        {/* 2. Sleek Filter Chips Section */}
        <div className={styles.filterRow}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Asymmetric Masonry Workspace Layout Grid */}
        <div className={styles.masonryGrid}>
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`${styles.galleryItem} ${item.size}`}
              onClick={() => setLightboxData(item)}
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                sizes="(max-width: 650px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={styles.itemImage}
              />
              <div className={styles.cardOverlay}>
                <span className={styles.itemCategory}>{item.category}</span>
                <h3 className={styles.itemTitle}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Elegant Blur Lightbox Preview Engine Overlay */}
      {lightboxData && (
        <div className={styles.lightboxModal} onClick={() => setLightboxData(null)}>
          <button className={styles.closeLightbox} onClick={() => setLightboxData(null)}>✕</button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxData.img} 
              alt={lightboxData.title}
              className={styles.lightboxImg}
            />
            <div className={styles.lightboxCaption}>
              <h3>{lightboxData.title}</h3>
              <p>{lightboxData.desc}</p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}