import { useState, useEffect, useRef } from "react";
import { translations } from "../lib/translations";
import { useSettings } from "../contexts/SettingsContext";
import { loginSchema, registerSchema, resetPasswordSchema } from "../lib/validation";
import { z } from "zod";
import { apiClient } from "../lib/apiClient";

const API_URL = "http://localhost:5146/api/auth";

export type AuthStep = 'email' | 'password' | 'register' | 'verify_email' | 'reset_password';

const formatError = (error: any, defaultMsg: string): string => {
  if (!error) return defaultMsg;
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    if (error.errors && typeof error.errors === 'object' && !Array.isArray(error.errors)) {
      const details = Object.values(error.errors).flat().join('\n');
      if (details) return details;
    }
    if (error.message) return typeof error.message === 'string' ? error.message : defaultMsg;
  }
  return defaultMsg;
};

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
  const [verificationType, setVerificationType] = useState<'register' | 'reset'>('reset');
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

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

  const handleEmailSubmit = async () => {
    if (isLoading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);

    setAuthError('');
    setAuthError('');
    setFieldErrors({});
    if (!email) {
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }

    try {
      z.object({ email: z.string().email() }).parse({ email });    } catch (err) {
      setAuthError(language === 'tr' ? 'Lütfen geçerli bir e-posta girin format hatası.' : 'Please enter a valid email format.');
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }
      
    setIsLoading(true);
    try {
      const response = await apiClient('/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (data.success) {
        if (data.data.exists) {
          setAuthStep('password');
        } else {
          setAuthStep('register');
        }
      } else {
        setAuthError(formatError(data.error, language === 'tr' ? 'Lütfen geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.'));
      }
    } catch (err) {
      console.error("API Error in check-email:", err);
      setAuthError(language === 'tr' ? 'Sunucuya bağlanılamadı. Lütfen API nin çalıştığından emin olun.' : 'Cannot connect to server.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handlePasswordSubmit = async () => {
    if (isLoading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    setAuthError('');
    setFieldErrors({});
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setAuthError(result.error.issues[0].message);
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        if (data.data.refreshToken) {
           localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        resetForm();
        if (onLogin) onLogin(data.data);
        if (onClose) onClose();
      } else {
        setAuthError(formatError(data.error, language === 'tr' ? "Girdiğiniz şifre hatalı." : "Incorrect password."));
      }
    } catch (error) {
      setAuthError(language === 'tr' ? "Sunucuya bağlanılamadı." : "Cannot connect to server.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleRegisterSubmit = async () => {
    if (isLoading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
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
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const response = await apiClient('/auth/register', {
        method: 'POST',
        body: { firstName, lastName, email, phoneNumber: cleanPhone, password }
      });
      const data = await response.json();

      if (data.success) {
        setVerificationType('register');
        setAuthStep('verify_email');
        setTimeLeft(120);
        setOtp('');
      } else {
        setAuthError(formatError(data.error, language === 'tr' ? "Kayıt olurken bir hata oluştu." : "Registration error."));
      }
    } catch (error) {
      setAuthError(language === 'tr' ? "Sunucu hatası." : "Server error.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleOtpChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanVal);
    setOtpError('');
  };

  const handleVerifySubmit = async () => {
    if (isLoading || isSubmittingRef.current || otp.length !== 6) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      const endpoint = verificationType === 'register' ? 'verify-registration' : 'verify-code';
      const response = await apiClient(`/auth/${endpoint}`, {
          method: 'POST',
          body: { email, code: otp }
      });
      const data = await response.json();

      if (data.success) {
        setOtpError('');
        if (verificationType === 'register') {
          // Registration complete, log user in
          localStorage.setItem('token', data.data.token);
          if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
          const clonedData = { ...data.data };
          resetForm();
          if (onLogin) onLogin(clonedData);
          if (onClose) onClose();
        } else {
          setPassword('');
          setConfirmPassword('');
          setAuthError('');
          setAuthStep('reset_password');
        }
      } else {
        setOtpError(formatError(data.error, language === 'tr' ? 'Hatalı doğrulama kodu.' : 'Invalid verification code.'));
      }
    } catch (err) {
      setOtpError(language === 'tr' ? "Sunucuya bağlanılamadı." : "Cannot connect to server.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResend = async () => {
    setOtp('');
    setOtpError('');
    try {
      const endpoint = verificationType === 'register' ? 'register' : 'forgot-password';
      
      let bodyData: any = { email };
      if (verificationType === 'register') {
        bodyData = { firstName, lastName, email, phoneNumber: phone.replace(/\D/g, ''), password };
      }

      await apiClient(`/auth/${endpoint}`, {
          method: 'POST',
          body: bodyData
      });
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleGoToVerify = async () => {
    if (isLoading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      const response = await apiClient('/auth/forgot-password', {
          method: 'POST',
          body: { email }
      });
      const data = await response.json();
      
      if (data.success) {
          setVerificationType('reset');
          setAuthStep('verify_email');
          setTimeLeft(120);
          setOtp('');
          setOtpError('');
      } else {
          setAuthError(formatError(data.error, language === 'tr' ? "Kullanıcı bulunamadı." : "User not found."));
      }
    } catch (err) {
      setAuthError("Sunucu hatası.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResetPasswordSubmit = async () => {
      if (isLoading || isSubmittingRef.current) return false;
      isSubmittingRef.current = true;
      setIsLoading(true);
      setAuthError('');
      const result = resetPasswordSchema.safeParse({ password, confirmPassword });
      
      if (!result.success) {
          let errorMsg = result.error.issues[0].message;
          setAuthError(errorMsg);
          setIsLoading(false);
          isSubmittingRef.current = false;
          return false;
      }
      
      setIsLoading(true);
      try {
          const response = await apiClient('/auth/reset-password', {
              method: 'POST',
              body: { email, code: otp, newPassword: password }
          });
          const data = await response.json();
          
          if (data.success) {
              setAuthError('');
              // Show success message briefly before redirecting or closing
              alert(language === 'tr' ? "Şifreniz başarıyla yenilendi!" : "Password successfully reset!");
              
              isSubmittingRef.current = false;
              setIsLoading(false);
              handlePasswordSubmit();
              return true;
          } else {
              setAuthError(formatError(data.error, language === 'tr' ? "Sıfırlama başarısız." : "Reset failed."));
              return false;
          }
      } catch (e) {
          setAuthError(language === 'tr' ? "Sunucu hatası" : "Server error");
          return false;
      } finally {
          setIsLoading(false);
          isSubmittingRef.current = false;
      }
  };

  const isPasswordsMatch = password === confirmPassword && password.length >= 8;

  return {
    authStep, setAuthStep, email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword, firstName, setFirstName,
    lastName, setLastName, phone, setPhone, authError, setAuthError,
    otp, setOtp, timeLeft, otpError, resetForm, handleEmailSubmit,
    handlePasswordSubmit, handleOtpChange, handleResend, handleGoToVerify,
    isPasswordsMatch, fieldErrors, handleRegisterSubmit, handleResetPasswordSubmit,
    verificationType, handleVerifySubmit, isLoading
  };
}
