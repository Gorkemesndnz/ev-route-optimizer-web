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
  const [verificationType, setVerificationType] = useState<'register' | 'reset'>('reset');
  const [isLoading, setIsLoading] = useState(false);

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
    if (isLoading) return;
    setAuthError('');
    setFieldErrors({});
    if (!email) return;

    try {
      z.object({ email: z.string().email() }).parse({ email });
    } catch (err) {
      setAuthError(language === 'tr' ? 'Lütfen geçerli bir e-posta girin format hatası.' : 'Please enter a valid email format.');
      return;
    }
      
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/check-email`, {
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
        setAuthError(data.error || (language === 'tr' ? 'Lütfen geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.'));
      }
    } catch (err) {
      console.error("API Error in check-email:", err);
      setAuthError(language === 'tr' ? 'Sunucuya bağlanılamadı. Lütfen API nin çalıştığından emin olun.' : 'Cannot connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (isLoading) return;
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (isLoading) return;
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

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber: phone, password })
      });
      const data = await response.json();

      if (data.success) {
        setVerificationType('register');
        setAuthStep('verify_email');
        setTimeLeft(120);
        setOtp('');
      } else {
        setAuthError(data.error || (language === 'tr' ? "Kayıt olurken bir hata oluştu." : "Registration error."));
      }
    } catch (error) {
      setAuthError(language === 'tr' ? "Sunucu hatası." : "Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanVal);
    setOtpError('');
  };

  const handleVerifySubmit = async () => {
    if (isLoading || otp.length !== 6) return;
    
    setIsLoading(true);
    try {
      const endpoint = verificationType === 'register' ? 'verify-registration' : 'verify-code';
      const response = await fetch(`${API_URL}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: otp })
      });
      const data = await response.json();

      if (data.success) {
        setOtpError('');
        if (verificationType === 'register') {
          // Registration complete, log user in
          localStorage.setItem('token', data.data.token);
          if (onLogin) onLogin(data.data);
          if (onClose) onClose();
        } else {
          setAuthStep('reset_password');
        }
      } else {
        setOtpError(data.error || (language === 'tr' ? 'Hatalı doğrulama kodu.' : 'Invalid verification code.'));
      }
    } catch (err) {
      setOtpError(language === 'tr' ? "Sunucuya bağlanılamadı." : "Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isLoading) return;
    setTimeLeft(120);
    setOtp('');
    setOtpError('');
    setIsLoading(true);
    const endpoint = verificationType === 'register' ? 'register' : 'forgot-password';
    
    let bodyData: any = { email };
    if (verificationType === 'register') {
      bodyData = { firstName, lastName, email, phoneNumber: phone, password };
    }

    await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    });
    setIsLoading(false);
  };

  const handleGoToVerify = async () => {
    if (isLoading) return;
    setAuthError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (data.success) {
          setVerificationType('reset');
          setAuthStep('verify_email');
          setTimeLeft(120);
          setOtp('');
          setOtpError('');
      } else {
          setAuthError(data.error || "Kullanıcı bulunamadı.");
      }
    } catch (err) {
      setAuthError("Sunucu hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
      if (isLoading) return;
      setAuthError('');
      const result = resetPasswordSchema.safeParse({ password, confirmPassword });
      
      if (!result.success) {
          let errorMsg = result.error.issues[0].message;
          setAuthError(errorMsg);
          return false;
      }
      
      setIsLoading(true);
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
      } finally {
          setIsLoading(false);
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
