// src/app/WePromise/page.js
import Image from 'next/image';
import styles from '../../styles/WePromise.module.css';

export const metadata = {
  title: 'We Promise | Premium Agriculture Standards & Commitments',
  description: 'Every single product batch is backed by our unwavering commitment to purity, safety, and operational reliability.',
};

export default function WePromisePage() {
  return (
    <main className={styles.pageWrapper}>
      
      {/* 1. Page Header Hero Section */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBg}>
          <Image 
            src="/logo/village.png" 
            alt="Nelcyra Promise & Quality Seals Background" 
            fill 
            priority
            quality={95}
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.subtitleTag}>Our Commitments</span>
          <h1 className={styles.mainTitle}>We Promise</h1>
        </div>
      </div>

      <div className={styles.container}>
        
        {/* 2. Section Block One: Sourced from "we belive in.jpeg" */}
        <div className={styles.sectionBlock}>
          <h2>We Believe In...</h2>
          <p className={styles.leadText}>"Providing our customers with the best agricultural products available."</p>
          <p className={styles.subText}>
            All our products are fully certified, grown according to international standards, 
            and processed using state-of-the-art systems to ensure full global compliance.
          </p>

          <div className={styles.threeColumnGrid}>
            <div className={styles.premiumCard}>
              <div className={styles.svgIconFrame}>
                <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="#038B45" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Always Fresh</h3>
              <p>Our well-studied methods of harvesting, post-harvest treatments, and efficient cold storage chains ensure products arrive fresh and top-tier.</p>
            </div>

            <div className={styles.premiumCard}>
              <div className={styles.svgIconFrame}>
                <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="#038B45" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3>Global Presence</h3>
              <p>Whether you need custom containers across Europe, Asia, or the Middle East, our global logistics network handles cross-border tracking seamlessly.</p>
            </div>

            <div className={styles.premiumCard}>
              <div className={styles.svgIconFrame}>
                <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="#038B45" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3>Transparency & Traceability</h3>
              <p>We maintain total transparency and absolute traceability in all processes from farm to fork—from harvest and packaging to shipping.</p>
            </div>
          </div>
        </div>

        {/* 3. Section Block Two: Sourced from "beyond comlaince.jpeg" */}
        <div className={styles.sectionBlock}>
          <h2>Beyond Compliance</h2>
          <p className={styles.subText}>Quality goes hand in hand with environmental and corporate responsibility:</p>

          <div className={styles.threeColumnGrid}>
            <div className={styles.premiumCard}>
              <div className={styles.svgIconFrame}>
                <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="#038B45" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3>Sustainability</h3>
              <p>Environmentally friendly processes, efficient waste management, and energy-conscious processing facilities.</p>
            </div>

            <div className={styles.premiumCard}>
              <div className={styles.svgIconFrame}>
                <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="#038B45" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Farmer Partnerships</h3>
              <p>Empowering local Indian agricultural communities with fair sourcing practices and strong long-term business relationships.</p>
            </div>

            <div className={styles.premiumCard}>
              <div className={styles.svgIconFrame}>
                <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="#038B45" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <h3>Customer Focus</h3>
              <p>Providing flexible, high-volume wholesale commodity packaging and specifications tailored across international boundaries.</p>
            </div>
          </div>

          {/* 4. The Core Absolute Promise Banner Row */}
          <div className={styles.promiseBanner}>
            <div >
              <img className={styles.sealImage}src="/logo/premium-quality.png" alt="★ BEST QUALITY 100 %" />
            </div>
            <div className={styles.bannerContent}>
              <h3>Our Promise</h3>
              <p>Whether it is whole raw spices or value-added agricultural products, every single delivery is backed by the exact same unwavering commitment to <span className={styles.highlightYellow}>purity</span>, <span className={styles.highlightYellow}>safety</span>, and <span className={styles.highlightYellow}>reliability</span>.</p>
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}