import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Users, Thermometer as Thermostat, Weight, Gauge, Zap, Cog, CarFront } from "lucide-react";

const vehicleSettingsSchema = z.object({
  passengers: z.number().min(1).max(9),
  climateControl: z.boolean(),
  extraWeight: z.number().min(0),
  refConsumption: z.number().min(5).max(50),
  drivingStyle: z.string(),
  maxSpeed: z.number().min(50).max(200),
  plugType: z.string()
});

export default function VehicleSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const form = useForm<z.infer<typeof vehicleSettingsSchema>>({
    resolver: zodResolver(vehicleSettingsSchema),
    defaultValues: {
      passengers: 1,
      climateControl: true,
      extraWeight: 0,
      refConsumption: 16.5,
      drivingStyle: "normal",
      maxSpeed: 130,
      plugType: "ccs",
    },
  });

  function onSubmit(values: z.infer<typeof vehicleSettingsSchema>) {
    console.log(values);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] glass-panel border-white/20 p-0 overflow-hidden bg-black/60 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Cog size={20} className="text-white/60"/> Araç ve Sürücü Ayarları
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 bg-zinc-950/40 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }: { field: any }) => (
                  <FormItem className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                    <FormLabel className="text-white/70 flex items-center gap-2"><Users size={16}/> Kişi Sayısı</FormLabel>
                    <div className="flex items-center justify-between mt-3">
                      <Button type="button" variant="outline" className="w-8 h-8 rounded-full p-0 bg-white/10 hover:bg-white/20 hover:text-white border-0 text-white" onClick={() => field.onChange((field.value > 1 ? field.value - 1 : 1))}>-</Button>
                      <span className="text-white font-bold text-lg">{field.value}</span>
                      <Button type="button" variant="outline" className="w-8 h-8 rounded-full p-0 bg-white/10 hover:bg-white/20 hover:text-white border-0 text-white" onClick={() => field.onChange(field.value + 1)}>+</Button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="climateControl"
                render={({ field }: { field: any }) => (
                  <FormItem className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                     <div>
                        <FormLabel className="text-white/70 flex items-center gap-2"><Thermostat size={16}/> Klima (<span className="text-sm font-bold text-white">{field.value ? "Açık" : "Kapalı"}</span>)</FormLabel>
                     </div>
                     <div className="flex justify-end mt-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                     </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extraWeight"
                render={({ field }: { field: any }) => (
                  <FormItem className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <FormLabel className="text-white/70 flex items-center gap-2 mb-3"><Weight size={16}/> Ek Ağırlık (kg)</FormLabel>
                    <FormControl>
                      <input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium text-center" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSpeed"
                render={({ field }: { field: any }) => (
                  <FormItem className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <FormLabel className="text-white/70 flex items-center gap-2 mb-3"><Gauge size={16}/> Maks. Hız (km/h)</FormLabel>
                    <FormControl>
                       <input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium text-center" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="drivingStyle"
                render={({ field }: { field: any }) => (
                  <FormItem className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                     <FormLabel className="text-white/70 flex items-center gap-2 mb-3"><CarFront size={16}/> Sürüş Tarzı</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-xl focus:ring-white/20 focus:ring-1">
                           <SelectValue placeholder="Seçiniz" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent className="bg-zinc-800 text-white border-white/10 rounded-xl">
                         <SelectItem value="eco">Eco - Yavaş ve Verimli</SelectItem>
                         <SelectItem value="normal">Normal</SelectItem>
                         <SelectItem value="sport">Sport - Hızlı ve Dinamik</SelectItem>
                       </SelectContent>
                     </Select>
                  </FormItem>
                )}
              />

              <FormField
                 control={form.control}
                 name="refConsumption"
                 render={({ field }: { field: any }) => (
                   <FormItem className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                     <FormLabel className="text-white/70 flex items-center gap-2 mb-3"><Zap size={16} /> Ref. Tüketim <span className="text-[10px] text-white/40">(kWh/100km)</span></FormLabel>
                     <FormControl>
                        <input type="number" step="0.5" {...field} onChange={e => field.onChange(Number(e.target.value))} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium text-center" />
                     </FormControl>
                   </FormItem>
                 )}
              />

            </div>

            <FormField
               control={form.control}
               name="plugType"
               render={({ field }) => (
                 <FormItem>
                    <FormLabel className="text-white/80 font-medium mb-3 block">Bağlayıcı Tipi (Plug Type)</FormLabel>
                    <div className="flex gap-2">
                       {['ccs', 'nacs', 'level2'].map(type => (
                          <Badge 
                            key={type}
                            onClick={() => field.onChange(type)}
                            className={`py-2 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all border ${field.value === type ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-transparent text-white/60 border-white/20 hover:text-white hover:border-white/50'}`}
                          >
                             {type.toUpperCase()}
                          </Badge>
                       ))}
                    </div>
                 </FormItem>
               )}
            />

            <div className="pt-4 border-t border-white/10 flex justify-end">
               <Button type="submit" className="bg-white text-black font-semibold hover:bg-zinc-200 active:scale-95 rounded-xl h-11 px-8 shadow-xl">
                  Uygula
               </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
