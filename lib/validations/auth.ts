import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("El correo electrónico no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[a-zA-Z]/, "Debe contener al menos una letra")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
