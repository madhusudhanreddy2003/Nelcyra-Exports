// src/app/track/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Search, CheckCircle2, Circle, Package, Anchor, Truck, AlertCircle, ArrowLeft } from 'lucide-react';
import styles from '../../styles/Track.module.css';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('id') || searchParams.get('orderId') || '';

  const [searchCode, setSearchCode] = useState(initialQuery);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Real-time Firestore query listener
  useEffect(() => {
    const rawInput = searchCode.trim();
    if (!rawInput) {
      setActiveOrder(null);
      setErrorMsg(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const queryTerm = rawInput.toLowerCase();
    const cleanDocId = queryTerm.replace(/^nel-?/i, '');
    const ordersCollection = collection(db, 'orders');

    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
      if (!snapshot.empty) {
        const matchedDoc = snapshot.docs.find(docSnap => {
          const data = docSnap.data();
          const docId = docSnap.id.toLowerCase();
          const formattedNELCode = docId.startsWith('nel-') ? docId : `nel-${docId}`;
          const altOrderId = (data.orderId || '').toLowerCase();
          const altTrackingCode = (data.trackingCode || '').toLowerCase();

          return (
            docId === queryTerm ||
            docId === cleanDocId ||
            formattedNELCode === queryTerm ||
            altOrderId === queryTerm ||
            altOrderId === cleanDocId ||
            altTrackingCode === queryTerm ||
            (data.customerName && data.customerName.toLowerCase().includes(queryTerm))
          );
        });

        if (matchedDoc) {
          const data = matchedDoc.data();
          let displayTrackingCode = matchedDoc.id;
          if (!displayTrackingCode.toUpperCase().startsWith('NEL-')) {
            displayTrackingCode = `NEL-${displayTrackingCode.toUpperCase()}`;
          }

          setActiveOrder({
            id: matchedDoc.id,
            trackingCode: data.trackingCode || displayTrackingCode,
            ...data
          });
          setErrorMsg(null);
        } else {
          setActiveOrder(null);
          setErrorMsg(`No active shipment route found for Tracking Code: "${rawInput}"`);
        }
      } else {
        setActiveOrder(null);
        setErrorMsg(`No active shipment route found for Tracking Code: "${rawInput}"`);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore tracking listener error:", err);
      setErrorMsg("Connection error while streaming live shipment data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const calculateProgress = (pipeline = []) => {
    if (!Array.isArray(pipeline) || pipeline.length === 0) return 0;
    const completed = pipeline.filter(step => step && step.checked).length;
    return Math.round((completed / pipeline.length) * 100);
  };

  const progressPercentage = activeOrder ? calculateProgress(activeOrder.pipeline) : 0;

  return (
    <div className={styles.pageWrapper}>
      
      {/* Hero Banner Section */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <Link href="/" className={styles.returnLink}>
            <ArrowLeft size={14} /> Return to Storefront
          </Link>
          <h1 className={styles.heroTitle}>Cargo Shipment Tracker</h1>
          <p className={styles.heroSubtitle}>Real-time logistics milestone execution stream</p>
        </div>
      </section>

      {/* Main Layout Area */}
      <div className={styles.mainContainer}>
        
        {/* Floating Tracking Search Form */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchBox}>
            <input 
              type="text" 
              placeholder="Enter Tracking Code (e.g., NEL-MZQ35JCR...)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className={styles.searchInput}
            />
            <Search size={22} className={styles.searchIcon} />
          </div>
        </form>

        {/* Loading Indicator */}
        {loading && (
          <div className={styles.loadingState}>
            Syncing Live Satellite Telemetry...
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && !loading && (
          <div className={styles.errorCard}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Active Shipment Order Card */}
        {activeOrder && !loading && (
          <div className={styles.orderCard}>
            
            {/* Header / Waybill Identifier Bar */}
            <div className={styles.orderHeader}>
              <div>
                <span className={styles.waybillLabel}>
                  WAYBILL TRACKING REFERENCE
                </span>
                <h2 className={styles.waybillValue}>
                  {activeOrder.trackingCode || `NEL-${activeOrder.id.toUpperCase()}`}
                </h2>
              </div>

              <div>
                <span className={styles.statusBadge}>
                  {activeOrder.status || 'IN TRANSIT'}
                </span>
              </div>
            </div>

            {/* Shipment Key Metadata Split Grid */}
            <div className={styles.metadataGrid}>
              
              <div className={styles.metadataCard}>
                <div className={styles.metadataCardHeader}>
                  <Package size={14} /> Consignee
                </div>
                <div className={styles.metadataCardValue}>
                  {activeOrder.customerName || activeOrder.name || 'Direct Logistics'}
                </div>
              </div>

              <div className={styles.metadataCard}>
                <div className={styles.metadataCardHeader}>
                  <Anchor size={14} /> Destination Port / Hub
                </div>
                <div className={styles.metadataCardValue}>
                  {activeOrder.city || 'Global Hub'}
                </div>
              </div>

              <div className={styles.metadataCard}>
                <div className={styles.metadataCardHeader}>
                  <Truck size={14} /> Target Volume / Specs
                </div>
                <div className={styles.metadataCardValue}>
                  {activeOrder.globalQuantity || 'Standard Manifest'}
                </div>
              </div>

            </div>

            {/* Overall Route Completion Bar */}
            <div className={styles.progressSection}>
              <div className={styles.progressLabelRow}>
                <span className={styles.progressTitle}>Overall Route Completion</span>
                <span className={styles.progressPercent}>{progressPercentage}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Dynamic Pipeline Milestones */}
            <div className={styles.milestonesSection}>
              <h3 className={styles.milestonesTitle}>
                LOGISTICS PIPELINE EXECUTION MILESTONES
              </h3>

              {(!activeOrder.pipeline || activeOrder.pipeline.length === 0) ? (
                <p className={styles.emptyMilestones}>No dynamic milestones registered for this route.</p>
              ) : (
                <div className={styles.milestonesList}>
                  {activeOrder.pipeline.map((step, index) => (
                    <div 
                      key={step.id || index}
                      className={`${styles.milestoneItem} ${step.checked ? styles.milestoneItemCompleted : ''}`}
                    >
                      <div>
                        {step.checked ? (
                          <CheckCircle2 size={24} style={{ color: '#038B45' }} />
                        ) : (
                          <Circle size={24} style={{ color: '#acb7b0' }} />
                        )}
                      </div>

                      <div className={styles.milestoneContent}>
                        <div className={`${styles.milestoneLabel} ${step.checked ? styles.milestoneLabelCompleted : ''}`}>
                          {step.label || step.title}
                        </div>
                        {step.description && (
                          <div className={styles.milestoneDescription}>
                            {step.description}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className={`${styles.stepBadge} ${step.checked ? styles.stepBadgeCompleted : ''}`}>
                          {step.checked ? 'COMPLETED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Bottom Storefront Action Container */}
      <div className={styles.bottomReturnContainer}>
        <Link href="/" className={styles.returnLink}>
          <ArrowLeft size={14} /> Return to Storefront
        </Link>
      </div>

    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}>Loading Tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}