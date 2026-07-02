// src/app/shipping-return-policy/page.js
import { Truck, RotateCcw, ShieldCheck, AlertCircle, Mail, Phone } from 'lucide-react';
import styles from '../../styles/Policy.module.css';

export const metadata = {
  title: 'Shipping & Returns Policy | Nelcyra Exports',
  description: 'Review our delivery timelines, bulk B2B shipping terms, return thresholds, and refund protocols.',
};

export default function ShippingReturnPolicyPage() {
  return (
    <section className={styles.policyWrapper}>
      
      {/* Immersive Header Block */}
      <div className={styles.policyHeader}>
        <h1>Shipping, Return & Refund Policy</h1>
        <p>Transparent protocols ensuring authenticity, care, and reliability across every cargo shipment.</p>
      </div>

      <div className={styles.container}>
        
        {/* Intro Section */}
        <div className={styles.sectionBlock + ' ' + styles.introSection}>
          <p className={styles.introText}>
            At Nelcyra Exports, we take pride in delivering premium-quality spices, organic products, 
            and agro commodities with authenticity, care, and reliability. If you are not completely 
            satisfied with your purchase, our quality operations desk is here to assist you promptly.
          </p>
        </div>

        {/* 1. Delivery Manifest */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <Truck className={styles.iconColor} size={28} strokeWidth={1.5} />
            <h2>Delivery Timelines & Logistics</h2>
          </div>
          <p className={styles.policyParagraph}>
            We usually dispatch all orders within 3–4 working days after transaction confirmation. 
            Delivery variables scale depending cleanly upon location matrix routing and chosen methods:
          </p>
          
          <div className={styles.innerGrid}>
            <div className={styles.dataCard}>
              <h4>Within Kerala</h4>
              <p>2–4 Working Days</p>
            </div>
            <div className={styles.dataCard}>
              <h4>Rest of India</h4>
              <p>3–7 Working Days</p>
            </div>
            <div className={styles.dataCard}>
              <h4>International Freight</h4>
              <p>Scales based on destination metrics and freight selections (Air / Sea Cargo structures).</p>
            </div>
          </div>

          <div className={styles.calloutBox}>
            <h4>High-Demand Campaigns Notice</h4>
            <p className={styles.policyParagraph} style={{ margin: 0 }}>
              During regional festive seasons, promotional campaigns, or high-demand wholesale windows, 
              transit times may adjust slightly beyond standard projections.
            </p>
          </div>

          <h3 style={{ margin: '32px 0 16px 0', fontFamily: 'EB Garamond, serif', fontSize: '1.4rem' }}>Verified Delivery Partners</h3>
          <ul className={styles.policyList}>
            <li className={styles.listItem}>DHL (International Premium Air Network)</li>
            <li className={styles.listItem}>Blue Dart (Premium Express Logistics)</li>
            <li className={styles.listItem}>Delhivery Hubs</li>
            <li className={styles.listItem}>DTDC Networks</li>
            <li className={styles.listItem}>India Post Networks</li>
          </ul>
          <p className={styles.policyParagraph}>
            Consignment tracking details are automatically shared via email, SMS, or WhatsApp right upon parcel dispatch.
          </p>
        </div>

        {/* 2. Shipping Charges */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <ShieldCheck className={styles.iconColor} size={28} strokeWidth={1.5} />
            <h2>Shipping Fees & Calculations</h2>
          </div>
          <p className={styles.policyParagraph}>
            Outbound shipping charges are formulated strictly through these data points:
          </p>
          <ul className={styles.policyList}>
            <li className={styles.listItem}>Total dead weight and volumetric constraints of the consignment.</li>
            <li className={styles.listItem}>Packaging metrics and protective containment dimensions.</li>
            <li className={styles.listItem}>Target delivery location tier and designated courier zones.</li>
            <li className={styles.listItem}>Special handling stipulations required for fragile or pristine spice lots.</li>
          </ul>

          <div className={styles.calloutBox} style={{ backgroundColor: '#F5FAF6', border: '1px solid rgba(3,139,69,0.1)' }}>
            <h4 style={{ color: '#038B45' }}>Bulk Wholesale & B2B Freight Quotations</h4>
            <p className={styles.policyParagraph} style={{ margin: 0 }}>
              Cargo handling allocations for volume export containerization vary dynamically by port destinations. 
              Please reach out directly to our commercial trade desk for a custom FOB/CIF freight quotation sheet.
            </p>
          </div>
        </div>

        {/* 3. Returns and Conditions */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <RotateCcw className={styles.iconColor} size={28} strokeWidth={1.5} />
            <h2>Returns & Threshold Eligibility</h2>
          </div>
          <p className={styles.policyParagraph}>
            Due to the perishable and consumable sealed nature of bulk spices, herbal varieties, and agro product commodities, 
            returns are strictly restricted to the following exceptions:
          </p>
          <ul className={styles.policyList}>
            <li className={styles.listItem}>The interior product packaging sustained physical damage during carrier transit.</li>
            <li className={styles.listItem}>The wrong commodity reference sample or variant was incorrectly delivered.</li>
            <li className={styles.listItem}>An internal sample failure is verified and approved by our quality control lab team.</li>
          </ul>

          <h3 style={{ margin: '24px 0 16px 0', fontFamily: 'EB Garamond, serif', fontSize: '1.4rem' }}>Mandatory Verification Steps</h3>
          <ul className={styles.policyList}>
            <li className={styles.listItem}>Our desk must be notified within 48 hours of shipment reception.</li>
            <li className={styles.listItem}>Items must remain completely unused, unopened, and sealed in their original configurations.</li>
            <li className={styles.listItem}>Unboxing videos or high-resolution photos must be attached to the verification file.</li>
          </ul>
        </div>

        {/* 4. Refunds & Cancellations */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <AlertCircle className={styles.iconColor} size={28} strokeWidth={1.5} />
            <h2>Refund Processing & Order Cancellations</h2>
          </div>
          <p className={styles.policyParagraph}>
            Following quality team verification and formal authorization:
          </p>
          <ul className={styles.policyList}>
            <li className={styles.listItem}>Refund updates settle securely within 7–10 working days back to the original source path.</li>
            <li className={styles.listItem}>Cash on Delivery (COD) adjustments are processed via direct bank wire transfers or verified UPI tokens.</li>
            <li className={styles.listItem}>Depending on context, Nelcyra Exports may grant partial or complete resolution credits without forcing physical inventory return transits.</li>
          </ul>

          <h3 style={{ margin: '24px 0 16px 0', fontFamily: 'EB Garamond, serif', fontSize: '1.4rem' }}>Cancellation Windows</h3>
          <p className={styles.policyParagraph}>
            Orders can be updated or cancelled within an absolute **1-hour** submission window, provided processing hasn't initialized. 
            Once loaded onto freight network paths, cancellations can no longer be processed.
          </p>
        </div>

        {/* 5. Exclusions & Disclaimers */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <AlertCircle className={styles.iconColor} size={28} strokeWidth={1.5} />
            <h2>Non-Returnable Exclusions & Notes</h2>
          </div>
          <ul className={styles.policyList}>
            <li className={styles.listItem}>Items processed under custom tailored spec configurations or customized private labeling deals.</li>
            <li className={styles.listItem}>Commodities bought during high-discount clearances or special promotional operations events.</li>
            <li className={styles.listItem}>Opened, unsealed, or partially sampled nutritional packages.</li>
          </ul>
          <div className={styles.calloutBox}>
            <h4>Address Verification Notice</h4>
            <p className={styles.policyParagraph} style={{ margin: 0, fontSize: '0.95rem' }}>
              Ensure all delivery details, codes, and context variables are correct before submitting orders. 
              Nelcyra Exports cannot accept cargo liability extensions for delays derived from custom port clearance holding, adverse elements, or inaccurate delivery documentation details.
            </p>
          </div>
        </div>

        {/* 6. Corporate Operations Contact Desk */}
        <div className={styles.sectionBlock} style={{ backgroundColor: '#12331F', color: '#FFFFFF' }}>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: '2rem', marginBottom: '12px', color: '#FFFFFF' }}>
            Operations & Claims Desk
          </h2>
          <p style={{ color: '#A3B1A9', fontSize: '1rem', marginBottom: '24px' }}>
            Please make sure to supply your official Order ID, consignment details, and video verifications to speed up processing cycles.
          </p>
          
          <div className={styles.contactCardGrid}>
            <div className={styles.contactInfoRow}>
              <Mail size={20} color="#76CD0D" />
              <a href="mailto:sales@nelcyraexports.com" style={{ color: '#76CD0D' }}>sales@nelcyraexports.com</a>
            </div>
            <div className={styles.contactInfoRow}>
              <Phone size={20} color="#76CD0D" />
              <span style={{ color: '#E2E8E4' }}>+91 9380904449 | +91 9061743982</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}