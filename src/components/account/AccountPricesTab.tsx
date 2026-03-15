import { motion } from "framer-motion";
import { translations } from "../../lib/translations";

type TranslationType = typeof translations.tr;

interface Price {
  provider: string;
  ac: string;
  dc: string;
}

interface AccountPricesTabProps {
  t: TranslationType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mockPrices: Price[];
}

export default function AccountPricesTab({
  t,
  searchQuery,
  setSearchQuery,
  mockPrices,
}: AccountPricesTabProps) {
  return (
    <motion.div
      key="prices"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="col-start-1 row-start-1 w-full flex flex-col gap-6"
    >
      <div className="flex gap-4 mb-2">
        <input
          type="text"
          placeholder={t.searchProvider}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/40 shadow-inner"
        />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 bg-black/40 p-4 border-b border-white/10">
          <div className="text-white/50 font-medium text-sm">{t.provider}</div>
          <div className="text-white/50 font-medium text-sm">{t.acCharge}</div>
          <div className="text-white/50 font-medium text-sm">{t.dcCharge}</div>
        </div>
        {mockPrices
          .filter((p) => p.provider.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((price, i) => (
            <div
              key={i}
              className="grid grid-cols-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
            >
              <div className="text-white font-bold">{price.provider}</div>
              <div className="text-emerald-400 font-mono">{price.ac}</div>
              <div className="text-amber-400 font-mono">{price.dc}</div>
            </div>
          ))}
        <div className="p-4 bg-white/5 text-xs text-white/40 text-center">
          {t.priceNotice}
        </div>
      </div>
    </motion.div>
  );
}
