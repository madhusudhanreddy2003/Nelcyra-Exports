// src/app/faqs/page.js

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Faqs.module.css';

export default function FaqsPage() {
  // Local active index mapping state tracking
  const [activeFaqId, setActiveFaqId] = useState(null);

  const toggleFaq = (id) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  // Structured dataset populated verbatim from your text sources
  const faqCategories = [
    {
      title: "Commodities & Specifications",
      items: [
        {
          id: "prod-1",
          q: "What agricultural products do you export from India?",
          a: "We export a wide variety of agricultural products in India including, dehydrated products, herbs, and superfoods. We specialize in export-grade agricultural products exported from India to meet international quality standards[cite: 3]."
        },
        {
          id: "prod-2",
          q: "Can you provide detailed product specifications?",
          a: "Yes, detailed product specifications are available for each of our products. Please visit our product pages or contact us for more information[cite: 3]."
        },
        {
          id: "prod-3",
          q: "Do You Offer samples of your products?",
          a: "Yes, we provide samples upon request. Please contact our sales team for more information on how to receive a sample[cite: 3]."
        },
        {
          id: "prod-4",
          q: "What sets your company apart from other exporters?",
          a: "Our commitment to quality, sustainable sourcing, and excellent customer service sets us apart. We work closely with our farmers and partners to ensure the best products reach our customers[cite: 3]."
        }
      ]
    },
    {
      title: "Supply Chain & Logistics",
      items: [
        {
          id: "log-1",
          q: "How do you ensure freshness during transit?",
          a: "Our agriculture exports use advanced logistics and climate-controlled packaging to maintain product freshness and integrity during shipping. This ensures quality in every batch[cite: 3]."
        },
        {
          id: "log-2",
          q: "Which Countries do you export to?",
          a: "Our agriculture exports India operations serve buyers in the Middle East, Europe, Asia, Africa, and North America. We comply with halal, and EU residue standards[cite: 3]."
        },
        {
          id: "log-3",
          q: "What is the Minimum Order Quantity (MOQ)?",
          a: "MOQ varies by product—typically one 20 ft FCL (Full Container Load). We are flexible for private-label and bulk Agri products export from India[cite: 3]."
        },
        {
          id: "log-4",
          q: "Do you handle customs clearance?",
          a: "Yes, we assist with customs clearance and provide all necessary documentation to ensure a smooth import process for our customers[cite: 3]."
        },
        {
          id: "log-5",
          q: "Can I track my order?",
          a: "Yes, once your order is shipped, we provide a tracking number and shipment details. All Argo product exports from our facility are traceable from dispatch to delivery, ensuring peace of mind[cite: 3]."
        }
      ]
    },
    {
      title: "Orders & Client Support",
      items: [
        {
          id: "sup-1",
          q: "How can I place an order?",
          a: "You can place an order by contacting our sales team through our website’s contact form, email, or phone. We will guide you through the process and assist with any questions you may have[cite: 3]."
        },
        {
          id: "sup-2",
          q: "How can I Contact Customer support?",
          a: "You can reach our support team via email, phone, or our website’s contact form. We are here to assist importers, wholesalers, and buyers with queries related to agricultural exports from India[cite: 3]."
        },
        {
          id: "sup-3",
          q: "What post-purchase support do you offer?",
          a: "We provide full post-sale support including product information, order tracking, and after-sales service—making us one of the most responsive agriculture exporters in India[cite: 3]."
        }
      ]
    }
  ];

  return (
    <main className={styles.pageWrapper}>
      
      {/* Banner Header Accent Row */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBg}>
          <Image 
            src="/logo/village.png" 
            alt="Nelcyra Customer Support Knowledge Base" 
            fill 
            priority
            quality={95}
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.subtitleTag}>Information Center</span>
          <h1 className={styles.mainTitle}>Frequently Asked FAQ's</h1>
        </div>
      </div>

      <div className={styles.container}>
        

{faqCategories.map((cat) => (
  <div key={cat.title} className={styles.categoryGroup}>
    <h2 className={styles.categoryTitle}>{cat.title}</h2>
    
    <div>
      {cat.items.map((item) => {
        const isOpen = activeFaqId === item.id;
        return (
          <div 
            key={item.id} 
            className={`${styles.accordionItem} ${isOpen ? styles.accordionActive : ''}`}
          >
            <button 
              className={styles.accordionTrigger}
              onClick={() => toggleFaq(item.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.questionText}>{item.q}</span>
              
              {/* Premium Minimalist SVG Plus/Close Component Toggle */}
              <div className={styles.iconWrapper}>
                <svg 
                  className={styles.svgPlusIcon} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </button>
            
            <div className={styles.accordionPanel}>
              <div className={styles.answerContent}>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
))}

        {/* Bottom Interactive Support Callout Card */}
        <div className={styles.footerSupportBox}>
          <p>Still have questions?</p>
          <Link href="/contact-us" className={styles.supportLinkBtn}>
            Contact US
          </Link>
        </div>
      </div>

    </main>
  );
}