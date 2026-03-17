import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            O{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              crea una cuenta nueva
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
