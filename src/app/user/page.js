// src/app/user/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { 
  ShoppingBag, 
  PhoneCall, 
  CheckCircle2, 
  Circle, 
  MapPin, 
  HelpCircle, 
  LogOut,
  ArrowRight
} from 'lucide-react';
import styles from '../../styles/UserPage.module.css';

export default function UserPortalPage() {
  const router = useRouter();
  
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Session Handling
  useEffect(() => {
    const isActive = sessionStorage.getItem('user_session_active');
    const userPhone = sessionStorage.getItem('user_phone_anchor');
    
    if (isActive !== 'true' || !userPhone) {
      router.push('/user/login');
    } else {
      setPhone(userPhone);
    }
  }, [router]);

  // 2. Query orders referencing the active verified phone number in real-time
  useEffect(() => {
    if (!phone) return;

    const q = query(collection(db, 'orders'), where('customerPhone', '==', phone));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(userOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [phone]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/user/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading your logistics dispatch tracking records...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* Top Banner Navigation */}
      <header className={styles.navbar}>
        <div className={styles.brandTitle}>
          <Link href="/">Nelcyra Exports</Link>
        </div>
        <div className={styles.navActions}>
          <span>Verified Client Profile: <strong>{phone}</strong></span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className={styles.contentWorkspace}>
        
        {/* Welcome Block */}
        <section className={styles.welcomeSection}>
          <h1>Your Procurement Track</h1>
          <p>Monitor live cargo transitions, checkpoints, and customs status.</p>
        </section>

        {/* Dynamic State handling: Empty / Deleted States */}
        {orders.length === 0 ? (
          <div className={styles.deletedOrderNotice}>
            <h3>Consignment Notice</h3>
            <p>
              Dear Customer, Your Order has been deleted / distained due to some reasons, 
              for more details contact our support team.
            </p>
            <div className={styles.noticeActions}>
              <a href="mailto:sales@nelcyraexports.com" className={styles.btnPrimary}>
                <PhoneCall size={16} /> Contact Corporate Support
              </a>
              <Link href="/" className={styles.btnSecondary}>
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            
            {/* Active Consignments Array */}
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                
                {/* Card Header Info */}
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.orderLabel}>Order Reference ID</span>
                    <h2>{order.id}</h2>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(' ', '')]}`}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.metadataGrid}>
                  <div>
                    <strong>Total Volume:</strong> {order.globalQuantity}
                  </div>
                  <div>
                    <strong>Destination Address:</strong> {order.address}, {order.city}
                  </div>
                </div>

                {/* Vertical Checklist Pipeline Visualizer */}
                <div className={styles.verticalPipeline}>
                  {order.pipeline && order.pipeline.length > 0 ? (
                    order.pipeline.map((checkpoint, idx) => (
                      <div key={checkpoint.id} className={`${styles.stepNode} ${checkpoint.checked ? styles.stepActive : ''}`}>
                        <div className={styles.iconCol}>
                          {checkpoint.checked ? (
                            <CheckCircle2 size={22} className={styles.checkedIcon} />
                          ) : (
                            <Circle size={22} className={styles.uncheckedIcon} />
                          )}
                          {idx < order.pipeline.length - 1 && <div className={styles.connectorLine}></div>}
                        </div>
                        <div className={styles.textCol}>
                          <h4>{checkpoint.title}</h4>
                          <p>{checkpoint.description}</p>
                          {checkpoint.updatedAt && (
                            <span className={styles.timestamp}>
                              Updated: {new Date(checkpoint.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyPipeline}>
                      <HelpCircle size={32} />
                      <p>Pipeline configuration being resolved by logistics administrator.</p>
                    </div>
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

        {/* Global CTA Action Box */}
        <section className={styles.ctaFooter}>
          <div className={styles.ctaCard}>
            <h3>Need to arrange a new shipment?</h3>
            <p>Directly communicate custom requirements with our central procurement desk.</p>
            <div className={styles.ctaButtons}>
              <Link href="/" className={styles.ctaBtn}>
                Place New Procurement Request <ArrowRight size={16} />
              </Link>
              <a href="https://wa.me/916305313849" target="_blank" className={styles.ctaBtnSecondary}>
                Open WhatsApp Desk
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}