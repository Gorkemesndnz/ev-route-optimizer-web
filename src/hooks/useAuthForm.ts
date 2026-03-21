import { useState, useEffect } from "react";
import { translations } from "../lib/translations";
import { useSettings } from "../contexts/SettingsContext";
import { loginSchema, registerSchema, resetPasswordSchema } from "../lib/validation";
import { z } from "zod";

const API_URL = "http://localhost:5146/api/auth";

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

  const handleEmailSubmit = async () => {
    setAuthError('');
    setFieldErrors({});
    if (!email) return;

    try {
      z.object({ email: z.string().email() }).parse({ email });
    } catch (err) {
      setAuthError(language === 'tr' ? 'Lütfen geçerli bir e-posta girin format hatası.' : 'Please enter a valid email format.');
      return;
    }
      
    try {
      const response = await fetch(`${API_URL}/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (data.success && data.data.exists) {
        setAuthStep('password');
      } else {
        setAuthStep('register');
      }
    } catch (err) {
      console.error("API Error in check-email:", err);
      setAuthError(language === 'tr' ? 'Sunucuya bağlanılamadı. Lütfen API nin çalıştığından emin olun.' : 'Cannot connect to server.');
    }
  };

  const handlePasswordSubmit = async () => {
    setAuthError('');
    setFieldErrors({});
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setAuthError(result.error.issues[0].message);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        if (onLogin) onLogin(data.data);
        if (onClose) onClose();
      } else {
        setAuthError(data.error || (language === 'tr' ? "Girdiğiniz şifre hatalı." : "Incorrect password."));
      }
    } catch (error) {
      setAuthError(language === 'tr' ? "Sunucuya bağlanılamadı." : "Cannot connect to server.");
    }
  };

  const handleRegisterSubmit = async () => {
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

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber: phone, password })
      });
      const data = await response.json();

      if (data.success) {
        // Log user in automatically after registration
        handlePasswordSubmit();
      } else {
        setAuthError(data.error || (language === 'tr' ? "Kayıt olurken bir hata oluştu." : "Registration error."));
      }
    } catch (error) {
      setAuthError(language === 'tr' ? "Sunucu hatası." : "Server error.");
    }
  };

  const handleOtpChange = async (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (cleanVal.length > 6) return;
    
    setOtp(cleanVal);
    setOtpError('');

    if (cleanVal.length === 6) {
      try {
        const response = await fetch(`${API_URL}/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: cleanVal })
        });
        const data = await response.json();

        if (data.success) {
          setOtpError('');
          setAuthStep('reset_password');
        } else {
          setOtpError(data.error || (language === 'tr' ? 'Hatalı doğrulama kodu.' : 'Invalid verification code.'));
        }
      } catch (err) {
        setOtpError(language === 'tr' ? "Sunucuya bağlanılamadı." : "Cannot connect to server.");
      }
    }
  };

  const handleResend = async () => {
    setTimeLeft(120);
    setOtp('');
    setOtpError('');
    await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
  };

  const handleGoToVerify = async () => {
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (data.success) {
          setAuthStep('verify_email');
          setTimeLeft(120);
          setOtp('');
          setOtpError('');
      } else {
          setAuthError(data.error || "Kullanıcı bulunamadı.");
      }
    } catch (err) {
      setAuthError("Sunucu hatası.");
    }
  };

  const handleResetPasswordSubmit = async () => {
      setAuthError('');
      const result = resetPasswordSchema.safeParse({ password, confirmPassword });
      
      if (!result.success) {
          let errorMsg = result.error.issues[0].message;
          setAuthError(errorMsg);
          return false;
      }
      
      try {
          const response = await fetch(`${API_URL}/reset-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, code: otp, newPassword: password })
          });
          const data = await response.json();
          
          if (data.success) {
              handlePasswordSubmit();
              return true;
          } else {
              setAuthError(data.error);
              return false;
          }
      } catch (e) {
          setAuthError("Sunucu hatası");
          return false;
      }
  };

  const isPasswordsMatch = password === confirmPassword && password.length >= 8;

  return {
    authStep, setAuthStep, email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword, firstName, setFirstName,
    lastName, setLastName, phone, setPhone, authError, setAuthError,
    otp, setOtp, timeLeft, otpError, resetForm, handleEmailSubmit,
    handlePasswordSubmit, handleOtpChange, handleResend, handleGoToVerify,
    isPasswordsMatch, fieldErrors, handleRegisterSubmit, handleResetPasswordSubmit
  };
}
