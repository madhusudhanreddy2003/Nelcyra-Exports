// src/app/why-nelcyra/page.js
import Image from 'next/image';
import styles from '../../styles/why-nelcyra.module.css';

export const metadata = {
  title: 'Why Nelcyra | Agricultural Exports from India',
  description: 'Leveraging India\'s robust export ecosystem, compliance frameworks, and traceable processing lifecycle pipelines.',
};

export default function WhyNelcyraPage() {
  // Pure text dataset mapped directly to your exact pipeline flow
  const globalSteps = [
    { step: "01", title: "Direct Sourcing from Farmers", desc: "Procuring directly at the farm-gate from trusted regional clusters to ensure maximum freshness and fair-trade practices." },
    { step: "02", title: "Quality Inspection & Grading", desc: "Sorting commodities systematically by density, size, and color benchmarks to eliminate sub-standard batches." },
    { step: "03", title: "Hygienic Warehouse Storage", desc: "Storing products under strict moisture-controlled and pest-free conditions to protect agricultural integrity." },
    { step: "04", title: "Export-Standard Packing", desc: "Utilizing premium food-grade multi-layer paper sacks, PP bags, or custom private labeling built for rough sea transit." },
    { step: "05", title: "Documentation & Customs Clearance", desc: "Handling all phytosanitary certificates, APEDA compliance, FSSAI clearances, and international customs paperwork smoothly." },
    { step: "06", title: "Dispatch & Logistics Management", desc: "Managing efficient multi-modal transit networks directly connecting domestic processing units to major sea and air hubs." },
    { step: "07", title: "Final Delivery to Global Customers", desc: "Final cargo offloading and seamless delivery directly to our international wholesale and manufacturing partners worldwide." }
  ];

  return (
    <main className={styles.pageWrapper}>
      
      {/* Banner Header Block */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBg}>
          <Image 
            src="/logo/why-us.jpg" 
            alt="Nelcyra Value Chain Ecosystem Background" 
            fill 
            priority
            quality={95}
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.subtitleTag}>Global Procurement Standards</span>
          <h1 className={styles.mainTitle}>Why Nelcyra</h1>
        </div>
      </div>

      <div className={styles.container}>
        
        {/* Value Proposition Grid Block */}
        <div className={styles.valueGrid}>
          <div className={styles.editorialText}>
            <h2>Why Agricultural Exports from India?</h2>
            <p>
              India stands as one of the largest agricultural exporters in the world, 
              offering unmatched diversity, volume, and quality in agricultural export products. 
              The country's vast agro-climatic zones enable the year-round cultivation of spices, 
              pulses, grains, herbs, and fresh produce.
            </p>
            <p>
              Our robust export ecosystem, supported by regulatory bodies like APEDA and FSSAI, 
              ensures that structural outputs cleanly map to international food safety rulesets, 
              guaranteeing importers reliable sea/air logistics connectivity and full trace capability.
            </p>
          </div>

          <div className={styles.cardsColumn}>
            <div className={styles.valueCard}>
              <span className={styles.cardIcon}>🍃</span>
              <h3>Heritage & Sustainability</h3>
              <p>Fusing ancestral cultivation methods with state-of-the-art global cleanliness controls.</p>
            </div>
            <div className={styles.valueCard}>
              <span className={styles.cardIcon}>🛡️</span>
              <h3>Regulatory Compliance</h3>
              <p>Fully conforming to strict APEDA, FSSAI, and importing customs parameters with certified cargo clearance documentation.</p>
            </div>
          </div>
        </div>

        {/* Steps We Follow Component Layer */}
        <div className={styles.processSection}>
          <div className={styles.processHeader}>
            <h2>Steps We Follow</h2>
            <p>At Nelcyra Exports, we partner with trusted farmers in India to create a top-notch quality environment built entirely on end-to-end traceability.</p>
          </div>

          <div className={styles.stepsGrid}>
            {globalSteps.map((node) => (
              <div key={node.step} className={styles.stepCard}>
                <span className={styles.stepBadge}>Step {node.step}</span>
                <h3>{node.title}</h3>
                <p>{node.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </main>
  );
}