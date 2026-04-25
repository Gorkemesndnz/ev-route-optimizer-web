import { useState, useEffect, useRef } from "react";
import { translations } from "../lib/translations";
import { useSettings } from "../contexts/SettingsContext";
import { loginSchema, registerSchema, resetPasswordSchema } from "../lib/validation";
import { z } from "zod";
import { ApiError } from "../lib/apiClient";
import { authApi } from "../api/authApi";
import type { AuthResponseDto } from "../types/api/auth";

export type AuthStep = 'email' | 'password' | 'register' | 'verify_email' | 'reset_password';

/** Extracts a human-readable message from an ApiError's envelope body. */
const extractApiMessage = (e: ApiError, defaultMsg: string): string => {
  const body = e.data as { error?: unknown; errors?: Record<string, string[]>; message?: unknown } | undefined;
  if (!body) return e.message || defaultMsg;
  if (body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
    const details = Object.values(body.errors).flat().join('\n');
    if (details) return details;
  }
  if (typeof body.error === 'string') return body.error;
  if (typeof body.message === 'string') return body.message;
  return e.message || defaultMsg;
};

export function useAuthForm(onLogin?: (user: AuthResponseDto) => void, onClose?: () => void) {
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
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
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
    setFieldErrors({});

    if (!email) {
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }

    try {
      z.object({ email: z.string().email() }).parse({ email });
    } catch {
      setAuthError(language === 'tr' ? 'Lütfen geçerli bir e-posta girin format hatası.' : 'Please enter a valid email format.');
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }

    try {
      const { exists } = await authApi.checkEmail({ email });
      if (exists) setAuthStep('password');
      else setAuthStep('register');
    } catch (e) {
      if (e instanceof ApiError) {
        setAuthError(extractApiMessage(e, language === 'tr' ? 'Lütfen geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.'));
      } else {
        setAuthError(language === 'tr' ? 'Sunucuya bağlanılamadı.' : 'Cannot connect to server.');
      }
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
      const data = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      resetForm();
      onLogin?.(data);
      onClose?.();
    } catch (e) {
      if (e instanceof ApiError) {
        setAuthError(extractApiMessage(e, language === 'tr' ? 'Girdiğiniz şifre hatalı.' : 'Incorrect password.'));
      } else {
        setAuthError(language === 'tr' ? 'Sunucuya bağlanılamadı.' : 'Cannot connect to server.');
      }
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

    const result = registerSchema.safeParse({ email, firstName, lastName, phone, password, confirmPassword });
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

    try {
      await authApi.register({
        firstName,
        lastName,
        email,
        phoneNumber: phone.replace(/\D/g, ''),
        password,
      });
      setVerificationType('register');
      setAuthStep('verify_email');
      setTimeLeft(120);
      setOtp('');
    } catch (e) {
      if (e instanceof ApiError) {
        setAuthError(extractApiMessage(e, language === 'tr' ? 'Kayıt olurken bir hata oluştu.' : 'Registration error.'));
      } else {
        setAuthError(language === 'tr' ? 'Sunucu hatası.' : 'Server error.');
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleOtpChange = (val: string) => {
    setOtp(val.replace(/[^0-9]/g, '').slice(0, 6));
    setOtpError('');
  };

  const handleVerifySubmit = async () => {
    if (isLoading || isSubmittingRef.current || otp.length !== 6) return;
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      if (verificationType === 'register') {
        const data = await authApi.verifyRegistration({ email, code: otp });
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        const snapshot = { ...data };
        resetForm();
        onLogin?.(snapshot);
        onClose?.();
      } else {
        await authApi.verifyCode({ email, code: otp });
        setPassword('');
        setConfirmPassword('');
        setAuthError('');
        setAuthStep('reset_password');
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setOtpError(extractApiMessage(e, language === 'tr' ? 'Hatalı doğrulama kodu.' : 'Invalid verification code.'));
      } else {
        setOtpError(language === 'tr' ? 'Sunucuya bağlanılamadı.' : 'Cannot connect to server.');
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResend = async () => {
    setOtp('');
    setOtpError('');
    try {
      if (verificationType === 'register') {
        await authApi.register({
          firstName,
          lastName,
          email,
          phoneNumber: phone.replace(/\D/g, ''),
          password,
        });
      } else {
        await authApi.forgotPassword({ email });
      }
    } catch (e) {
      console.error('Resend error:', e);
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
      await authApi.forgotPassword({ email });
      setVerificationType('reset');
      setAuthStep('verify_email');
      setTimeLeft(120);
      setOtp('');
      setOtpError('');
    } catch (e) {
      if (e instanceof ApiError) {
        setAuthError(extractApiMessage(e, language === 'tr' ? 'Kullanıcı bulunamadı.' : 'User not found.'));
      } else {
        setAuthError(language === 'tr' ? 'Sunucu hatası.' : 'Server error.');
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResetPasswordSubmit = async (): Promise<boolean> => {
    if (isLoading || isSubmittingRef.current) return false;
    isSubmittingRef.current = true;
    setIsLoading(true);
    setAuthError('');

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setAuthError(result.error.issues[0].message);
      setIsLoading(false);
      isSubmittingRef.current = false;
      return false;
    }

    try {
      await authApi.resetPassword({ email, code: otp, newPassword: password });
      setAuthError('');
      alert(language === 'tr' ? 'Şifreniz başarıyla yenilendi!' : 'Password successfully reset!');
      isSubmittingRef.current = false;
      setIsLoading(false);
      await handlePasswordSubmit();
      return true;
    } catch (e) {
      if (e instanceof ApiError) {
        setAuthError(extractApiMessage(e, language === 'tr' ? 'Sıfırlama başarısız.' : 'Reset failed.'));
      } else {
        setAuthError(language === 'tr' ? 'Sunucu hatası' : 'Server error');
      }
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
    verificationType, handleVerifySubmit, isLoading,
  };
}
