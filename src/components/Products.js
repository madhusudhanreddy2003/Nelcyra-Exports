// src/components/Products.js

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import styles from '../styles/Products.module.css';

export default function Products() {
  const { addToCart, setCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');

  const productData = [
    { id: 'sp1', name: 'Green Cardamom', category: 'Spices', origin: 'Grown in Kerala, IND', img: '/products/cardamom.jpg' },
    { id: 'sp2', name: 'Black Pepper', category: 'Spices', origin: 'Grown in Kerala, IND', img: '/products/black-pepper.jpg' },
    { id: 'sp3', name: 'Clove', category: 'Spices', origin: 'Grown in Tamil Nadu, IND', img: '/products/Cloves.jpg' },
    { id: 'sp4', name: 'Chillies', category: 'Spices', origin: 'Grown in Andhra Pradesh, IND', img: '/products/chilli.jpg' },
    { id: 'sp5', name: 'Turmeric', category: 'Spices', origin: 'Grown in Nizamabad, IND', img: '/products/turmeric-2.jpg' },
    { id: 'ag1', name: 'Banana', category: 'Agri Products', origin: 'Grown in Gujarat, IND', img: '/products/banana-3.jpg' },
    { id: 'ag2', name: 'Coconut', category: 'Agri Products', origin: 'Grown in Karnataka, IND', img: '/products/coconut.jpg' },
    { id: 'ag3', name: 'Coffee Bean', category: 'Agri Products', origin: 'Grown in Wayanad, IND', img: '/products/coffee.jpg' },
    { id: 'ag4', name: 'Organic Jaggery', category: 'Agri Products', origin: 'Grown in Maharashtra, IND', img: '/products/organic-jaggery.jpg' },
    { id: 'ag5', name: 'Fruit & Vegetables', category: 'Agri Products', origin: 'Grown in Various Origins, IND', img: '/products/fruits-vegetables.jpg' }
  ];

  const filteredProducts = activeCategory === 'All' 
    ? productData 
    : productData.filter(item => item.category === activeCategory);

  return (
    <section id="products" className={styles.sectionWrapper}>
      
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>Products</h2>
        <div className={styles.filterRow}>
          {['All', 'Agri Products', 'Spices'].map((category) => (
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
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.card}>
            
            <div className={styles.imageBox}>
              <Image 
                src={product.img} 
                alt={product.name} 
                width={220} 
                height={220} 
                className={styles.productImg}
              />
            </div>

            <div className={styles.metaContainer}>
              <div className={styles.infoRow}>
                <div className={styles.nameBlock}>
                  <span className={styles.productName}>{product.name}</span>
                  <Link href={`/products/${product.id}`} className={styles.viewMore}>
                    view more details
                  </Link>
                </div>
                
                <button 
                  className={styles.addToCartBtn}
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      category: product.category,
                      quantity: '', 
                      packaging: '', 
                      img: product.img
                    });
                    setCartOpen(true);
                  }}
                >
                  Add to Cart
                </button>
                <button className={styles.addToCartBtn}>
                  Buy Now

                </button>
              </div>
              <span className={styles.originText}>{product.origin}</span>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}