// src/app/admin/page.js
'use client';

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase'; 
import { collection, onSnapshot, doc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
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
  Upload,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckSquare,
  Square,
  Trash2,
  Filter,
  RefreshCw,
  Download,
  Activity,
  Send,
  ArrowRightCircle,
  PlusCircle,
  FileText,
  PieChart,
  BarChart2,
  Compass,
  CheckCircle2,
  Circle
} from 'lucide-react';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); 
  const [activityLogs, setActivityLogs] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
  
  // Tracker Search State
  const [adminTrackCode, setAdminTrackCode] = useState('');

  // Pipeline Filter Matrix State
  const [statusFilter, setStatusFilter] = useState('ALL'); 

  // Advanced Filters System States
  const [stockFilter, setStockFilter] = useState('ALL'); 
  const [valueTierFilter, setValueTierFilter] = useState('ALL'); 

  // Product Inline Form Edit States
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormState, setEditFormState] = useState({ name: '', category: '', stock: '', value: '', sourcingFrom: '' });
  
  // Enquiry Inline Form Edit States (FEATURE 1)
  const [editingEnquiryId, setEditingEnquiryId] = useState(null);
  const [editEnquiryFormState, setEditEnquiryFormState] = useState({
    customerName: '',
    city: '',
    globalQuantity: '',
    customerPhone: '',
    customerEmail: '',
    address: ''
  });

  // Dynamic Pipeline Step Editing States
  const [editingStepId, setEditingStepId] = useState(null);
  const [editStepLabel, setEditStepLabel] = useState('');
  const [newStepInput, setNewStepInput] = useState({});

  // Batch Selection State
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  // Enquiry Expansion
  const [expandedEnquiryId, setExpandedEnquiryId] = useState(null);
  const [isConvertingEnquiry, setIsConvertingEnquiry] = useState(null);

  // Recent Activity Log Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Form Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExportForm, setNewExportForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    city: '',
    address: '',
    globalQuantity: '',
    status: 'NEW'
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productImageFile, setProductImageFile] = useState(null);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: '',
    stock: '',
    value: '',
    sourcingFrom: '',
    imageUrl: ''
  });

  // Shipment Sub-Grid
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Security Check
  useEffect(() => {
    const isAuthorized = sessionStorage.getItem('admin_mfa_authorized');
    if (isAuthorized !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);

  // Activity Logging
  const logSystemActivity = async (action, details) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        action,
        details,
        user: 'Admin User',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed writing activity log:", err);
    }
  };

  // Clear All Recent Activity Logs
  const handleClearAllActivityLogs = async () => {
    if (activityLogs.length === 0) return;
    
    const confirmClear = window.confirm("Are you sure you want to clear all recent activity logs?");
    if (!confirmClear) return;

    try {
      const batch = writeBatch(db);
      activityLogs.forEach((log) => {
        const docRef = doc(db, 'activity_logs', log.id);
        batch.delete(docRef);
      });

      await batch.commit();
      setIsAuditModalOpen(false);
    } catch (err) {
      console.error("Failed clearing activity logs:", err);
      alert("Failed to clear activity logs.");
    }
  };

  // Real-time Firestore Streams
  useEffect(() => {
    const ordersCollection = collection(db, 'orders');
    const productsCollection = collection(db, 'products');
    const logsCollection = collection(db, 'activity_logs');
    
    const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
      setOrders(snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedId = doc.id;
        if (!formattedId.startsWith('NEL-')) {
          formattedId = `NEL-${formattedId.toUpperCase()}`;
        }
        return { ...data, id: doc.id, trackingCode: formattedId };
      }));
    }, (error) => console.error("Firestore orders stream error:", error));

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
          sourcingFrom: data.sourcingFrom || data.origin || 'Various Origins, IND',
          imageUrl: data.imageUrl || data.image || data.img || ''
        };
      });
      setProducts(parsedProducts);
    }, (error) => console.error("Firestore products stream error:", error));

    const unsubscribeLogs = onSnapshot(logsCollection, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivityLogs(logs);
    }, (error) => console.error("Activity log stream error:", error));

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeLogs();
    };
  }, []);

  const parseAssetStringValue = useCallback((valueStr) => {
    const rawString = String(valueStr || '').toUpperCase();
    const numericString = rawString.replace(/[^0-9.]/g, '');
    const parsedVal = parseFloat(numericString) || 0;
    
    const multiplier = rawString.includes('CR') ? 10000000 :
                       rawString.includes('M')  ? 1000000  : 
                       rawString.includes('L')  ? 100000   : 
                       rawString.includes('K')  ? 1000     : 1;
                       
    return parsedVal * multiplier;
  }, []);

  const calculateProgress = useCallback((pipeline = []) => {
    if (!Array.isArray(pipeline) || !pipeline.length) return 0;
    const checked = pipeline.filter(p => p && p.checked).length;
    return Math.round((checked / pipeline.length) * 100);
  }, []);

  // Filtered Memoizations
  const filteredOrders = useMemo(() => {
    let output = orders;
    if (statusFilter !== 'ALL') {
      output = output.filter(order => order.status?.toUpperCase() === statusFilter);
    }
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return output;

    return output.filter(order => {
      return (
        (order.customerName?.toLowerCase() || '').includes(cleanQuery) ||
        (order.id?.toLowerCase() || '').includes(cleanQuery) ||
        (order.trackingCode?.toLowerCase() || '').includes(cleanQuery) ||
        (order.city?.toLowerCase() || '').includes(cleanQuery) ||
        (order.status?.toLowerCase() || '').includes(cleanQuery)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const filteredProducts = useMemo(() => {
    let output = products;
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery) {
      output = output.filter(p => 
        (p.name || '').toLowerCase().includes(cleanQuery) || 
        (p.category || '').toLowerCase().includes(cleanQuery) ||
        (p.sku || '').toLowerCase().includes(cleanQuery) ||
        (p.sourcingFrom || '').toLowerCase().includes(cleanQuery)
      );
    }

    if (stockFilter === 'LOW_STOCK') {
      output = output.filter(p => Number(p.stock) < 5000);
    } else if (stockFilter === 'HIGH_STOCK') {
      output = output.filter(p => Number(p.stock) >= 5000);
    }

    if (valueTierFilter === 'HIGH_VALUE') {
      output = output.filter(p => parseAssetStringValue(p.value) >= 2000000);
    } else if (valueTierFilter === 'BUDGET') {
      output = output.filter(p => parseAssetStringValue(p.value) < 2000000);
    }

    return output;
  }, [products, searchQuery, stockFilter, valueTierFilter, parseAssetStringValue]);

  const analyticsData = useMemo(() => {
    const cityCounts = {};
    orders.forEach(o => {
      const city = o.city || 'Unassigned Hub';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const categoryCounts = {};
    products.forEach(p => {
      const cat = p.category || 'Unassigned';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return { cityCounts, categoryCounts };
  }, [orders, products]);

  const dynamicMetrics = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => {
      const progress = calculateProgress(o.pipeline);
      return progress > 0 && progress < 100;
    }).length;

    const globalValuation = products.reduce((acc, curr) => {
      return acc + parseAssetStringValue(curr.value);
    }, 0);

    return { total, active, globalValuation };
  }, [orders, products, calculateProgress, parseAssetStringValue]);

  const selectedPreviewOrder = useMemo(() => {
    if (!adminTrackCode) return orders[0] || null;
    const queryTerm = adminTrackCode.trim().toLowerCase();
    return orders.find(o => 
      o.id.toLowerCase() === queryTerm || 
      (o.trackingCode && o.trackingCode.toLowerCase() === queryTerm) ||
      (o.orderId && o.orderId.toLowerCase() === queryTerm) ||
      (o.customerName && o.customerName.toLowerCase().includes(queryTerm))
    ) || null;
  }, [orders, adminTrackCode]);

  // TOGGLE PIPELINE STEP & AUTOMATICALLY DISPATCH 100% ORDER DELIVERED EMAIL
  const handleTogglePipelineStep = async (orderId, currentPipeline, stepId) => {
    const updatedPipeline = (currentPipeline || []).map(step => {
      if (step.id === stepId) {
        return { ...step, checked: !step.checked };
      }
      return step;
    });

    const newProgress = calculateProgress(updatedPipeline);
    const is100Percent = newProgress === 100;
    const targetOrder = orders.find(o => o.id === orderId);

    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        pipeline: updatedPipeline,
        ...(is100Percent ? { status: 'DELIVERED' } : {})
      });
      await logSystemActivity('PIPELINE_TOGGLE', `Toggled milestone step #${stepId} for order ${orderId}`);

      if (is100Percent && targetOrder) {
        const targetEmail = targetOrder.customerEmail || targetOrder.email;
        if (targetEmail) {
          const trackingId = targetOrder.trackingCode || targetOrder.id;
          const trackingUrl = `https://www.nelcyraexports.com/track?id=${trackingId}`;

          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: targetEmail,
                subject: `Order Delivered: ${trackingId} — 100% Completed | Nelcyra Exports`,
                html: `
                  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e6e4; border-radius: 16px; overflow: hidden; color: #062313; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    
                    <div style="background: linear-gradient(135deg, #062313 0%, #038B45 100%); padding: 28px 32px; text-align: left;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">NELCYRA EXPORTS</h1>
                      <p style="color: #a8d5c2; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.08em;">Global Logistics & Trade Network</p>
                    </div>

                    <div style="padding: 32px;">
                      <p style="font-size: 16px; font-weight: 700; color: #062313; margin-top: 0;">Dear ${targetOrder.customerName || 'Valued Customer'},</p>
                      
                      <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                        We are thrilled to inform you that your cargo shipment registered under Tracking Reference 
                        <strong style="color: #038B45; font-family: monospace;">${trackingId}</strong> has reached 100% transit completion and has been <strong style="color: #038B45;">DELIVERED</strong> to destination port <strong>${targetOrder.city || 'Destination Hub'}</strong>.
                      </p>

                      <div style="background-color: #f4faf7; border: 1px solid #d0e8dc; border-left: 4px solid #038B45; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                          <span style="font-size: 12px; font-weight: 800; color: #617568; text-transform: uppercase;">Shipping Progress</span>
                          <span style="font-size: 18px; font-weight: 800; color: #038B45;">100% COMPLETED</span>
                        </div>
                        
                        <div style="height: 8px; background-color: #038B45; border-radius: 100px; overflow: hidden; margin-bottom: 12px;"></div>

                        <p style="margin: 0; font-size: 13px; color: #062313;">
                          <strong>Final Status:</strong> <span style="color: #038B45; font-weight: 700;">ORDER DELIVERED</span>
                        </p>
                      </div>

                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #038B45; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 100px; box-shadow: 0 4px 14px rgba(3, 139, 69, 0.3);">
                          View Completed Waybill at www.nelcyraexports.com
                        </a>
                        <p style="font-size: 12px; color: #617568; margin-top: 10px;">
                          Or copy link: <a href="${trackingUrl}" style="color: #038B45; text-decoration: underline;">${trackingUrl}</a>
                        </p>
                      </div>

                      <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                        Thank you for trusting <strong>Nelcyra Exports</strong> as your strategic global supply chain partner.
                      </p>

                      <p style="font-size: 14px; font-weight: 600; color: #062313; margin-bottom: 0;">
                        Warm regards,<br>
                        <span style="color: #038B45;">Nelcyra Exports Commercial Logistics Team</span>
                      </p>
                    </div>

                    <div style="border-top: 1px solid #eaeaea; background-color: #fafaf5; padding: 24px; text-align: center;">
                      <img 
                        src="https://www.nelcyraexports.com/logo/Nelcyra%20Footer.png" 
                        alt="Nelcyra Exports Footer Banner" 
                        style="max-width: 220px; height: auto; margin-bottom: 12px; display: inline-block;"
                      />
                      <p style="font-size: 11px; color: #8fa096; margin: 0;">
                        © ${new Date().getFullYear()} Nelcyra Exports Global Logistics Network.<br>All rights reserved. Sourced with Care — Delivered with Purpose.
                      </p>
                    </div>

                  </div>
                `
              })
            });
            await logSystemActivity('EMAIL_DISPATCH', `Delivered 100% completion order delivered email to ${targetEmail}`);
          } catch (emailErr) {
            console.error("Failed to send order delivered email:", emailErr);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPipelineStep = async (orderId, currentPipeline) => {
    const stepLabel = (newStepInput[orderId] || '').trim();
    if (!stepLabel) return;

    const newStep = {
      id: Date.now(),
      label: stepLabel,
      checked: false
    };

    const updatedPipeline = [...(currentPipeline || []), newStep];

    try {
      await updateDoc(doc(db, 'orders', orderId), { pipeline: updatedPipeline });
      await logSystemActivity('PIPELINE_ADD_STEP', `Added step "${stepLabel}" to order ${orderId}`);
      setNewStepInput({ ...newStepInput, [orderId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePipelineStep = async (orderId, currentPipeline, stepId) => {
    const updatedPipeline = (currentPipeline || []).filter(step => step.id !== stepId);

    try {
      await updateDoc(doc(db, 'orders', orderId), { pipeline: updatedPipeline });
      await logSystemActivity('PIPELINE_DELETE_STEP', `Removed milestone step #${stepId} from order ${orderId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStepLabel = async (orderId, currentPipeline, stepId) => {
    if (!editStepLabel.trim()) return;

    const updatedPipeline = (currentPipeline || []).map(step => {
      if (step.id === stepId) {
        return { ...step, label: editStepLabel.trim() };
      }
      return step;
    });

    try {
      await updateDoc(doc(db, 'orders', orderId), { pipeline: updatedPipeline });
      await logSystemActivity('PIPELINE_EDIT_STEP', `Updated label for step #${stepId} to "${editStepLabel.trim()}"`);
      setEditingStepId(null);
      setEditStepLabel('');
    } catch (err) {
      console.error(err);
    }
  };

  // MANUAL DISPATCH STATUS EMAIL BUTTON HANDLER
  const handleDispatchStatusEmail = async (order) => {
    let targetEmail = order.customerEmail || order.email;

    if (!targetEmail) {
      const inputEmail = window.prompt("No customer email address on file for this order.\nPlease enter the consignee's email address below:");
      if (!inputEmail) return;
      if (!inputEmail.includes('@')) {
        alert("Please enter a valid email address.");
        return;
      }

      targetEmail = inputEmail.trim();

      try {
        await updateDoc(doc(db, 'orders', order.id), {
          customerEmail: targetEmail,
          email: targetEmail
        });
      } catch (err) {
        console.error("Failed saving email to order document:", err);
      }
    }

    const progress = calculateProgress(order.pipeline);
    const trackingId = order.trackingCode || order.id;
    const trackingUrl = `https://www.nelcyraexports.com/track?id=${trackingId}`;

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: `Shipment Dispatch Update: ${trackingId} is now ${progress}% Complete`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e6e4; border-radius: 16px; overflow: hidden; color: #062313; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              
              <div style="background: linear-gradient(135deg, #062313 0%, #038B45 100%); padding: 28px 32px; text-align: left;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">NELCYRA EXPORTS</h1>
                <p style="color: #a8d5c2; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.08em;">Global Logistics & Trade Network</p>
              </div>

              <div style="padding: 32px;">
                <p style="font-size: 16px; font-weight: 700; color: #062313; margin-top: 0;">Dear ${order.customerName || 'Valued Consignee'},</p>
                
                <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                  We are pleased to inform you that your export consignment registered under Tracking Reference 
                  <strong style="color: #038B45; font-family: monospace;">${trackingId}</strong> has progressed through our international transit checkpoint heading towards 
                  <strong>${order.city || 'Destination Port'}</strong>.
                </p>

                <div style="background-color: #f4faf7; border: 1px solid #d0e8dc; border-left: 4px solid #038B45; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 800; color: #617568; text-transform: uppercase;">Transit Progress</span>
                    <span style="font-size: 18px; font-weight: 800; color: #038B45;">${progress}%</span>
                  </div>
                  
                  <div style="height: 8px; background-color: #e2e6e4; border-radius: 100px; overflow: hidden; margin-bottom: 12px;">
                    <div style="width: ${progress}%; height: 100%; background-color: #038B45;"></div>
                  </div>

                  <p style="margin: 0; font-size: 13px; color: #062313;">
                    <strong>Operational Status:</strong> <span style="color: #038B45; font-weight: 700;">${order.status || 'IN TRANSIT'}</span>
                  </p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #038B45; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 100px; box-shadow: 0 4px 14px rgba(3, 139, 69, 0.3);">
                    Track Consignment at www.nelcyraexports.com
                  </a>
                  <p style="font-size: 12px; color: #617568; margin-top: 10px;">
                    Or copy link: <a href="${trackingUrl}" style="color: #038B45; text-decoration: underline;">${trackingUrl}</a>
                  </p>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                  Thank you for trusting <strong>Nelcyra Exports</strong> as your strategic global supply chain partner. Should you require further documentation or shipping specs, please feel free to reach out directly to our commercial team.
                </p>

                <p style="font-size: 14px; font-weight: 600; color: #062313; margin-bottom: 0;">
                  Warm regards,<br>
                  <span style="color: #038B45;">Nelcyra Exports Commercial Logistics Team</span>
                </p>
              </div>

              <div style="border-top: 1px solid #eaeaea; background-color: #fafaf5; padding: 24px; text-align: center;">
                <img 
                  src="https://www.nelcyraexports.com/logo/Nelcyra%20Footer.png" 
                  alt="Nelcyra Exports Footer Banner" 
                  style="max-width: 220px; height: auto; margin-bottom: 12px; display: inline-block;"
                />
                <p style="font-size: 11px; color: #8fa096; margin: 0;">
                  © ${new Date().getFullYear()} Nelcyra Exports Global Logistics Network.<br>All rights reserved. Sourced with Care — Delivered with Purpose.
                </p>
              </div>

            </div>
          `
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await logSystemActivity('EMAIL_DISPATCH', `Delivered status update email to ${targetEmail}`);
        alert(`📧 Status update email delivered successfully to ${targetEmail}!`);
      } else {
        alert(`Failed to send email: ${data.error || 'SMTP Connection Error'}`);
      }
    } catch (err) {
      console.error("Email dispatch failed:", err);
      alert("Failed to connect to email API server.");
    }
  };

  // Printable Waybill PDF
  const handlePrintWaybill = (order) => {
    const printWindow = window.open('', '_blank');
    const progress = calculateProgress(order.pipeline);
    const trackingId = order.trackingCode || order.id;

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Waybill - ${trackingId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #062313; }
            .header { border-bottom: 3px solid #038B45; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 14px; color: #617568; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .box { background: #fafbfa; border: 1px solid #e2e6e4; padding: 16px; border-radius: 8px; }
            .label { font-size: 11px; text-transform: uppercase; color: #617568; font-weight: bold; }
            .val { font-size: 16px; font-weight: bold; margin-top: 4px; }
            .pipeline { margin-top: 30px; }
            .step { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; }
            .badge { display: inline-block; padding: 4px 12px; background: #038B45; color: #fff; border-radius: 100px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">NELCYRA EXPORTS</h1>
              <div class="subtitle">Global Trade Cargo Manifest & Waybill</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${order.status || 'IN TRANSIT'}</span>
              <div style="font-size: 12px; color: #617568; margin-top: 6px;">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="label">Waybill Tracking ID</div>
              <div class="val">${trackingId}</div>
            </div>
            <div class="box">
              <div class="label">Consignee Name</div>
              <div class="val">${order.customerName || 'N/A'}</div>
            </div>
            <div class="box">
              <div class="label">Destination Port / Hub</div>
              <div class="val">${order.city || 'N/A'}</div>
            </div>
            <div class="box">
              <div class="label">Cargo Volume / Specs</div>
              <div class="val">${order.globalQuantity || 'Standard'}</div>
            </div>
          </div>

          <div class="box" style="margin-bottom: 30px;">
            <div class="label">Route Execution Progress</div>
            <div class="val" style="color: #038B45;">${progress}% Completed</div>
          </div>

          <div class="pipeline">
            <div class="label" style="margin-bottom: 12px;">Milestone Execution Trail</div>
            ${(order.pipeline || []).map(s => `
              <div class="step">
                <span style="color: ${s.checked ? '#038B45' : '#acb7b0'}; font-weight: bold;">[${s.checked ? '✔' : ' '}]</span>
                <span>${s.label}</span>
              </div>
            `).join('')}
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    logSystemActivity('PRINT_WAYBILL', `Generated waybill PDF for ${trackingId}`);
  };

  const exportDatasetToCSV = (filename, dataArray) => {
    if (!dataArray || !dataArray.length) {
      alert("No active data entries to export.");
      return;
    }

    const headers = Object.keys(dataArray[0]).filter(k => typeof dataArray[0][k] !== 'object');
    const csvRows = [headers.join(',')];

    dataArray.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logSystemActivity('EXPORT_CSV', `Downloaded ${dataArray.length} records for ${filename}`);
  };

  // FEATURE 2 FIX: PROMOTING LEAD IN-PLACE WITHOUT DUPLICATING DOCUMENTS
  const handleConvertEnquiryToShipment = async (enquiry) => {
    setIsConvertingEnquiry(enquiry.id);
    try {
      const defaultPipeline = [
        { id: 1, label: 'Documentation Approved', checked: true },
        { id: 2, label: 'Freight Loaded', checked: false },
        { id: 3, label: 'Customs Cleared', checked: false },
        { id: 4, label: 'Port Delivered', checked: false }
      ];

      const customerEmail = enquiry.customerEmail || enquiry.email || '';
      const trackingCode = enquiry.trackingCode || enquiry.id;

      // Update existing document directly to active shipping status
      await updateDoc(doc(db, 'orders', enquiry.id), { 
        status: 'IN PROGRESS',
        pipeline: defaultPipeline
      });

      await logSystemActivity('LEAD_CONVERTED', `Promoted Enquiry ID ${enquiry.id} to active Shipment ${trackingCode}`);

      // Dispatch "Order Accepted" Email
      if (customerEmail) {
        const trackingUrl = `https://www.nelcyraexports.com/track?id=${trackingCode}`;
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: customerEmail,
              subject: `Order Accepted: ${trackingCode} | Nelcyra Exports`,
              html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e6e4; border-radius: 16px; overflow: hidden; color: #062313; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  
                  <div style="background: linear-gradient(135deg, #062313 0%, #038B45 100%); padding: 28px 32px; text-align: left;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">NELCYRA EXPORTS</h1>
                    <p style="color: #a8d5c2; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.08em;">Global Logistics & Trade Network</p>
                  </div>

                  <div style="padding: 32px;">
                    <p style="font-size: 16px; font-weight: 700; color: #062313; margin-top: 0;">Dear ${enquiry.customerName || 'Valued Customer'},</p>
                    
                    <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                      We are pleased to inform you that your order has been <strong style="color: #038B45;">ACCEPTED</strong> and successfully processed into our active shipping system under Tracking Reference <strong style="color: #038B45; font-family: monospace;">${trackingCode}</strong>.
                    </p>

                    <div style="background-color: #f4faf7; border: 1px solid #d0e8dc; border-left: 4px solid #038B45; border-radius: 8px; padding: 20px; margin: 24px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #062313; font-weight: 700;">
                        Consignment Dispatch Notice
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #4a5043; line-height: 1.5;">
                        Your consignment is being prepared for dispatch to <strong>${enquiry.city || 'Destination Port'}</strong>. You will receive further updates soon as your shipment moves across our global logistics network.
                      </p>
                    </div>

                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #038B45; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 100px; box-shadow: 0 4px 14px rgba(3, 139, 69, 0.3);">
                        Track Consignment at www.nelcyraexports.com
                      </a>
                      <p style="font-size: 12px; color: #617568; margin-top: 10px;">
                        Or copy link: <a href="${trackingUrl}" style="color: #038B45; text-decoration: underline;">${trackingUrl}</a>
                      </p>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                      Thank you for trusting <strong>Nelcyra Exports</strong> as your strategic global supply chain partner.
                    </p>

                    <p style="font-size: 14px; font-weight: 600; color: #062313; margin-bottom: 0;">
                      Warm regards,<br>
                      <span style="color: #038B45;">Nelcyra Exports Commercial Logistics Team</span>
                    </p>
                  </div>

                  <div style="border-top: 1px solid #eaeaea; background-color: #fafaf5; padding: 24px; text-align: center;">
                    <img 
                      src="https://www.nelcyraexports.com/logo/Nelcyra%20Footer.png" 
                      alt="Nelcyra Exports Footer Banner" 
                      style="max-width: 220px; height: auto; margin-bottom: 12px; display: inline-block;"
                    />
                    <p style="font-size: 11px; color: #8fa096; margin: 0;">
                      © ${new Date().getFullYear()} Nelcyra Exports Global Logistics Network.<br>All rights reserved. Sourced with Care — Delivered with Purpose.
                    </p>
                  </div>

                </div>
              `
            })
          });
          await logSystemActivity('EMAIL_DISPATCH', `Sent order accepted email to ${customerEmail}`);
        } catch (emailErr) {
          console.error("Failed sending order acceptance email:", emailErr);
        }
      }

      alert(`🎉 Lead successfully converted & notification email sent! Tracking ID: ${trackingCode}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConvertingEnquiry(null);
    }
  };

  // EDIT ENQUIRY METADATA HANDLERS (FEATURE 1)
  const startEditingEnquiry = (order) => {
    setEditingEnquiryId(order.id);
    setEditEnquiryFormState({
      customerName: order.customerName || '',
      city: order.city || '',
      globalQuantity: order.globalQuantity || '',
      customerPhone: order.customerPhone || order.phone || '',
      customerEmail: order.customerEmail || order.email || '',
      address: order.address || ''
    });
  };

  const saveEnquiryEdits = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        customerName: editEnquiryFormState.customerName.trim(),
        city: editEnquiryFormState.city.trim(),
        globalQuantity: editEnquiryFormState.globalQuantity.trim(),
        customerPhone: editEnquiryFormState.customerPhone.trim(),
        phone: editEnquiryFormState.customerPhone.trim(),
        customerEmail: editEnquiryFormState.customerEmail.trim(),
        email: editEnquiryFormState.customerEmail.trim(),
        address: editEnquiryFormState.address.trim()
      });
      await logSystemActivity('UPDATE_ENQUIRY', `Saved metadata edits for Enquiry ID ${orderId}`);
      setEditingEnquiryId(null);
    } catch (err) {
      console.error("Failed saving enquiry edits:", err);
      alert("Failed to update enquiry details.");
    }
  };

  const handleExecuteBatchDelete = async () => {
    if (selectedProductIds.length === 0) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to permanently purge ${selectedProductIds.length} selected items?`);
    if (!confirmDelete) return;

    setIsBatchUpdating(true);
    try {
      const batch = writeBatch(db);
      selectedProductIds.forEach((id) => {
        const docRef = doc(db, 'products', id);
        batch.delete(docRef);
      });

      await batch.commit();
      await logSystemActivity('BATCH_DELETE', `Purged ${selectedProductIds.length} products`);
      setSelectedProductIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const handleToggleProductSelection = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleClearAllFilters = () => {
    setStockFilter('ALL');
    setValueTierFilter('ALL');
    setSearchQuery('');
  };

  const handleStatusCycle = async (orderId, currentStatus) => {
    if (isUpdatingStatus) return;
    const states = ['NEW', 'IN PROGRESS', 'PENDING', 'HIGH PRIORITY'];
    const nextIndex = (states.indexOf(currentStatus?.toUpperCase()) + 1) % states.length;
    const nextStatus = states[nextIndex];
    setIsUpdatingStatus(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
      await logSystemActivity('STATUS_UPDATE', `Updated Order ${orderId} to ${nextStatus}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleCreateExport = async (e) => {
    e.preventDefault();
    if (!newExportForm.customerName || !newExportForm.city) return;
    
    try {
      const defaultPipeline = [
        { id: 1, label: 'Documentation Approved', checked: true },
        { id: 2, label: 'Freight Loaded', checked: false },
        { id: 3, label: 'Customs Cleared', checked: false },
        { id: 4, label: 'Port Delivered', checked: false }
      ];

      const customNELCode = `NEL-${Math.floor(100000 + Math.random() * 900000)}`;

      await addDoc(collection(db, 'orders'), {
        orderId: customNELCode,
        customerName: newExportForm.customerName,
        customerEmail: newExportForm.customerEmail || '',
        customerPhone: newExportForm.customerPhone || '',
        city: newExportForm.city,
        address: newExportForm.address || newExportForm.city,
        globalQuantity: newExportForm.globalQuantity || 'Not Specified',
        status: newExportForm.status || 'NEW',
        pipeline: defaultPipeline,
        createdAt: new Date().toISOString()
      });

      await logSystemActivity('NEW_EXPORT', `Created Export ${customNELCode} for ${newExportForm.customerName}`);

      if (newExportForm.customerEmail) {
        const trackingUrl = `https://www.nelcyraexports.com/track?id=${customNELCode}`;
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: newExportForm.customerEmail,
              subject: `Freight Export Initialized: ${customNELCode} | Nelcyra Exports`,
              html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e6e4; border-radius: 16px; overflow: hidden; color: #062313; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <div style="background: linear-gradient(135deg, #062313 0%, #038B45 100%); padding: 28px 32px; text-align: left;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">NELCYRA EXPORTS</h1>
                    <p style="color: #a8d5c2; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.08em;">Global Logistics & Trade Network</p>
                  </div>
                  <div style="padding: 32px;">
                    <p style="font-size: 16px; font-weight: 700; color: #062313; margin-top: 0;">Dear ${newExportForm.customerName},</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #4a5043;">
                      Your freight export shipment has been initialized under Tracking Reference <strong style="color: #038B45; font-family: monospace;">${customNELCode}</strong> heading towards <strong>${newExportForm.city}</strong>.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #038B45; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 100px;">
                        Track Consignment at www.nelcyraexports.com
                      </a>
                    </div>
                  </div>
                  <div style="border-top: 1px solid #eaeaea; background-color: #fafaf5; padding: 24px; text-align: center;">
                    <img src="https://www.nelcyraexports.com/logo/Nelcyra%20Footer.png" alt="Nelcyra Exports" style="max-width: 220px; height: auto;" />
                  </div>
                </div>
              `
            })
          });
        } catch (err) {
          console.error("Failed to send export initialization email:", err);
        }
      }

      setNewExportForm({ customerName: '', customerEmail: '', customerPhone: '', city: '', address: '', globalQuantity: '', status: 'NEW' });
      setIsModalOpen(false);
      alert(`🎉 Export ${customNELCode} created!`);
    } catch (err) {
      console.error(err);
    }
  };

  // BASE64 DIRECT FILE UPLOADS WITH SOURCING FROM ATTRIBUTE
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.category) {
      alert("Please enter a Product Name and Category.");
      return;
    }

    setIsCreatingProduct(true);

    try {
      const rawSku = 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      let formattedValue = newProductForm.value.trim();
      if (formattedValue && !formattedValue.startsWith('₹')) {
        formattedValue = `₹${formattedValue}`;
      }

      let finalImageUrl = newProductForm.imageUrl?.trim() || '/products/cardamom.jpg';
      const sourcingLocation = newProductForm.sourcingFrom.trim() || 'Various Origins, IND';

      if (productImageFile) {
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(productImageFile);
        });
      }

      await addDoc(collection(db, 'products'), {
        sku: rawSku,
        skuIdentifier: rawSku,
        name: newProductForm.name.trim(),
        productDesignation: newProductForm.name.trim(),
        category: newProductForm.category.trim(),
        categoryClass: newProductForm.category.trim(),
        stock: Number(newProductForm.stock) || 0,
        availableStock: Number(newProductForm.stock) || 0,
        value: formattedValue || '₹0',
        assetValuation: formattedValue || '₹0',
        sourcingFrom: sourcingLocation,
        origin: sourcingLocation,
        imageUrl: finalImageUrl,
        image: finalImageUrl,
        createdAt: new Date().toISOString()
      });

      await logSystemActivity('CREATE_PRODUCT', `Uploaded & Indexed ${newProductForm.name} (${rawSku})`);
      setNewProductForm({ name: '', category: '', stock: '', value: '', sourcingFrom: '', imageUrl: '' });
      setProductImageFile(null);
      setIsProductModalOpen(false);
      alert("🎉 Product image saved and live on storefront!");

    } catch (err) {
      console.error("Product creation failed:", err);
      alert("Failed to save product: " + (err.message || 'Check Firestore Rules'));
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product.id);
    setEditFormState({
      name: product.name,
      category: product.category,
      stock: product.stock,
      value: product.value,
      sourcingFrom: product.sourcingFrom || 'Various Origins, IND'
    });
  };

  const saveProductEdits = async (productId) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        name: editFormState.name,
        productDesignation: editFormState.name,
        category: editFormState.category,
        categoryClass: editFormState.category,
        stock: Number(editFormState.stock),
        availableStock: Number(editFormState.stock),
        value: editFormState.value,
        assetValuation: editFormState.value,
        sourcingFrom: editFormState.sourcingFrom,
        origin: editFormState.sourcingFrom
      });
      await logSystemActivity('UPDATE_PRODUCT', `Saved inline edits for product ID ${productId}`);
      setEditingProductId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductImageUpload = async (productId, file) => {
    if (!file) return;
    try {
      const base64Url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await updateDoc(doc(db, 'products', productId), { 
        imageUrl: base64Url,
        image: base64Url 
      });

      await logSystemActivity('IMAGE_UPLOAD', `Updated Base64 image asset for product ID ${productId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setMenuOpen(false);
    handleClearAllFilters();
    setExpandedOrderId(null);
    setExpandedEnquiryId(null);
    setSelectedProductIds([]);
    setEditingEnquiryId(null);
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    router.replace('/admin/login');
  };

  const renderStatusFilterBar = () => {
    const options = ['ALL', 'NEW', 'IN PROGRESS', 'PENDING', 'HIGH PRIORITY'];
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        {options.map(opt => {
          const isActive = statusFilter === opt;
          return (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              style={{
                background: isActive ? '#062313' : '#ffffff',
                color: isActive ? '#ffffff' : '#617568',
                border: '1px solid',
                borderColor: isActive ? '#062313' : '#e2e6e4',
                borderRadius: '100px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* 📱 TOP BAR */}
      <header className={styles.mobileNavBar}>
        <div className={styles.mobileLogo}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#062313', margin: 0 }}>Nelcyra Console</h2>
        </div>
        <button className={styles.menuToggleBtn} onClick={() => setMenuOpen(prev => !prev)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className={`${styles.sidebarOverlay} ${menuOpen ? styles.sidebarOverlayVisible : ''}`} onClick={() => setMenuOpen(false)}></div>

      {/* 🏛️ SIDEBAR */}
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
          <button className={activeTab === 'tracker' ? styles.activeNavBtn : styles.navBtn} onClick={() => handleTabChange('tracker')}>
            <Compass size={18} /> Tracking Portal
          </button>
        </nav>

        {/* RECENT ACTIVITY BUTTON */}
        <button 
          onClick={() => setIsAuditModalOpen(true)}
          style={{
            margin: '12px 0 8px 0', padding: '10px 16px', borderRadius: '100px',
            backgroundColor: '#ffffff', border: '1px solid #e2e6e4', color: '#062313',
            fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '8px'
          }}
        >
          <Activity size={16} style={{ color: '#038B45' }} /> Recent Activity ({activityLogs.length})
        </button>

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

      {/* 📊 MAIN WORKSPACE */}
      <main className={styles.workspace}>
        
        {/* VIEW 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <>
            <div className={styles.topActionBar}>
              <div>
                <h1>Overview</h1>
                {renderStatusFilterBar()}
              </div>
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
                <div className={styles.metricHeader}><span>Global Asset Value</span><DollarSign size={16} style={{ color: '#062313' }} /></div>
                <div className={styles.metricValue}>₹{(dynamicMetrics.globalValuation / 100000).toLocaleString('en-IN')}L</div>
                <div className={styles.metricSubtext}>Dynamic parsed summation</div>
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className={styles.flatContainerCard} style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#062313' }}>
                  <BarChart2 size={18} style={{ color: '#038B45' }} /> Top Destination Ports Demand
                </h3>
                {Object.keys(analyticsData.cityCounts).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#617568' }}>No destination records indexed.</p>
                ) : (
                  Object.entries(analyticsData.cityCounts).map(([city, count]) => {
                    const percent = Math.round((count / orders.length) * 100) || 0;
                    return (
                      <div key={city} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                          <span>{city}</span>
                          <span style={{ color: '#617568' }}>{count} ({percent}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#e2e6e4', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#038B45', transition: 'width 0.4s' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={styles.flatContainerCard} style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#062313' }}>
                  <PieChart size={18} style={{ color: '#16609C' }} /> Catalog Category Distribution
                </h3>
                {Object.keys(analyticsData.categoryCounts).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#617568' }}>No product categories found.</p>
                ) : (
                  Object.entries(analyticsData.categoryCounts).map(([cat, count]) => {
                    const percent = Math.round((count / products.length) * 100) || 0;
                    return (
                      <div key={cat} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                          <span>{cat}</span>
                          <span style={{ color: '#617568' }}>{count} items ({percent}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#e2e6e4', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#16609C', transition: 'width 0.4s' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

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

        {/* VIEW 2: ENQUIRIES WITH INLINE EDITING (FEATURE 1) & PROMOTION FIX (FEATURE 2) */}
        {activeTab === 'enquiries' && (
          <>
            <div className={styles.topActionBar}>
              <div>
                <h1>All Website Enquiries</h1>
                {renderStatusFilterBar()}
              </div>
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
                      <th style={{ width: '40px' }}></th>
                      <th>Tracking Code</th>
                      <th>Consignee Reference</th>
                      <th>Destination Hub</th>
                      <th>Volume Capacity</th>
                      <th>Operational Status</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const statusClass = order.status?.toLowerCase().replace(/\s+/g, '') || 'new';
                      const isExpanded = expandedEnquiryId === order.id;
                      const isEditingEnquiry = editingEnquiryId === order.id;

                      const customerPhone = order.customerPhone || order.phone || 'N/A';
                      const customerEmail = order.customerEmail || order.email || 'N/A';
                      const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A');
                      const fullAddress = order.address ? `${order.address}, ${order.city || ''}` : (order.city || 'N/A');

                      return (
                        <Fragment key={order.id}>
                          <tr 
                            onClick={() => setExpandedEnquiryId(isExpanded ? null : order.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td style={{ textAlign: 'center' }}>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              {order.trackingCode || order.id}
                            </td>
                            
                            <td style={{ fontWeight: '600' }}>
                              {isEditingEnquiry ? (
                                <input 
                                  type="text" 
                                  className={styles.searchInput} 
                                  style={{ padding: '4px 8px', fontSize: '0.85rem', margin: 0, width: '90%' }} 
                                  value={editEnquiryFormState.customerName} 
                                  onChange={(e) => setEditEnquiryFormState({ ...editEnquiryFormState, customerName: e.target.value })} 
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                order.customerName || 'Anonymous Lead'
                              )}
                            </td>

                            <td>
                              {isEditingEnquiry ? (
                                <input 
                                  type="text" 
                                  className={styles.searchInput} 
                                  style={{ padding: '4px 8px', fontSize: '0.85rem', margin: 0, width: '90%' }} 
                                  value={editEnquiryFormState.city} 
                                  onChange={(e) => setEditEnquiryFormState({ ...editEnquiryFormState, city: e.target.value })} 
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                order.city || 'Unassigned Port'
                              )}
                            </td>

                            <td>
                              {isEditingEnquiry ? (
                                <input 
                                  type="text" 
                                  className={styles.searchInput} 
                                  style={{ padding: '4px 8px', fontSize: '0.85rem', margin: 0, width: '90%' }} 
                                  value={editEnquiryFormState.globalQuantity} 
                                  onChange={(e) => setEditEnquiryFormState({ ...editEnquiryFormState, globalQuantity: e.target.value })} 
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                order.globalQuantity || 'Not Specified'
                              )}
                            </td>

                            <td>
                              <span onClick={(e) => { e.stopPropagation(); handleStatusCycle(order.id, order.status); }} className={`${styles.badgeFlat} ${styles[statusClass] || styles.new}`} style={{ cursor: 'pointer' }}>
                                {order.status || 'NEW'}
                              </span>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                {isEditingEnquiry ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); saveEnquiryEdits(order.id); }}
                                    style={{
                                      padding: '6px 12px', backgroundColor: '#038B45', color: '#fff',
                                      border: 'none', borderRadius: '100px', fontSize: '0.8rem',
                                      fontWeight: '600', cursor: 'pointer'
                                    }}
                                  >
                                    <Check size={14} /> Save
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); startEditingEnquiry(order); setExpandedEnquiryId(order.id); }}
                                    style={{ background: 'none', border: 'none', color: '#617568', cursor: 'pointer', padding: '4px' }}
                                    title="Edit Enquiry Details"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                )}

                                {order.status !== 'IN PROGRESS' && order.status !== 'DELIVERED' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConvertEnquiryToShipment(order);
                                    }}
                                    disabled={isConvertingEnquiry === order.id}
                                    style={{
                                      padding: '6px 14px', backgroundColor: '#038B45', color: '#fff',
                                      border: 'none', borderRadius: '100px', fontSize: '0.8rem',
                                      fontWeight: '600', cursor: 'pointer', display: 'inline-flex',
                                      alignItems: 'center', gap: '6px'
                                    }}
                                  >
                                    <ArrowRightCircle size={14} /> Promote
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDED LEAD EXECUTION METADATA BOX (IMAGE 2 MATCH) */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="7" style={{ padding: '0 24px 20px 24px', backgroundColor: '#fafbfa' }}>
                                <div style={{
                                  backgroundColor: '#ffffff', border: '1px solid #e2e6e4',
                                  borderRadius: '14px', padding: '20px 24px', marginTop: '6px',
                                  boxShadow: '0 4px 12px rgba(6, 35, 19, 0.03)'
                                }}>
                                  
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #edf2ef', paddingBottom: '14px', marginBottom: '16px' }}>
                                    <div>
                                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#062313', fontWeight: '700' }}>
                                        Lead Execution Metadata
                                      </h4>
                                      <span style={{ fontSize: '0.8rem', color: '#617568', fontWeight: '500' }}>
                                        Full Lead Information & Direct Dispatch Links
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                      {customerPhone !== 'N/A' && (
                                        <a
                                          href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            padding: '8px 16px', backgroundColor: '#25D366', color: '#ffffff',
                                            borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600',
                                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'
                                          }}
                                        >
                                          WhatsApp Chat
                                        </a>
                                      )}

                                      <button
                                        onClick={() => handleDispatchStatusEmail(order)}
                                        style={{
                                          padding: '8px 16px', backgroundColor: '#038B45', border: 'none',
                                          borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', color: '#ffffff',
                                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                      >
                                        <Send size={14} /> Send Email Update
                                      </button>
                                    </div>
                                  </div>

                                  {/* METADATA GRID DISPLAY WITH INLINE EDITING SUPPORT */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div style={{ backgroundColor: '#fafbfa', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e8ede9' }}>
                                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#617568', textTransform: 'uppercase' }}>
                                        Date & Timestamp Placed
                                      </span>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#062313', marginTop: '4px', display: 'block' }}>
                                        {formattedDate}
                                      </span>
                                    </div>

                                    <div style={{ backgroundColor: '#fafbfa', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e8ede9' }}>
                                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#617568', textTransform: 'uppercase' }}>
                                        WhatsApp Contact Number
                                      </span>
                                      {isEditingEnquiry ? (
                                        <input 
                                          type="tel" 
                                          className={styles.searchInput} 
                                          style={{ padding: '4px 8px', fontSize: '0.85rem', marginTop: '4px', width: '100%' }} 
                                          value={editEnquiryFormState.customerPhone} 
                                          onChange={(e) => setEditEnquiryFormState({ ...editEnquiryFormState, customerPhone: e.target.value })} 
                                        />
                                      ) : (
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#038B45', marginTop: '4px', display: 'block' }}>
                                          {customerPhone}
                                        </span>
                                      )}
                                    </div>

                                    <div style={{ backgroundColor: '#fafbfa', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e8ede9' }}>
                                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#617568', textTransform: 'uppercase' }}>
                                        Customer Email Address
                                      </span>
                                      {isEditingEnquiry ? (
                                        <input 
                                          type="email" 
                                          className={styles.searchInput} 
                                          style={{ padding: '4px 8px', fontSize: '0.85rem', marginTop: '4px', width: '100%' }} 
                                          value={editEnquiryFormState.customerEmail} 
                                          onChange={(e) => setEditEnquiryFormState({ ...editEnquiryFormState, customerEmail: e.target.value })} 
                                        />
                                      ) : (
                                        <a href={`mailto:${customerEmail}`} style={{ fontSize: '0.9rem', fontWeight: '700', color: '#038B45', marginTop: '4px', display: 'block', textDecoration: 'none' }}>
                                          {customerEmail}
                                        </a>
                                      )}
                                    </div>

                                    <div style={{ backgroundColor: '#fafbfa', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e8ede9' }}>
                                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#617568', textTransform: 'uppercase' }}>
                                        Delivery / Port Address
                                      </span>
                                      {isEditingEnquiry ? (
                                        <input 
                                          type="text" 
                                          className={styles.searchInput} 
                                          style={{ padding: '4px 8px', fontSize: '0.85rem', marginTop: '4px', width: '100%' }} 
                                          value={editEnquiryFormState.address} 
                                          onChange={(e) => setEditEnquiryFormState({ ...editEnquiryFormState, address: e.target.value })} 
                                        />
                                      ) : (
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#062313', marginTop: '4px', display: 'block' }}>
                                          {fullAddress}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* VIEW 3: PRODUCTS INVENTORY */}
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

            <div style={{
              display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center',
              backgroundColor: '#ffffff', border: '1px solid #e2e6e4', borderRadius: '12px',
              padding: '14px 20px', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#617568', fontSize: '0.85rem', fontWeight: '600' }}>
                <Filter size={14} /> Catalog Filters:
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#617568', fontWeight: '500' }}>Stock Status:</span>
                <select 
                  value={stockFilter} 
                  onChange={(e) => setStockFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '100px', border: '1px solid #e2e6e4', backgroundColor: '#fff', color: '#062313', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  <option value="ALL">Show All Stocks</option>
                  <option value="LOW_STOCK">Low Stocks (&lt; 5K Units)</option>
                  <option value="HIGH_STOCK">High Stocks (&gt;= 5K Units)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#617568', fontWeight: '500' }}>Asset Valuation:</span>
                <select 
                  value={valueTierFilter} 
                  onChange={(e) => setValueTierFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '100px', border: '1px solid #e2e6e4', backgroundColor: '#fff', color: '#062313', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  <option value="ALL">Show All Values</option>
                  <option value="HIGH_VALUE">High-End Tier (&gt;= ₹20L)</option>
                  <option value="BUDGET">Standard Tier (&lt; ₹20L)</option>
                </select>
              </div>

              {(stockFilter !== 'ALL' || valueTierFilter !== 'ALL') && (
                <button
                  onClick={handleClearAllFilters}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'none', border: 'none', color: '#e53e3e', fontSize: '0.85rem',
                    fontWeight: '600', cursor: 'pointer', padding: '4px 8px'
                  }}
                >
                  <RefreshCw size={12} /> Reset Filters
                </button>
              )}
            </div>

            {selectedProductIds.length > 0 && (
              <div style={{
                padding: '16px 24px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7',
                borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} style={{ color: '#e53e3e' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#742a2a' }}>
                    Batch Controls Activated: <strong>{selectedProductIds.length}</strong> items selected
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={handleExecuteBatchDelete}
                    disabled={isBatchUpdating}
                    style={{
                      padding: '8px 18px', backgroundColor: '#e53e3e', color: '#fff',
                      border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Trash2 size={14} /> {isBatchUpdating ? 'Purging Documents...' : 'Delete Selected'}
                  </button>
                  <button
                    onClick={() => setSelectedProductIds([])}
                    style={{ background: 'none', border: 'none', color: '#4a5568', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <div className={styles.flatContainerCard}>
              <div className={styles.cardTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3>Global Export Catalog</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#617568' }}>
                    Total Asset Valuation: <strong style={{ color: '#062313', fontSize: '1.05rem' }}>
                      ₹{filteredProducts
                        .reduce((acc, curr) => acc + parseAssetStringValue(curr.value), 0)
                        .toLocaleString('en-IN')}
                    </strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => exportDatasetToCSV('Catalog_Inventory', filteredProducts)}
                    style={{
                      padding: '10px 16px', borderRadius: '100px', backgroundColor: '#ffffff',
                      color: '#062313', border: '1px solid #e2e6e4', fontSize: '0.9rem',
                      fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button className={styles.newExportBtn} onClick={() => setIsProductModalOpen(true)} style={{ marginTop: 0, width: 'auto', padding: '10px 16px' }}>
                    <Package size={16} /> Add Product
                  </button>
                </div>
              </div>

              <div className={styles.tableResponsiveWrapper}>
                <table className={styles.flatTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', paddingLeft: '16px' }}>
                        <button 
                          onClick={handleToggleSelectAllProducts}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#617568' }}
                        >
                          {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                            <CheckSquare size={18} style={{ color: '#038B45' }} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
                      <th>PRODUCT PREVIEW</th>
                      <th>PRODUCT ID</th>
                      <th>PRODUCT DESIGNATION</th>
                      <th>CATEGORY</th>
                      <th>SOURCING FROM</th>
                      <th>ASSET VALUATION</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const isEditing = editingProductId === product.id;
                      const isSelected = selectedProductIds.includes(product.id);
                      
                      const renderValuationDisplay = (val) => {
                        if (!val) return '—';
                        return String(val).startsWith('₹') ? val : `₹${val}`;
                      };

                      return (
                        <tr key={product.id} style={{ backgroundColor: isSelected ? '#fffaf5' : 'transparent' }}>
                          <td style={{ paddingLeft: '16px', verticalAlign: 'middle' }}>
                            <button 
                              onClick={() => handleToggleProductSelection(product.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#617568' }}
                            >
                              {isSelected ? <CheckSquare size={18} style={{ color: '#038B45' }} /> : <Square size={18} />}
                            </button>
                          </td>
                          
                          <td>
                            <div style={{ position: 'relative', width: '46px', height: '46px', borderRadius: '6px', backgroundColor: '#f4f6f5', border: '1px solid #e2e6e4', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Package size={20} style={{ color: '#acb7b0' }} />
                              )}
                              
                              {/* INLINE UPLOAD OVERLAY WHEN EDITING */}
                              {isEditing && (
                                <label style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6, 35, 19, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                  <Upload size={16} />
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleProductImageUpload(product.id, e.target.files[0])} />
                                </label>
                              )}
                            </div>
                          </td>

                          <td style={{ color: '#617568', fontFamily: 'monospace' }}>{product.sku}</td>

                          <td>
                            {isEditing ? (
                              <input type="text" className={styles.searchInput} style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '90%' }} value={editFormState.name} onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: '600', color: '#062313' }}>{product.name || '—'}</span>
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input type="text" className={styles.searchInput} style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '90%' }} value={editFormState.category} onChange={(e) => setEditFormState({ ...editFormState, category: e.target.value })} />
                            ) : (
                              product.category || '—'
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input type="text" className={styles.searchInput} style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '120px' }} value={editFormState.sourcingFrom} onChange={(e) => setEditFormState({ ...editFormState, sourcingFrom: e.target.value })} />
                            ) : (
                              <span style={{ color: '#062313', fontWeight: '500' }}>{product.sourcingFrom || 'Various Origins, IND'}</span>
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input type="text" className={styles.searchInput} style={{ padding: '6px 10px', margin: 0, fontSize: '0.9rem', width: '85%' }} value={editFormState.value} onChange={(e) => setEditFormState({ ...editFormState, value: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: '600', color: '#062313' }}>{renderValuationDisplay(product.value)}</span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            {isEditing ? (
                              <button onClick={() => saveProductEdits(product.id)} style={{ background: 'none', border: 'none', color: '#038B45', cursor: 'pointer', padding: '6px' }}><Check size={18} /></button>
                            ) : (
                              <button onClick={() => startEditingProduct(product)} style={{ background: 'none', border: 'none', color: '#617568', cursor: 'pointer', padding: '6px', opacity: 0.7 }}><Edit2 size={16} /></button>
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
              <div>
                <h1>Cargo Freight Shipments</h1>
                {renderStatusFilterBar()}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => exportDatasetToCSV('Shipments_Manifest', filteredOrders)}
                  style={{
                    padding: '10px 16px', borderRadius: '100px', backgroundColor: '#ffffff',
                    color: '#062313', border: '1px solid #e2e6e4', fontSize: '0.9rem',
                    fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Download size={14} /> Export Manifest
                </button>
                <div className={styles.searchWrapper}>
                  <input type="text" placeholder="Search shipments..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                  <Search size={18} className={styles.searchIcon} />
                </div>
              </div>
            </div>

            <div className={styles.flatContainerCard}>
              <div className={styles.tableResponsiveWrapper}>
                <table className={styles.flatTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Tracking Code</th>
                      <th>Consignee</th>
                      <th>Destination</th>
                      <th>Transit Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const percentage = calculateProgress(order.pipeline);
                      const isExpanded = expandedOrderId === order.id;
                      const displayTrackingCode = order.trackingCode || order.id;

                      return (
                        <Fragment key={order.id}>
                          <tr onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} style={{ cursor: 'pointer' }}>
                            <td style={{ textAlign: 'center' }}>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{displayTrackingCode.slice(0, 12)}...</td>
                            <td style={{ fontWeight: '600', color: '#062313' }}>{order.customerName || 'Direct Logistics'}</td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#062313' }}><Anchor size={14} />{order.city || 'Sea Port'}</div></td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                                <div className={styles.sliderContainer} style={{ flex: 1, margin: 0, height: '6px', backgroundColor: '#e2e6e4', borderRadius: '100px', overflow: 'hidden' }}>
                                  <div className={styles.sliderFill} style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#038B45', transition: 'width 0.4s ease' }}></div>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#062313', width: '40px', textAlign: 'right' }}>{percentage}%</span>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan="5" style={{ padding: '0 24px 24px 24px', backgroundColor: '#fafbfa' }}>
                                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6e4', borderRadius: '12px', padding: '20px 24px', marginTop: '4px' }}>
                                  
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#617568' }}>
                                        Logistics Pipeline Route Execution
                                      </h4>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#617568', fontWeight: '600' }}>Full Tracking Code:</span>
                                        <code style={{ 
                                          fontFamily: 'monospace', 
                                          fontSize: '0.95rem', 
                                          fontWeight: '800', 
                                          color: '#038B45', 
                                          backgroundColor: '#f4faf7', 
                                          padding: '4px 10px', 
                                          borderRadius: '6px',
                                          border: '1px solid #d0e8dc',
                                          userSelect: 'all'
                                        }}>
                                          {displayTrackingCode}
                                        </code>
                                      </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                      <button
                                        onClick={() => handlePrintWaybill(order)}
                                        style={{
                                          padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #e2e6e4',
                                          borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600', color: '#062313',
                                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                      >
                                        <FileText size={14} style={{ color: '#038B45' }} /> Print Waybill PDF
                                      </button>

                                      <button
                                        onClick={() => handleDispatchStatusEmail(order)}
                                        style={{
                                          padding: '6px 12px', backgroundColor: '#038B45', border: 'none',
                                          borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600', color: '#ffffff',
                                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                      >
                                        <Send size={14} /> Notify Consignee Email
                                      </button>
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                    {(order.pipeline || []).map((step) => {
                                      const isEditingStep = editingStepId === step.id;

                                      return (
                                        <div 
                                          key={step.id} 
                                          style={{ 
                                            display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '12px', 
                                            padding: '12px 16px', borderRadius: '8px', border: '1px solid', 
                                            borderColor: step.checked ? '#d0e8dc' : '#e2e6e4', 
                                            backgroundColor: step.checked ? '#f4faf7' : '#ffffff'
                                          }}
                                        >
                                          <div 
                                            onClick={(e) => { e.stopPropagation(); handleTogglePipelineStep(order.id, order.pipeline, step.id); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                                          >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', borderColor: step.checked ? '#038B45' : '#acb7b0', backgroundColor: step.checked ? '#038B45' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              {step.checked && <Check size={14} strokeWidth={3} style={{ color: '#ffffff' }} />}
                                            </div>

                                            {isEditingStep ? (
                                              <input
                                                type="text"
                                                value={editStepLabel}
                                                onChange={(e) => setEditStepLabel(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e6e4', fontSize: '0.85rem', width: '100%' }}
                                              />
                                            ) : (
                                              <span style={{ fontSize: '0.85rem', fontWeight: step.checked ? '600' : '500', color: step.checked ? '#062313' : '#617568' }}>
                                                {step.label}
                                              </span>
                                            )}
                                          </div>

                                          <div style={{ display: 'flex', gap: '4px' }}>
                                            {isEditingStep ? (
                                              <button 
                                                onClick={() => handleSaveStepLabel(order.id, order.pipeline, step.id)}
                                                style={{ background: 'none', border: 'none', color: '#038B45', cursor: 'pointer', padding: '2px' }}
                                              >
                                                <Check size={16} />
                                              </button>
                                            ) : (
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingStepId(step.id); setEditStepLabel(step.label); }}
                                                style={{ background: 'none', border: 'none', color: '#617568', cursor: 'pointer', padding: '2px', opacity: 0.6 }}
                                              >
                                                <Edit2 size={14} />
                                              </button>
                                            )}
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleDeletePipelineStep(order.id, order.pipeline, step.id); }}
                                              style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '2px', opacity: 0.6 }}
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>

                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                                    <input
                                      type="text"
                                      placeholder="Add custom milestone step..."
                                      className={styles.searchInput}
                                      style={{ margin: 0, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '100px' }}
                                      value={newStepInput[order.id] || ''}
                                      onChange={(e) => setNewStepInput({ ...newStepInput, [order.id]: e.target.value })}
                                    />
                                    <button
                                      onClick={() => handleAddPipelineStep(order.id, order.pipeline)}
                                      style={{
                                        padding: '8px 16px', backgroundColor: '#062313', color: '#fff',
                                        border: 'none', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                                      }}
                                    >
                                      <PlusCircle size={14} /> Add Step
                                    </button>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* VIEW 5: ADMIN LIVE TRACKING PORTAL PREVIEW */}
        {activeTab === 'tracker' && (
          <>
            <div className={styles.topActionBar}>
              <h1>Public Customer Tracking Preview</h1>
              <div className={styles.searchWrapper}>
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID (e.g., NEL-MZQ35JCR) or Consignee..." 
                  className={styles.searchInput}
                  value={adminTrackCode}
                  onChange={(e) => setAdminTrackCode(e.target.value)}
                />
                <Search size={18} className={styles.searchIcon} />
              </div>
            </div>

            {selectedPreviewOrder ? (
              <div className={styles.flatContainerCard} style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e6e4', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#038B45', textTransform: 'uppercase' }}>WAYBILL REFERENCE</span>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontFamily: 'monospace', color: '#038B45', fontWeight: '800' }}>
                      {selectedPreviewOrder.trackingCode || selectedPreviewOrder.id}
                    </h2>
                  </div>
                  <span style={{ padding: '6px 16px', backgroundColor: '#f4faf7', border: '1px solid #d0e8dc', borderRadius: '100px', color: '#038B45', fontWeight: '700', fontSize: '0.85rem' }}>
                    {selectedPreviewOrder.status || 'IN TRANSIT'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fafbfa', borderRadius: '8px', border: '1px solid #e2e6e4' }}>
                    <div style={{ fontSize: '0.75rem', color: '#617568', fontWeight: '700' }}>CONSIGNEE</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#062313', marginTop: '4px' }}>{selectedPreviewOrder.customerName || 'Direct Logistics'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#fafbfa', borderRadius: '8px', border: '1px solid #e2e6e4' }}>
                    <div style={{ fontSize: '0.75rem', color: '#617568', fontWeight: '700' }}>DESTINATION PORT</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#062313', marginTop: '4px' }}>{selectedPreviewOrder.city || 'Global Hub'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#fafbfa', borderRadius: '8px', border: '1px solid #e2e6e4' }}>
                    <div style={{ fontSize: '0.75rem', color: '#617568', fontWeight: '700' }}>PROGRESS</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#038B45', marginTop: '4px' }}>{calculateProgress(selectedPreviewOrder.pipeline)}%</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#617568', marginBottom: '16px' }}>PUBLIC MILESTONES STREAM</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selectedPreviewOrder.pipeline || []).map((step) => (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: '1px solid', borderColor: step.checked ? '#d0e8dc' : '#e2e6e4', backgroundColor: step.checked ? '#f4faf7' : '#ffffff' }}>
                      {step.checked ? <CheckCircle2 size={20} style={{ color: '#038B45' }} /> : <Circle size={20} style={{ color: '#acb7b0' }} />}
                      <span style={{ fontSize: '0.9rem', fontWeight: step.checked ? '700' : '500', color: step.checked ? '#062313' : '#617568' }}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.flatContainerCard} style={{ padding: '48px', textAlign: 'center', color: '#617568' }}>
                No order matched the entered tracking query.
              </div>
            )}
          </>
        )}

      </main>

      {/* RECENT ACTIVITY MODAL WITH CLEAR ALL BUTTON */}
      {isAuditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 35, 19, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', border: '1px solid #e2e6e4', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#062313', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: '#038B45' }} /> Recent Activity
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {activityLogs.length > 0 && (
                  <button
                    onClick={handleClearAllActivityLogs}
                    style={{
                      padding: '6px 14px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7',
                      borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600', color: '#e53e3e',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <Trash2 size={13} /> Clear All
                  </button>
                )}
                <button onClick={() => setIsAuditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#617568' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
              {activityLogs.length === 0 ? (
                <p style={{ color: '#617568', textAlign: 'center', padding: '32px 0', fontSize: '0.9rem' }}>No recent activity records logged.</p>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} style={{ padding: '12px 16px', backgroundColor: '#fafbfa', border: '1px solid #e2e6e4', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#038B45', textTransform: 'uppercase' }}>{log.action}</span>
                      <span style={{ fontSize: '0.75rem', color: '#acb7b0' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#062313', fontWeight: '500' }}>{log.details}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* EXPORT MODAL WITH ENHANCED CUSTOMER FIELDS */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 35, 19, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '32px', border: '1px solid #e2e6e4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#062313', fontWeight: '700' }}>Initialize Freight Export</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#617568' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateExport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Consignee / Client Name</label>
                <input type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} placeholder="Enter client or business name" value={newExportForm.customerName} onChange={(e) => setNewExportForm({ ...newExportForm, customerName: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Customer Email Address</label>
                  <input type="email" className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} placeholder="client@company.com" value={newExportForm.customerEmail} onChange={(e) => setNewExportForm({ ...newExportForm, customerEmail: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>WhatsApp Number</label>
                  <input type="tel" className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} placeholder="Ex: 919876543210" value={newExportForm.customerPhone} onChange={(e) => setNewExportForm({ ...newExportForm, customerPhone: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Destination City / Port Hub</label>
                <input type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} placeholder="Ex: Port of Long Beach, USA" value={newExportForm.city} onChange={(e) => setNewExportForm({ ...newExportForm, city: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Detailed Delivery Address</label>
                <input type="text" className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} placeholder="Building / Industrial Zone / Street details" value={newExportForm.address} onChange={(e) => setNewExportForm({ ...newExportForm, address: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#617568', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 28px', backgroundColor: '#416c54', color: '#ffffff', borderRadius: '100px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Deploy Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL WITH SOURCING FROM ATTRIBUTE */}
      {isProductModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 35, 19, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '32px', border: '1px solid #e2e6e4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#062313', fontWeight: '700' }}>Index Catalog Product</h3>
              <button onClick={() => { setIsProductModalOpen(false); setProductImageFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#617568' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Product Designation Name</label>
                <input type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} value={newProductForm.name} onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Category Classification Class</label>
                <input type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} value={newProductForm.category} onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Sourcing From / Origin Location</label>
                <input type="text" placeholder="Ex: Kerala, IND or Nizamabad, IND" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} value={newProductForm.sourcingFrom} onChange={(e) => setNewProductForm({ ...newProductForm, sourcingFrom: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Available Stock Units</label>
                  <input type="number" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} value={newProductForm.stock} onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Valuation (Auto ₹)</label>
                  <input type="text" required className={styles.searchInput} style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} value={newProductForm.value} onChange={(e) => setNewProductForm({ ...newProductForm, value: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>Image File Asset (.JPG, .PNG, .WEBP)</label>
                <div style={{ border: '2px dashed #e2e6e4', borderRadius: '12px', padding: '16px', textAlign: 'center', backgroundColor: '#fafbfa', position: 'relative', cursor: 'pointer' }}>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.name.toLowerCase().endsWith('.heic')) {
                        alert("⚠️ .HEIC image formats are not supported by web browsers. Please select a JPG, PNG, or WEBP image instead.");
                        return;
                      }
                      setProductImageFile(file);
                    }} 
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  />
                  <Upload size={22} style={{ color: '#038B45', marginBottom: '4px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#062313', fontWeight: '600' }}>
                    {productImageFile ? productImageFile.name : "Click to select or drop image from computer"}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#617568', marginBottom: '4px' }}>OR Direct Image URL / Path (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Ex: /products/cardamom.jpg or https://..." 
                  className={styles.searchInput} 
                  style={{ width: '100%', margin: 0, padding: '10px 14px', borderRadius: '100px' }} 
                  value={newProductForm.imageUrl || ''} 
                  onChange={(e) => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setIsProductModalOpen(false); setProductImageFile(null); }} style={{ background: 'none', border: 'none', color: '#617568', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isCreatingProduct} style={{ padding: '12px 28px', backgroundColor: '#416c54', color: '#ffffff', borderRadius: '100px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                  {isCreatingProduct ? 'Encoding & Saving...' : 'Commit Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}