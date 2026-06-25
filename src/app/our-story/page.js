// src/app/our-story/page.js
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Coins, Layers, Container, Wrench } from 'lucide-react'; 
import styles from '../../styles/Story.module.css'; 
import ContactCTA from "../../components/ContactCTA"; 

export const metadata = {
  title: 'Our Story | Nelcyra Exports',
  description: 'A journey across the diverse landscapes of India. Sourcing premium agricultural heritage sustainably.',
};

export default function OurStoryPage() {
  return (
    <section className={styles.storyWrapper}>
      
      {/* 1. Page Title Header Banner */}
      <div className={styles.storyHeader}>
        <div className={styles.headerBg}>
          <Image
            src="/logo/farmland.jpg" 
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

      {/* 2. Structured Layout Content Container */}
      <div className={styles.innerContainer}>
        
        {/* Split Editorial Grid */}
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

        {/* 3. Mid Grid Graphics Context Split */}
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

      </div>

      {/* 4. Fluid Vision & Mission Section */}
      <section className={styles.visionMissionSection}>
        <div className={styles.visionGridContainer}>
          
          {/* Vision Card */}
          <div className={styles.visionCard}>
            <span className={styles.leafIconHeader}>
              <Leaf size={32} />
            </span>
            <h2>Our Vision</h2>
            <p>
              To partner with farmers and customers in realising the highest possible 
              quality produce, safe produce and services to achieve sustainability in long 
              term growth.
            </p>
          </div>

          {/* Mission Card */}
          <div className={styles.missionCard}>
            <span className={styles.leafIconHeader}>
              <Leaf size={32} />
            </span>
            <h2>Our Mission</h2>
            <p>
              Our mission at Nelcyra Exports is to deliver premium-quality produce 
              through sustainable practices, advanced technologies, and an unwavering 
              commitment to food safety. By empowering farmers, fostering innovation, 
              and safeguarding the environment, we aspire to create a healthier, 
              greener future for all.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Core Values 4-Column Balanced Grid */}
      <section className={styles.valuesSection}>
        <h2>Our Core Values</h2>
        <div className={styles.decoratorRow}>
          <div className={styles.lineDeco} />
          <Leaf size={16} fill="#5ed640" color="#5ed640" />
          <div className={styles.lineDeco} />
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.iconSquare}>
              <Coins size={44} strokeWidth={1.5} />
            </div>
            <h4>Competitive Pricing</h4>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.iconSquare}>
              <Layers size={44} strokeWidth={1.5} />
            </div>
            <h4>Customized Private Labelling Solutions</h4>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.iconSquare}>
              <Container size={44} strokeWidth={1.5} />
            </div>
            <h4>Qualitative Cargo Assurance</h4>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.iconSquare}>
              <Wrench size={44} strokeWidth={1.5} />
            </div>
            <h4>Seamless Logistic Support</h4>
          </div>
        </div>
      </section>

      {/* 6. Elite Highlighted Mission Statement Callout Box
      <div className={styles.innerContainer} style={{ paddingTop: 0 }}>
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
      </div>  */}

      {/* 7. Global Call-To-Action Banner Section */}
      <ContactCTA />

    </section>
  );
}