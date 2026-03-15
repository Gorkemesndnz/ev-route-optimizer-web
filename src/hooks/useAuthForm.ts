import { useState, useEffect } from "react";
import { translations } from "../lib/translations";

const MOCK_USER = {
  email: 'admin@iyontree.com',
  password: '1234',
  firstName: 'admin',
  lastName: 'admin',
  phone: '(111) 111-11-11'
};

import { useSettings } from "../contexts/SettingsContext";
import { loginSchema, registerSchema } from "../lib/validation";
import { z } from "zod";

export type AuthStep = 'email' | 'password' | 'register' | 'verify_email' | 'reset_password';

export function useAuthForm(onLogin?: (user: any) => void, onClose?: () => void) {
  const { language } = useSettings();
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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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
    setFieldErrors({});
    if (!email) return;

    try {
      z.object({ email: z.string().email() }).parse({ email });
      if (email.toLowerCase() === MOCK_USER.email) {
        setAuthStep('password');
      } else {
        setAuthStep('register');
      }
    } catch (err) {
      setAuthError(language === 'tr' ? 'Lütfen geçerli bir e-posta girin.' : 'Please enter a valid email.');
    }
  };

  const handlePasswordSubmit = () => {
    setAuthError('');
    setFieldErrors({});
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setAuthError(result.error.issues[0].message);
      return;
    }

    if (password === MOCK_USER.password) {
      if (onLogin) onLogin(MOCK_USER);
      if (onClose) onClose();
    } else {
      setAuthError(language === 'tr' ? "Girdiğiniz şifre hatalı." : "Incorrect password.");
    }
  };

  const handleRegisterSubmit = () => {
    setFieldErrors({});
    setAuthError('');
    
    const result = registerSchema.safeParse({
      email, firstName, lastName, phone, password, confirmPassword
    });

    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message;
      });
      setFieldErrors(newErrors);
      return;
    }

    if (onLogin) onLogin({ email, firstName, lastName, phone });
    handleCloseToModal();
  };

  const handleCloseToModal = () => {
    if (onClose) onClose();
    resetForm();
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
    isPasswordsMatch,
    fieldErrors,
    handleRegisterSubmit
  };
}
