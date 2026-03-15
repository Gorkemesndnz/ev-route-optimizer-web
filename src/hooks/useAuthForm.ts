import { useState, useEffect } from "react";
import { translations } from "../lib/translations";

const MOCK_USER = {
  email: 'admin@iyontree.com',
  password: '1234',
  firstName: 'admin',
  lastName: 'admin',
  phone: '(111) 111-11-11'
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthStep = 'email' | 'password' | 'register' | 'verify_email' | 'reset_password';

export function useAuthForm(language: 'tr' | 'en' = 'tr', onLogin?: (user: any) => void, onClose?: () => void) {
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (authStep !== 'verify_email' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [authStep, timeLeft]);

  const resetForm = () => {
    setAuthStep('email');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setOtp('');
    setTimeLeft(120);
    setOtpError('');
    setAuthError('');
  };

  const handleEmailSubmit = () => {
    setAuthError('');
    if (!email) return;

    if (!emailRegex.test(email)) {
      setAuthError(language === 'tr' ? 'Lütfen geçerli bir e-posta girin.' : 'Please enter a valid email.');
      return;
    }

    if (email.toLowerCase() === MOCK_USER.email) {
      setAuthStep('password');
    } else {
      setAuthStep('register');
    }
  };

  const handlePasswordSubmit = () => {
    if (password === MOCK_USER.password) {
      setAuthError('');
      alert(language === 'tr' ? "Başarılı Giriş Yapıldı: " + email : "Successful Login: " + email);
      if (onLogin) onLogin(MOCK_USER);
      if (onClose) onClose();
    } else {
      setAuthError(language === 'tr' ? "Girdiğiniz şifre hatalı." : "Incorrect password.");
    }
  };

  const handleOtpChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (cleanVal.length <= 6) {
      setOtp(cleanVal);
      setOtpError('');

      if (cleanVal.length === 6) {
        if (cleanVal === '111111') {
          setOtpError('');
          setAuthStep('reset_password');
        } else {
          setOtpError(language === 'tr' ? 'Hatalı doğrulama kodu.' : 'Invalid verification code.');
        }
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(120);
    setOtp('');
    setOtpError('');
  };

  const handleGoToVerify = () => {
    setAuthStep('verify_email');
    setTimeLeft(120);
    setOtp('');
    setOtpError('');
    setAuthError('');
  };

  const isPasswordsMatch = password === confirmPassword;

  return {
    authStep,
    setAuthStep,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    authError,
    setAuthError,
    otp,
    setOtp,
    timeLeft,
    otpError,
    resetForm,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleOtpChange,
    handleResend,
    handleGoToVerify,
    isPasswordsMatch
  };
}
