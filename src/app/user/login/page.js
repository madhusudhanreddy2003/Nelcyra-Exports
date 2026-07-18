// src/app/user/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, initRecaptcha } from '../../../lib/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';
import { Phone, KeyRound, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import styles from '../../../styles/UserLogin.module.css';

export default function UserLoginPage() {
  const router = useRouter();

  // Step 1: Input Mobile Number, Step 2: Verify SMS OTP Code
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpInput, setOtpInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Initialize the invisible recaptcha verification container on component mount
  useEffect(() => {
    initRecaptcha('recaptcha-container');
  }, []);

  // Step 1: Format mobile number and request Firebase to send verification SMS
  const handleRequestSms = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Format phone to E.164 international standard (e.g., +919876543210)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      // Default to India prefix (+91) if not explicitly supplied
      formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
    }

    if (formattedPhone.length < 12) {
      setError('Please enter a valid mobile number with country code.');
      setLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      
      // Request SMS OTP code from Firebase
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      
      // Transition form step
      setStep(2);
    } catch (err) {
      console.error("SMS Request Error:", err);
      setError('Failed to send verification SMS. Verify network/format and try again.');
      // Reset reCAPTCHA container to allow re-verification attempts
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        initRecaptcha('recaptcha-container');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit and verify OTP code directly with Firebase
  const handleVerifySmsCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!confirmationResult) {
      setError('Session expired. Please request a new verification code.');
      setStep(1);
      setLoading(false);
      return;
    }

    try {
      // Verify OTP code
      const result = await confirmationResult.confirm(otpInput.trim());
      
      // Firebase automatically signs in the user globally.
      // Store user validation states locally in memory and proceed to dashboard.
      sessionStorage.setItem('user_session_active', 'true');
      sessionStorage.setItem('user_phone_anchor', result.user.phoneNumber);
      
      router.push('/user');
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError('Incorrect or expired SMS verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Invisible reCAPTCHA Anchor required by Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className={styles.loginCard}>
        
        <div className={styles.headerBlock}>
          <h1 className={styles.brandTitle}>Nelcyra</h1>
          <p className={styles.brandSubtitle}>Consignee Tracking Portal</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {step === 1 ? (
          // STEP 1: Phone Entry Screen
          <form onSubmit={handleRequestSms} className={styles.formStructure}>
            
            <div className={styles.inputGroup}>
              <label>Registered Phone Number</label>
              <div className={styles.inputFieldWrapper}>
                <input 
                  type="tel" 
                  placeholder="Enter Mobile (Ex: +91 9876543210)" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={styles.inputStructure}
                  required
                />
                <Phone className={styles.inputIcon} size={18} strokeWidth={2} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.actionBtn}>
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ShieldCheck size={18} strokeWidth={2} />
                  Request OTP SMS
                </>
              )}
            </button>

          </form>
        ) : (
          // STEP 2: SMS OTP Verification Screen
          <form onSubmit={handleVerifySmsCode} className={styles.formStructure}>
            
            <div className={styles.otpGroup}>
              <div className={styles.inputGroup} style={{ width: '100%' }}>
                <label>SMS Verification Code</label>
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
                Enter the 6-digit verification code sent to your mobile device.
              </p>
            </div>

            <button type="submit" disabled={loading} className={styles.actionBtn}>
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ShieldCheck size={18} strokeWidth={2} />
                  Verify OTP
                </>
              )}
            </button>

            <span 
              onClick={() => { setStep(1); setError(''); setOtpInput(''); }} 
              className={styles.backLink}
            >
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Request New Code
            </span>

          </form>
        )}

      </div>
    </div>
  );
}