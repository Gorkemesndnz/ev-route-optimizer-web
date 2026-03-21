import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { translations } from "../../lib/translations";

type TranslationType = typeof translations.tr;

interface AccountProfileTabProps {
  t: TranslationType;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export default function AccountProfileTab({ t, user }: AccountProfileTabProps) {
  const { setCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phoneNumber || "");
  const [email, setEmail] = useState(user.email);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);

  const handleSaveChanges = () => {
    const updatedUser = { ...user, firstName, lastName, phoneNumber: phone, email };
    setCurrentUser(updatedUser);
    localStorage.setItem('iyontree_user', JSON.stringify(updatedUser));
    // Reset edit states
    setIsEmailEditable(false);
    setIsPhoneEditable(false);
    alert(t.profileUpdated);
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="col-start-1 row-start-1 max-w-2xl mx-auto flex flex-col gap-6 w-full"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">{t.firstNameLabel}</label>
          <input 
            type="text" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">{t.lastNameLabel}</label>
          <input 
            type="text" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" 
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.emailLabel}</label>
        <div className="relative group">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEmailEditable}
            className={cn(
               "w-full border rounded-xl py-3 px-4 text-white font-medium transition-all outline-none",
               isEmailEditable ? "bg-white/10 border-cyan-400/50" : "bg-black/20 border-white/5 text-white/50 cursor-not-allowed"
            )}
          />
          {!isEmailEditable && (
            <button 
                onClick={() => setIsEmailEditable(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 px-2 py-1 rounded-md uppercase tracking-wider transition-all"
            >
                {t.edit}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.phoneLabel}</label>
        <div className="relative group">
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isPhoneEditable}
            className={cn(
               "w-full border rounded-xl py-3 px-4 text-white font-medium transition-all outline-none font-mono",
               isPhoneEditable ? "bg-white/10 border-cyan-400/50" : "bg-black/20 border-white/5 text-white/50 cursor-not-allowed"
            )}
          />
          {!isPhoneEditable && (
            <button 
                onClick={() => setIsPhoneEditable(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 px-2 py-1 rounded-md uppercase tracking-wider transition-all"
            >
                {t.edit}
            </button>
          )}
        </div>
      </div>

      <h4 className="text-lg font-bold text-white mt-4 border-t border-white/10 pt-6">{t.changePass}</h4>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.currentPass}</label>
        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.newPass}</label>
        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={handleSaveChanges}
          className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          {t.saveChanges}
        </button>
      </div>
    </motion.div>
  );
}
