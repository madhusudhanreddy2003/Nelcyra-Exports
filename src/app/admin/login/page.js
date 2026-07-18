// src/app/admin/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { Mail, Lock, ShieldCheck, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import styles from '../../../styles/AdminLogin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // Login Steps: 1 = Email & Password Verification, 2 = Custom OTP Challenge
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Verify standard admin credentials and trigger custom OTP email
  const handleCredentialCheck = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Strict client control ensuring only the authorized domain email tries verification
    const targetAdminEmail = 'sales@nelcyraexports.com';
    if (email.trim().toLowerCase() !== targetAdminEmail) {
      setError('Access Denied. Unauthorized administrative account email.');
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate with standard Firebase Email/Password security keys
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Generate a secure, pseudo-random 6-digit OTP code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expirationTime = Date.now() + 5 * 60 * 1000; // Code is active for 5 minutes only

      // 3. Write OTP details into a strictly protected secure metadata document in Firestore
      await setDoc(doc(db, 'admin_security', 'otp_challenge'), {
        code: generatedOtp,
        expiresAt: expirationTime,
        uid: userCredential.user.uid
      });

// PASTE THIS NEW API ROUTE HOOK INSTEAD:
const response = await fetch('/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: targetAdminEmail, otp: generatedOtp }),
});

const result = await response.json();
if (!result.success) {
  throw new Error('SMTP Dispatch engine failed');
}

      // Transition screen state safely
      setStep(2);

    } catch (err) {
      console.error("Auth credential error:", err);
      setError('Invalid email or password combination. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Intercept and check user input against current Firestore transaction validation document
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const challengeRef = doc(db, 'admin_security', 'otp_challenge');
      const challengeDoc = await getDoc(challengeRef);

      if (!challengeDoc.exists()) {
        setError('Verification challenge missing. Please re-enter credentials.');
        setStep(1);
        setLoading(false);
        return;
      }

      const { code, expiresAt } = challengeDoc.data();

      // Check for code expiration first
      if (Date.now() > expiresAt) {
        setError('Verification challenge expired. Please click back to re-send code.');
        setLoading(false);
        return;
      }

      // Check if input matches
      if (otpInput.trim() !== code) {
        setError('Incorrect validation security code. Access declined.');
        setLoading(false);
        return;
      }

      // Explicit authentication confirmation mapping inside safe memory storage
      sessionStorage.setItem('admin_mfa_authorized', 'true');

      // Clear the used dynamic OTP immediately for maximum security
      await setDoc(challengeRef, { code: '', expiresAt: 0, uid: '' }, { merge: true });

      // Direct redirection onto the administrative control module panel
      router.push('/admin');

    } catch (err) {
      console.error("MFA verification error:", err);
      setError('A database routing error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        
        <div className={styles.headerBlock}>
          <h1 className={styles.brandTitle}>Nelcyra</h1>
          <p className={styles.brandSubtitle}>Administrative Terminal</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {step === 1 ? (
          // STEP 1: Main Credential Screen
          <form onSubmit={handleCredentialCheck} className={styles.formStructure}>
            
            <div className={styles.inputGroup}>
              <label>System Email Address</label>
              <div className={styles.inputFieldWrapper}>
                <input 
                  type="email" 
                  placeholder="sales@nelcyraexports.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputStructure}
                  required
                />
                <Mail className={styles.inputIcon} size={18} strokeWidth={2} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Administrative Password</label>
              <div className={styles.inputFieldWrapper}>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputStructure}
                  required
                />
                <Lock className={styles.inputIcon} size={18} strokeWidth={2} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.actionBtn}>
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ShieldCheck size={18} strokeWidth={2} />
                  Initiate Secure Login
                </>
              )}
            </button>

          </form>
        ) : (
          // STEP 2: Custom Multi-Factor OTP Input Verification
          <form onSubmit={handleOtpVerification} className={styles.formStructure}>
            
            <div className={styles.otpGroup}>
              <div className={styles.inputGroup} style={{ width: '100%' }}>
                <label>Verification Code (OTP)</label>
                <div className={styles.inputFieldWrapper}>
                  <input 
                    type="text" 
                    placeholder="000000" 
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`${styles.inputStructure} ${styles.otpInput}`}
                    required
                  />
                  <KeyRound className={styles.inputIcon} size={18} strokeWidth={2} />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#728178', textAlign: 'center' }}>
                We sent a 6-digit confirmation code to <br />
                <strong>sales@nelcyraexports.com</strong>.
              </p>
            </div>

            <button type="submit" disabled={loading} className={styles.actionBtn}>
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ShieldCheck size={18} strokeWidth={2} />
                  Verify & Enter
                </>
              )}
            </button>

            <span 
              onClick={() => { setStep(1); setError(''); setOtpInput(''); }} 
              className={styles.backLink}
            >
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Return to Credentials Screen
            </span>

          </form>
        )}

      </div>
    </div>
  );
}