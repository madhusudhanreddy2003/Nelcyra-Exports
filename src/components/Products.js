// src/components/Products.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react'; 
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import styles from '../styles/Products.module.css';

export default function Products() {
  const router = useRouter();
  const { addToCart, setCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LIVE FIRESTORE DATABASE LISTENER ---
  useEffect(() => {
    const productsRef = collection(db, 'products');

    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedProducts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const resolvedImg = data.imageUrl || data.image || data.img || '/products/cardamom.jpg';
          
          // Use admin's sourcingFrom or fallback origin text
          const originLocation = data.sourcingFrom || data.origin || 'Various Origins, IND';

          return {
            id: doc.id,
            name: data.name || data.productDesignation || 'Export Product',
            category: data.category || data.categoryClass || 'Agri Products',
            origin: originLocation.toLowerCase().startsWith('grown in') 
              ? originLocation 
              : `Grown in ${originLocation}`,
            img: resolvedImg,
            value: data.value || data.assetValuation || ''
          };
        });
        setDbProducts(fetchedProducts);
      } else {
        setDbProducts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore public catalog subscription dropped:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = new Set(['All', 'Agri Products', 'Spices']);
    dbProducts.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories);
  }, [dbProducts]);

  const filteredProducts = activeCategory === 'All' 
    ? dbProducts 
    : dbProducts.filter(item => item.category === activeCategory);

  const handleBuyNow = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      quantity: '', 
      img: product.img
    });
    router.push('/shipping-details');
  };

  return (
    <section id="products" className={styles.sectionWrapper}>
      
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>Our Products</h2>
        <div className={styles.filterRow}>
          {availableCategories.map((category) => (
            <button
              key={category}
              className={`${styles.filterBtn} ${activeCategory === category ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.productsGrid}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#617568' }}>
            Loading Live Export Catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#617568' }}>
            No products indexed under this category yet.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className={styles.card}>
              
              {/* IMAGE FULLY FILLS CONTAINER */}
              <div className={styles.imageBox} style={{ width: '100%', height: '260px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={product.img} 
                  alt={product.name} 
                  className={styles.productImg}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.src = '/products/cardamom.jpg';
                  }}
                />
              </div>

              <div className={styles.metaContainer}>
                <div className={styles.infoRow}>
                  <div className={styles.nameBlock}>
                    <span className={styles.productName}>{product.name}</span>
                    <Link href={`/products/${product.id}`} className={styles.viewMore}>
                      view details
                    </Link>
                  </div>
                  
                  <div className={styles.actionCluster}>
                    <button 
                      className={styles.iconAddBtn}
                      title="Add to Cart"
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          quantity: '',
                          img: product.img
                        });
                        setCartOpen(true);
                      }}
                    >
                      <Plus size={18} strokeWidth={2} />
                    </button>

                    <button 
                      className={styles.buyNowBtn}
                      onClick={() => handleBuyNow(product)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                {/* SOURCING FROM / GROWN IN ATTRIBUTE DISPLAY */}
                <span className={styles.originText}>{product.origin}</span>
              </div>

            </div>
          ))
        )}
      </div>

    </section>
  );
}