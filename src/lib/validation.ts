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
    .refine(val => val !== 'select', { message: "Lütfen bir konu seçin / Please select a subject" }),
  message: z.string()
    .min(10, { message: "Mesaj en az 10 karakter olmalıdır / Message must be at least 10 characters" })
    .max(2000, { message: "Mesaj çok uzun / Message is too long" })
});

export type ContactFormData = z.infer<typeof contactSchema>;
