import { z } from "zod";

export const contactSchema = z.object({
  name: z.string()
    .min(2, { message: "Ad en az 2 karakter olmalıdır / Name must be at least 2 characters" })
    .max(50, { message: "Ad çok uzun / Name is too long" })
    .regex(/^[A-Za-zÇŞĞÜÖİçşğüöı\s]+$/, { message: "Sadece harf kullanın / Use only letters" }),
  email: z.string()
    .email({ message: "Geçersiz e-posta / Invalid email" })
    .max(100),
  subject: z.string()
    .refine(val => val !== 'select' && val !== '', { message: "Lütfen bir konu seçin / Please select a subject" }),
  message: z.string()
    .min(10, { message: "Mesaj en az 10 karakter olmalıdır / Message must be at least 10 characters" })
    .max(2000, { message: "Mesaj çok uzun / Message is too long" })
});

export const bugReportSchema = contactSchema; // Same structure for now
export const suggestionSchema = contactSchema; // Same structure for now

export const vehicleRequestSchema = z.object({
  name: z.string()
    .min(2, { message: "Ad en az 2 karakter olmalıdır / Name must be at least 2 characters" })
    .max(50, { message: "Ad çok uzun / Name is too long" })
    .regex(/^[A-Za-zÇŞĞÜÖİçşğüöı\s]+$/, { message: "Sadece harf kullanın / Use only letters" }),
  email: z.string()
    .email({ message: "Geçersiz e-posta / Invalid email" })
    .max(100),
  brand: z.string()
    .min(1, { message: "Marka zorunludur / Brand is required" }),
  customBrand: z.string().optional(),
  model: z.string()
    .min(1, { message: "Model zorunludur / Model is required" }),
  details: z.string().optional()
}).refine((data) => {
  if (data.brand === 'Diğer' && (!data.customBrand || data.customBrand.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Lütfen marka adını belirtin / Please specify the brand name",
  path: ["customBrand"]
});

export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Geçersiz e-posta / Invalid email" }),
  password: z.string()
    .min(1, { message: "Şifre zorunludur / Password is required" })
});

export const registerSchema = z.object({
  email: z.string()
    .email({ message: "Geçersiz e-posta / Invalid email" }),
  firstName: z.string()
    .min(2, { message: "Ad en az 2 karakter olmalıdır / First name must be at least 2 characters" })
    .max(50),
  lastName: z.string()
    .min(2, { message: "Soyad en az 2 karakter olmalıdır / Last name must be at least 2 characters" })
    .max(50),
  phone: z.string()
    .min(14, { message: "Geçersiz telefon formatı / Invalid phone format" })
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      if (digits.length < 10) return false;
      if (/^(\d)\1+$/.test(digits)) return false; // Tüm karakterler aynı ise (örn: 0000000000)
      return true;
    }, { message: "Geçerli bir telefon numarası giriniz / Please enter a valid phone number" }),
  password: z.string()
    .min(8, { message: "Şifre en az 8 karakter olmalıdır / Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "En az bir büyük harf gereklidir / At least one uppercase letter is required" })
    .regex(/[a-z]/, { message: "En az bir küçük harf gereklidir / At least one lowercase letter is required" })
    .regex(/[0-9]/, { message: "En az bir rakam gereklidir / At least one number is required" })
    .regex(/[^A-Za-z0-9]/, { message: "En az bir noktalama/özel işaret gereklidir / At least one special character is required" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor / Passwords do not match",
  path: ["confirmPassword"]
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type BugReportFormData = z.infer<typeof bugReportSchema>;
export type SuggestionFormData = z.infer<typeof suggestionSchema>;
export type VehicleRequestFormData = z.infer<typeof vehicleRequestSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: "Şifre en az 8 karakter olmalıdır / Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "En az bir büyük harf gereklidir / At least one uppercase letter is required" })
    .regex(/[a-z]/, { message: "En az bir küçük harf gereklidir / At least one lowercase letter is required" })
    .regex(/[0-9]/, { message: "En az bir rakam gereklidir / At least one number is required" })
    .regex(/[^A-Za-z0-9]/, { message: "En az bir noktalama/özel işaret gereklidir / At least one special character is required" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor / Passwords do not match",
  path: ["confirmPassword"]
});
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
