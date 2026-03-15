import { X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import { useAuthForm } from "../hooks/useAuthForm";

import EmailStep from "./auth/EmailStep";
import PasswordStep from "./auth/PasswordStep";
import RegisterStep from "./auth/RegisterStep";
import VerifyEmailStep from "./auth/VerifyEmailStep";
import ResetPasswordStep from "./auth/ResetPasswordStep";

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin,
  customMessage,
  language = 'tr'
}: { 
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: any) => void; 
  customMessage?: string;
  language?: 'tr' | 'en';
}) {
  const t = translations[language];
  const {
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
    otpError,
    timeLeft,
    resetForm,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleOtpChange,
    handleResend,
    handleGoToVerify,
    isPasswordsMatch
  } = useAuthForm(language, onLogin, onClose);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderStep = () => {
    switch (authStep) {
      case 'email':
        return (
          <EmailStep 
            email={email}
            setEmail={setEmail}
            authError={authError}
            setAuthError={setAuthError}
            handleEmailSubmit={handleEmailSubmit}
            customMessage={customMessage}
            language={language}
          />
        );
      case 'password':
        return (
          <PasswordStep 
            email={email}
            password={password}
            setPassword={setPassword}
            authError={authError}
            setAuthError={setAuthError}
            handlePasswordSubmit={handlePasswordSubmit}
            handleGoToVerify={handleGoToVerify}
            setAuthStep={setAuthStep}
            language={language}
          />
        );
      case 'register':
        return (
          <RegisterStep 
            email={email}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            phone={phone}
            setPhone={setPhone}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isPasswordsMatch={isPasswordsMatch}
            onLogin={onLogin}
            handleClose={handleClose}
            language={language}
          />
        );
      case 'verify_email':
        return (
          <VerifyEmailStep 
            email={email}
            otp={otp}
            handleOtpChange={handleOtpChange}
            otpError={otpError}
            timeLeft={timeLeft}
            handleResend={handleResend}
            language={language}
          />
        );
      case 'reset_password':
        return (
          <ResetPasswordStep 
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isPasswordsMatch={isPasswordsMatch}
            handleClose={handleClose}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass-panel w-full sm:w-[420px] p-6 relative flex flex-col gap-6"
          >
            {/* Global Static Buttons */}
            {authStep !== 'email' && (
              <button 
                onClick={() => {
                  if (authStep === 'register') { setAuthStep('email'); setPassword(''); setConfirmPassword(''); setAuthError(''); }
                  else if (authStep === 'password') { setAuthStep('email'); setAuthError(''); setPassword(''); }
                  else if (authStep === 'verify_email') { setAuthStep('password'); setAuthError(''); }
                  else if (authStep === 'reset_password') { setAuthStep('password'); setAuthError(''); }
                }}
                className="absolute top-6 left-6 h-8 flex items-center justify-center gap-1 text-white/50 hover:text-white transition-all transform hover:scale-105 active:scale-95 bg-transparent text-sm font-medium z-10"
              >
                <ChevronLeft size={16} /> {t.back}
              </button>
            )}

            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all transform hover:scale-110 active:scale-95 bg-transparent z-10"
            >
              <X size={18} />
            </button>
            
            {renderStep()}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
