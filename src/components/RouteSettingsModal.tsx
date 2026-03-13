import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Search, Info } from "lucide-react";

export default function RouteSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] glass-panel border-white/20 p-0 overflow-hidden bg-black/60 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-semibold text-white tracking-tight">Rota ve İstasyon Ayarları</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 h-[60vh] overflow-y-auto">
          {/* L: Rota Tercihleri */}
          <div className="bg-zinc-950/40 p-6 flex flex-col gap-8">
            <div>
              <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Şarj Sıklığı</h3>
              <Tabs defaultValue="optimal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl h-11 p-1">
                  <TabsTrigger value="az" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">Az</TabsTrigger>
                  <TabsTrigger value="optimal" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">Optimal</TabsTrigger>
                  <TabsTrigger value="sik" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">Sık</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white/80 font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Varış Şarj Durumu</h3>
                <span className="text-white font-bold">15%</span>
              </div>
              <Slider defaultValue={[15]} max={100} step={1} className="w-full" />
            </div>

            <div>
              <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Yola Çıkış Zamanı</h3>
              <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-1 focus:ring-white/50 outline-none" />
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-white/80 font-medium mb-1">Kaçınma Seçenekleri</h3>
              {['Ücretli Yollar', 'Feribot', 'Otoyol'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <label className="text-sm text-white/70 font-medium">{item}</label>
                  <Switch />
                </div>
              ))}
            </div>
          </div>

          {/* R: Istasyon Tercihleri */}
          <div className="bg-zinc-950/40 p-6 flex flex-col gap-8">
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-white/80 font-medium text-sm mb-2 block">İstasyona Varış %</label>
                 <input type="number" defaultValue={10} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
              </div>
              <div className="flex-1">
                 <label className="text-white/80 font-medium text-sm mb-2 block">Ayrılış %</label>
                 <input type="number" defaultValue={80} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
              </div>
            </div>

            <div>
               <h3 className="text-white/80 font-medium mb-3">İstasyon Markaları</h3>
               <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" placeholder="Ara..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none" />
               </div>
               <div className="flex flex-wrap gap-2">
                 {['ZES', 'Eşarj', 'Trugo', 'Voltrun'].map(brand => (
                   <Badge key={brand} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0 transition-colors cursor-pointer py-1.5 px-3 rounded-lg text-xs">{brand}</Badge>
                 ))}
               </div>
            </div>

            <div>
               <h3 className="text-white/80 font-medium mb-3">Şarj Tercihleri</h3>
               <div className="flex gap-2">
                  <Badge className="bg-accent/80 hover:bg-accent text-white py-1.5 px-3 rounded-lg text-xs cursor-pointer">HPC (&gt;150kW)</Badge>
                  <Badge className="bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg text-xs cursor-pointer">DC (50-150kW)</Badge>
                  <Badge variant="outline" className="border-white/20 text-white py-1.5 px-3 rounded-lg text-xs opacity-50 cursor-pointer hover:opacity-100 transition-opacity">AC (&lt;43kW)</Badge>
               </div>
            </div>

            <div>
               <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2">Tesis İmkanları <Info size={14} className="text-white/40"/></h3>
               <div className="grid grid-cols-2 gap-4">
                 {['AVM', 'Kafe', 'Otel', 'Tuvalet', 'Market', 'Oyun Alanı'].map((amenity) => (
                   <div key={amenity} className="flex items-center space-x-2">
                     <Checkbox id={amenity} className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                     <label htmlFor={amenity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/70">
                       {amenity}
                     </label>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end bg-zinc-950/80">
           <button onClick={onClose} className="bg-white text-black font-semibold py-2.5 px-8 rounded-xl hover:bg-zinc-200 transition-colors duration-200 active:scale-95 text-sm shadow-xl">
             Kaydet ve Kapat
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
