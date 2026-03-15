import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { translations } from "../../lib/translations";

type TranslationType = typeof translations.tr;

interface AccountProfileTabProps {
  t: TranslationType;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export default function AccountProfileTab({ t, user }: AccountProfileTabProps) {
  const { setCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone || "");

  const handleSaveChanges = () => {
    const updatedUser = { ...user, firstName, lastName, phone };
    setCurrentUser(updatedUser);
    localStorage.setItem('iyontree_user', JSON.stringify(updatedUser));
    // In a real app, this would be an API call
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
        <input 
          type="email" 
          defaultValue={user.email} 
          disabled 
          className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white/50 cursor-not-allowed font-medium" 
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.phoneLabel}</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium font-mono" 
        />
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
