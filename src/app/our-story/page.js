// src/app/our-story/page.js
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Story.module.css'; // Stepping up two levels to resolve styles cleanly

export const metadata = {
  title: 'Our Story | Nelcyra Exports',
  description: 'A journey across the diverse landscapes of India. Sourcing premium agricultural heritage sustainably.',
};

export default function OurStoryPage() {
  return (
    <section className={styles.storyWrapper}>
      
      {/* 1. Page Section Immersive Title Header */}
      <div className={styles.storyHeader}>
        <div className={styles.headerBg}>
          <Image
            src="/logo/farmland.jpg" // Sourced cleanly from your verified public assets folder paths
            alt="Nelcyra Exports Organic Farming Origin Heritage"
            fill
            priority
            quality={95}
            className={styles.headerImg}
          />
        </div>
        <div className={styles.headerOverlay} />
        <div className={styles.headerContent}>
          <span className={styles.subtitleTag}>Nelcyra Exports</span>
          <h1 className={styles.mainTitle}>Our Story</h1>
        </div>
      </div>

      {/* 2. Structured Layout Container Grid */}
      <div className={styles.innerContainer}>
        
        {/* Genesis Symmetric Content Split Block Row */}
        <div className={styles.splitGrid}>
          <div className={styles.leftColumn}>
            <h2>A Journey across the diverse landscapes of India.</h2>
          </div>
          
          <div className={styles.rightColumn}>
            <p className={styles.storyParagraph}>
              Nelcyra Exports was not simply founded—it was built with a purpose. 
              Our journey across the diverse landscapes of India, exploring farming 
              communities and their time-honored organic and natural cultivation practices, 
              inspired a vision: to bridge the gap between local farmers and global markets.
            </p>
            <p className={styles.storyParagraph}>
              By sourcing directly from the origin, we bring the richness, authenticity, 
              and purity of India's agricultural heritage to the world, while creating fair 
              opportunities and sustainable value for the communities behind every harvest.
            </p>
          </div>
        </div>

        {/* 3. Mid Grid Contextual Section Graphics Grid */}
        <div className={styles.midSectionGrid}>
          <div className={styles.storyImageFrame}>
            <Image
              src="/logo/farmer.jpg"
              alt="Handpicked Sustainable Indian Spices Processing"
              fill
              quality={90}
              className={styles.storyImg}
            />
          </div>

          <div className={styles.metaDetailBox}>
            <div className={styles.metaBlock}>
              <h3>100% Organic Traceability</h3>
              <p>Every single batch of cardamom, clove, or agriculture produce we containerize is traceable back to the precise regional collective farm path it originated from.</p>
            </div>
            <div className={styles.metaBlock}>
              <h3>Global Partnerships</h3>
              <p>Connecting supply chains globally, we manage cross-border wholesale logistics infrastructure with zero quality drop or transit delays.</p>
            </div>
          </div>
        </div>

        {/* 4. Elite Highlighted Mission Statement Callout Block Box */}
        <div className={styles.missionStatementBlock}>
          <div className={styles.statementText}>
            <h4>The Mission</h4>
            <p>"From Indian Farms to Global Markets — Naturally, Ethically, and Sustainably."</p>
          </div>

          <div className={styles.actionButtonRow}>
            <Link href="/why-nelcyra" className={styles.outlineBtn}>
              Our Standards
            </Link>
            <Link href="/contact-us" className={styles.solidBtn}>
              Work With Us
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
}