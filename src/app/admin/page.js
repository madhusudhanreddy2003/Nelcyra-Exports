// src/app/admin/page.js
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '../../lib/firebase'; 
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  LayoutDashboard, 
  Briefcase,
  Layers, 
  Truck, 
  DollarSign, 
  Search, 
  Plus, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  ArrowUpRight,
  Package,
  Anchor,
  Edit2,
  Check,
  Upload
} from 'lucide-react';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // Default to products view for debugging layout
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
  
  // Product Inline Form Edit States
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormState, setEditFormState] = useState({ name: '', category: '', stock: '', value: '' });
  const [uploadingImageId, setUploadingImageId] = useState(null);

  // --- NEW EXPORT FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false); // Custom simulated menu state
  const [newExportForm, setNewExportForm] = useState({
    customerName: '',
    city: '',
    globalQuantity: '',
    status: 'NEW'
  });

  // --- SECURITY LAYER ---
  useEffect(() => {
    const isAuthorized = sessionStorage.getItem('admin_mfa_authorized');
    if (isAuthorized !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);

  // --- REAL-TIME FIRESTORE DATA STREAM ---
  useEffect(() => {
    const ordersCollection = collection(db, 'orders');
    const productsCollection = collection(db, 'products');
    
    // Sync Orders Manifest
    const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Firestore orders stream dropped:", error));

    // Sync Products Catalog with broad fallback structural mappings
    const unsubscribeProducts = onSnapshot(productsCollection, (snapshot) => {
      const parsedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sku: data.sku || data.skuIdentifier || doc.id.slice(0, 8).toUpperCase(),
          name: data.name || data.productDesignation || '',
          category: data.category || data.categoryClass || '',
          stock: data.stock !== undefined ? data.stock : (data.availableStock || 0),
          value: data.value || data.assetValuation || '',
          imageUrl: data.imageUrl || data.image || ''
        };
      });
      setProducts(parsedProducts);
    }, (error) => console.error("Firestore products stream dropped:", error));

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  // --- PIPELINE METRIC CALCULATION ---
  const calculateProgress = useCallback((pipeline = []) => {
    if (!Array.isArray(pipeline) || !pipeline.length) return 0;
    const checked = pipeline.filter(p => p && p.checked).length;
    return Math.round((checked / pipeline.length) * 100);
  }, []);

  // --- CACHED SEARCH ARCHITECTURES ---
  const filteredOrders = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return orders;

    return orders.filter(order => {
      return (
        (order.customerName?.toLowerCase() || '').includes(cleanQuery) ||
        (order.id?.toLowerCase() || '').includes(cleanQuery) ||
        (order.city?.toLowerCase() || '').includes(cleanQuery) ||
        (order.status?.toLowerCase() || '').includes(cleanQuery)
      );
    });
  }, [orders, searchQuery]);

  const filteredProducts = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return products;
    return products.filter(p => 
      (p.name || '').toLowerCase().includes(cleanQuery) || 
      (p.category || '').toLowerCase().includes(cleanQuery) ||
      (p.sku || '').toLowerCase().includes(cleanQuery)
    );
  }, [products, searchQuery]);

  // --- DYNAMIC METRIC MEMOIZATIONS ---
  const dynamicMetrics = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => {
      const progress = calculateProgress(o.pipeline);
      return progress > 0 && progress < 100;
    }).length;
    return { total, active };
  }, [orders, calculateProgress]);

  // --- CONTROLLER HANDLERS ---
  const handleStatusCycle = async (orderId, currentStatus) => {
    if (isUpdatingStatus) return;
    const states = ['NEW', 'IN PROGRESS', 'PENDING', 'HIGH PRIORITY'];
    const nextIndex = (states.indexOf(currentStatus?.toUpperCase()) + 1) % states.length;
    const nextStatus = states[nextIndex];
    setIsUpdatingStatus(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // --- ACTION ROUTINE: DISPATCH NEW FIREBASE DOCUMENT ---
  const handleCreateExport = async (e) => {
    e.preventDefault();
    if (!newExportForm.customerName || !newExportForm.city) return;
    
    setIsSubmitting(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      
      const defaultPipeline = [
        { id: 1, label: 'Documentation Approved', checked: false },
        { id: 2, label: 'Freight Loaded', checked: false },
        { id: 3, label: 'Customs Cleared', checked: false },
        { id: 4, label: 'Port Delivered', checked: false }
      ];

      await addDoc(collection(db, 'orders'), {
        customerName: newExportForm.customerName,
        city: newExportForm.city,
        globalQuantity: newExportForm.globalQuantity || 'Not Specified',
        status: newExportForm.status,
        pipeline: defaultPipeline,
        createdAt: new Date().toISOString()
      });

      setNewExportForm({ customerName: '', city: '', globalQuantity: '', status: 'NEW' });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed executing structural pipeline insert:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- INLINE EDIT ARCHITECTURE ACTIONS ---
  const startEditingProduct = (product) => {
    setEditingProductId(product.id);
    setEditFormState({
      name: product.name,
      category: product.category,
      stock: product.stock,
      value: product.value
    });
  };

  const saveProductEdits = async (productId) => {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Update both potential naming standard variables dynamically to prevent breakage
      await updateDoc(productRef, {
        name: editFormState.name,
        productDesignation: editFormState.name,
        category: editFormState.category,
        categoryClass: editFormState.category,
        stock: Number(editFormState.stock),
        availableStock: Number(editFormState.stock),
        value: editFormState.value,
        assetValuation: editFormState.value
      });
      setEditingProductId(null);
    } catch (err) {
      console.error("Failed saving product update data mapping:", err);
    }
  };

  const handleProductImageUpload = async (productId, file) => {
    if (!file) return;
    setUploadingImageId(productId);
    try {
      const storageRef = ref(storage, `products/${productId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', null, 
        (err) => { console.error(err); setUploadingImageId(null); }, 
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(db, 'products', productId), { 
            imageUrl: downloadUrl,
            image: downloadUrl 
          });
          setUploadingImageId(null);
        }
      );
    } catch (err) {
      console.error("Storage sync dropped pipeline write execution:", err);
      setUploadingImageId(null);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setMenuOpen(false);
    setSearchQuery('');
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    router.replace('/admin/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* 📱 STICKY TOP NAVIGATION BAR */}
      <header className={styles.mobileNavBar}>
        <div className={styles.mobileLogo}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#062313', margin: 0 }}>Nelcyra Console</h2>
        </div>
        <button className={styles.menuToggleBtn} onClick={() => setMenuOpen(prev => !prev)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className={`${styles.sidebarOverlay} ${menuOpen ? styles.sidebarOverlayVisible : ''}`} onClick={() => setMenuOpen(false)}></div>

      {/* 🏛️ ADAPTIVE SIDEBAR CORE NAVIGATION */}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoBlock}>
          <h2>Nelcyra Exports</h2>
          <span>Global Logistics</span>
        </div>

        <nav className={styles.navigation}>
          <button className={activeTab === 'overview' ? styles.activeNavBtn : styles.navBtn} onClick={() => handleTabChange('overview')}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button className={activeTab === 'enquiries' ? styles.activeNavBtn : styles.navBtn} onClick={() => handleTabChange('enquiries')}>
            <Briefcase size={18} /> Enquiries
          </button>
          <button className={activeTab === 'products' ? styles.activeNavBtn : styles.navBtn} onClick={() => handleTabChange('products')}>
            <Layers size={18} /> Products
          </button>
          <button className={activeTab === 'shipments' ? styles.activeNavBtn : styles.navBtn} onClick={() => handleTabChange('shipments')}>
            <Truck size={18} /> Shipments
          </button>
        </nav>

        <button className={styles.newExportBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Export
        </button>

        <div className={styles.adminProfileCard} onClick={handleSignOut} style={{ cursor: 'pointer' }}>
          <div className={styles.profileAvatar}>A</div>
          <div className={styles.profileInfo}>
            <h4>Admin User</h4>
            <p>sales@nelcyra...</p>
          </div>
          <LogOut size={16} style={{ marginLeft: 'auto', color: '#617568' }} />
        </div>
      </aside>

      {/* 📊 ISOLATED WORKSPACE MANAGEMENT TERMINAL */}
      <main className={styles.workspace}>
        
        {/* VIEW 1: MASTER OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <>
            <div className={styles.topActionBar}>
              <h1>Overview</h1>
              <div className={styles.searchWrapper}>
                <input type="text" placeholder="Search..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <Search size={18} className={styles.searchIcon} />
              </div>
            </div>

            <section className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}><span>Total Enquiries</span><TrendingUp size={16} style={{ color: '#038B45' }} /></div>
                <div className={styles.metricValue}>{dynamicMetrics.total}</div>
                <div className={styles.metricSubtext}>Live database records</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}><span>Active Shipments</span><Truck size={16} style={{ color: '#16609C' }} /></div>
                <div className={styles.metricValue}>{dynamicMetrics.active}</div>
                <div className={styles.metricSubtext}>Currently in transit</div>
              </div>
              <div className={styles.metricCard} onClick={() => setActiveTab('products')} style={{ cursor: 'pointer' }}>
                <div className={styles.metricHeader}><span>Product Assets</span><Layers size={16} style={{ color: '#9C7616' }} /></div>
                <div className={styles.metricValue}>{products.length}</div>
                <div className={styles.metricSubtext}>Total indexed profiles</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}><span>Estimated Value</span><DollarSign size={16} style={{ color: '#062313' }} /></div>
                <div className={styles.metricValue}>$4.2M</div>
                <div className={styles.metricSubtext}>Gross conversion tracking</div>
              </div>
            </section>

            <div className={styles.layoutSplit}>
              <div className={styles.flatContainerCard}>
                <div className={styles.cardTop}>
                  <h3>Recent Enquiries</h3>
                  <span className={styles.viewAllLink} onClick={() => setActiveTab('enquiries')}>View All <ArrowUpRight size={14} /></span>
                </div>
                <div className={styles.tableResponsiveWrapper}>
                  <table className={styles.flatTable}>
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Consignee</th>
                        <th>Volume</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 6).map(order => {
                        const statusClass = order.status?.toLowerCase().replace(/\s+/g, '') || 'new';
                        return (
                          <tr key={order.id}>
                            <td style={{ fontWeight: '600' }}>{order.city || 'Global Hub'}</td>
                            <td>{order.customerName || order.id}</td>
                            <td>{order.globalQuantity || 'Pending'}</td>
                            <td>
                              <span onClick={() => handleStatusCycle(order.id, order.status)} className={`${styles.badgeFlat} ${styles[statusClass] || styles.new}`} style={{ cursor: 'pointer' }}>
                                {order.status || 'NEW'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: ALL SITE ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <>
            <div className={styles.topActionBar}>
              <h1>All Website Enquiries</h1>
              <div className={styles.searchWrapper}>
                <input type="text" placeholder="Filter enquiries..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <Search size={18} className={styles.searchIcon} />
              </div>
            </div>
            <div className={styles.flatContainerCard}>
              <div className={styles.tableResponsiveWrapper}>
                <table className={styles.flatTable}>
                  <thead>
                    <tr>
                      <th>Document ID</th>
                      <th>Consignee Reference</th>
                      <th>Destination Hub</th>
                      <th>Volume Capacity</th>
                      <th>Operational Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const statusClass = order.status?.toLowerCase().replace(/\s+/g, '') || 'new';
                      return (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.id}</td>
                          <td style={{ fontWeight: '600' }}>{order.customerName || 'Anonymous Lead'}</td>
                          <td>{order.city || 'Unassigned Port'}</td>
                          <td>{order.globalQuantity || 'Not Specified'}</td>
                          <td>
                            <span onClick={() => handleStatusCycle(order.id, order.status)} className={`${styles.badgeFlat} ${styles[statusClass] || styles.new}`} style={{ cursor: 'pointer' }}>
                              {order.status || 'NEW'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* VIEW 3: PRODUCTS INVENTORY LEDGER SYSTEM (UPDATED MATRIX) */}
        {activeTab === 'products' && (
          <>
            <div className={styles.topActionBar}>
              <h1>Product Inventory Assets</h1>
              <div className={styles.searchWrapper}>
                <input 
                  type="text" 
                  placeholder="Search catalog by name or category..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className={styles.searchIcon} />
              </div>
            </div>

            <div className={styles.flatContainerCard}>
              <div className={styles.cardTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3>Global Export Catalog</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#617568' }}>
                    Total Asset Valuation: <strong style={{ color: '#062313', fontSize: '1.05rem' }}>
                      ₹{products
                        .filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()))
                        .reduce((acc, curr) => {
                          const numericString = String(curr.value || '').replace(/[^0-9.]/g, '');
                          const parsedVal = parseFloat(numericString) || 0;
                          const multiplier = String(curr.value || '').toUpperCase().includes('M') ? 1000000 : 
                                             String(curr.value || '').toUpperCase().includes('K') ? 1000 : 1;
                          return acc + (parsedVal * multiplier);
                        }, 0)
                        .toLocaleString('en-IN')}
                    </strong>
                  </p>
                </div>
                <button className={styles.newExportBtn} onClick={() => setIsModalOpen(true)} style={{ marginTop: 0, width: 'auto', padding: '10px 16px' }}>
                  <Package size={16} /> Add Product
                </button>
              </div>

              <div className={styles.tableResponsiveWrapper}>
                <table className={styles.flatTable}>
                  <thead>
                    <tr>
                      <th>PRODUCT PREVIEW</th>
                      <th>PRODUCT ID</th>
                      <th>PRODUCT DESIGNATION</th>
                      <th>CATEGORY</th>
                      <th>AVAILABLE STOCK</th>
                      <th>ASSET VALUATION</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(product => {
                        const isEditing = editingProductId === product.id;
                        
                        const renderValuationDisplay = (val) => {
                          if (!val) return '—';
                          return String(val).startsWith('₹') ? val : `₹${val}`;
                        };

                        return (
                          <tr key={product.id}>
                            <td>
                              <div style={{ 
                                position: 'relative', 
                                width: '46px', 
                                height: '46px', 
                                borderRadius: '6px', 
                                backgroundColor: '#f4f6f5', 
                                border: '1px solid #e2e6e4', 
                                overflow: 'hidden', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}>
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <Package size={20} style={{ color: '#acb7b0' }} />
                                )}
                                
                                {isEditing && (
                                  <label style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    backgroundColor: 'rgba(6, 35, 19, 0.7)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer', 
                                    color: '#fff'
                                  }}>
                                    <Upload size={14} />
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      style={{ display: 'none' }} 
                                      onChange={(e) => handleProductImageUpload(product.id, e.target.files[0])} 
                                    />
                                  </label>
                                )}
                                
                                {uploadingImageId === product.id && (
                                  <div style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    backgroundColor: 'rgba(255,255,255,0.8)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '11px', 
                                    fontWeight: 'bold',
                                    color: '#038B45' 
                                  }}>...</div>
                                )}
                              </div>
                            </td>

                            <td style={{ color: '#617568', letterSpacing: '0.02em', fontFamily: 'monospace' }}>
                              {product.sku}
                            </td>

                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className={styles.searchInput} 
                                  style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '90%' }} 
                                  value={editFormState.name} 
                                  onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })} 
                                />
                              ) : (
                                <span style={{ fontWeight: '600', color: '#062313' }}>{product.name || '—'}</span>
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className={styles.searchInput} 
                                  style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '90%' }} 
                                  value={editFormState.category} 
                                  onChange={(e) => setEditFormState({ ...editFormState, category: e.target.value })} 
                                  />
                              ) : (
                                product.category || '—'
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input 
                                    type="number" 
                                    className={styles.searchInput} 
                                    style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '80px' }} 
                                    value={editFormState.stock} 
                                    onChange={(e) => setEditFormState({ ...editFormState, stock: e.target.value })} 
                                  />
                                  <span style={{ fontSize: '0.9rem', color: '#617568' }}>Units</span>
                                </div>
                              ) : (
                                <span style={{ color: '#062313' }}>
                                  {product.stock ? `${Number(product.stock).toLocaleString()} Units` : '0 Units'}
                                </span>
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className={styles.searchInput} 
                                  style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '85%' }} 
                                  placeholder="e.g. 12L or 50K"
                                  value={editFormState.value} 
                                  onChange={(e) => setEditFormState({ ...editFormState, value: e.target.value })} 
                                />
                              ) : (
                                <span style={{ fontWeight: '600', color: '#062313' }}>
                                  {renderValuationDisplay(product.value)}
                                </span>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              {isEditing ? (
                                <button 
                                  onClick={() => saveProductEdits(product.id)} 
                                  style={{ background: 'none', border: 'none', color: '#038B45', cursor: 'pointer', padding: '6px' }} 
                                  title="Save updates"
                                >
                                  <Check size={18} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => startEditingProduct(product)} 
                                  style={{ background: 'none', border: 'none', color: '#617568', cursor: 'pointer', padding: '6px', opacity: 0.7 }} 
                                  title="Edit row inline"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* VIEW 4: FREIGHT SHIPMENTS LEDGER SYSTEM */}
        {activeTab === 'shipments' && (
          <>
            <div className={styles.topActionBar}>
              <h1>Cargo Freight Shipments</h1>
              <div className={styles.searchWrapper}>
                <input type="text" placeholder="Search shipments..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <Search size={18} className={styles.searchIcon} />
              </div>
            </div>

            <div className={styles.flatContainerCard}>
              <div className={styles.tableResponsiveWrapper}>
                <table className={styles.flatTable}>
                  <thead>
                    <tr>
                      <th>Tracking Code</th>
                      <th>Consignee</th>
                      <th>Destination</th>
                      <th>Transit Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const percentage = calculateProgress(order.pipeline);
                      return (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'monospace' }}>{order.id.slice(0, 8).toUpperCase()}...</td>
                          <td style={{ fontWeight: '600' }}>{order.customerName || 'Direct Logistics'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Anchor size={14} />{order.city || 'Sea Port'}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                              <div className={styles.sliderContainer} style={{ flex: 1, margin: 0 }}>
                                <div className={styles.sliderFill} style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span style={{ fontWeight: '700' }}>{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>

      {/* 📦 OVERLAY MODAL: NEW FREIGHT EXPORT CREATOR ROUTINE */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 35, 19, 0.4)', 
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', 
            maxWidth: '520px', padding: '32px', border: '1px solid #e2e6e4',
            boxShadow: '0 25px 50px -12px rgba(6, 35, 19, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#062313', fontWeight: '700' }}>Initialize Freight Export</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#617568', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '6px' }}>
                  Consignee / Customer Reference Name
                </label>
                <input 
                  type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '12px 16px', borderRadius: '100px' }}
                  placeholder="e.g. Acme Global Logistics" value={newExportForm.customerName}
                  onChange={(e) => setNewExportForm({ ...newExportForm, customerName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '6px' }}>
                  Destination Hub City / Port Terminal
                </label>
                <input 
                  type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '12px 16px', borderRadius: '100px' }}
                  placeholder="e.g. Rotterdam Port, NL" value={newExportForm.city}
                  onChange={(e) => setNewExportForm({ ...newExportForm, city: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '6px' }}>
                    Volume / Weight Capacity
                  </label>
                  <input 
                    type="text" className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '12px 16px', borderRadius: '100px' }}
                    placeholder="e.g. 15,000 Metric Tons" value={newExportForm.globalQuantity}
                    onChange={(e) => setNewExportForm({ ...newExportForm, globalQuantity: e.target.value })}
                  />
                </div>
                
                {/* Simulated Custom Dropdown System Frame Block */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '6px' }}>
                    Initial Status Priority
                  </label>
                  
                  <div 
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      height: '46px', 
                      backgroundColor: '#fff',
                      border: '1px solid #e2e6e4',
                      borderRadius: '100px',
                      fontSize: '0.9rem',
                      color: '#062313',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <span>{newExportForm.status}</span>
                    <svg 
                      xmlns='http://www.w3.org/2000/svg' 
                      width='16' 
                      height='16' 
                      viewBox='0 0 24 24' 
                      fill='none' 
                      stroke='#617568' 
                      strokeWidth='2' 
                      strokeLinecap='round' 
                      strokeLinejoin='round' 
                      style={{ 
                        transform: statusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s ease' 
                      }}
                    >
                      <polyline points='6 9 12 15 18 9'></polyline>
                    </svg>
                  </div>

                  {statusDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '78px',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e6e4',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(6, 35, 19, 0.1)',
                      zIndex: 10000,
                      overflow: 'hidden',
                      padding: '4px'
                    }}>
                      {['NEW', 'IN PROGRESS', 'PENDING', 'HIGH PRIORITY'].map((statusOption) => (
                        <div
                          key={statusOption}
                          onClick={() => {
                            setNewExportForm({ ...newExportForm, status: statusOption });
                            setStatusDropdownOpen(false);
                          }}
                          style={{
                            padding: '10px 16px',
                            fontSize: '0.9rem',
                            color: newExportForm.status === statusOption ? '#062313' : '#617568',
                            backgroundColor: newExportForm.status === statusOption ? '#b8e5ce' : 'transparent',
                            fontWeight: newExportForm.status === statusOption ? '600' : '500',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease, color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (newExportForm.status !== statusOption) e.currentTarget.style.backgroundColor = '#ccdfd5';
                          }}
                          onMouseLeave={(e) => {
                            if (newExportForm.status !== statusOption) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {statusOption}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  style={{ 
                    background: 'none', 
                    border: 'none',
                    color: '#617568',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '12px 24px',
                    borderRadius: '100px',
                    transition: 'color 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  style={{ 
                    margin: 0, 
                    whiteSpace: 'nowrap',
                    padding: '12px 28px', 
                    opacity: isSubmitting ? 0.7 : 1,
                    backgroundColor: '#062313', 
                    color: '#ffffff', 
                    borderRadius: '100px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '160px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(6, 35, 19, 0.15)'
                  }}
                >
                  {isSubmitting ? 'Creating Manifest...' : 'Deploy Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}