"use client"

import { useRouter } from "next/navigation"
import { EnrollByKey } from "@/components/student/enroll-by-key"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key } from "lucide-react"

export function EnrollClientPage() {
  const router = useRouter()

  const handleEnrollSuccess = () => {
    // Redirect to enrolled courses after successful enrollment
    router.push("/student/courses")
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Inscribirse a un Curso</h1>
            <p className="text-muted-foreground">
              Ingresa la clave de inscripción para acceder a un nuevo curso
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Enrollment Card */}
        <Card>
          <CardHeader>
            <CardTitle>Clave de Inscripción</CardTitle>
            <CardDescription>
              Tu profesor te proporcionó una clave única de 12 caracteres (formato: XXXX-XXXX-XXXX)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnrollByKey onEnrollSuccess={handleEnrollSuccess} />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">¿Cómo funciona?</strong>
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Tu profesor te comparte una clave única para cada curso</li>
                <li>Ingresa la clave en el formato indicado</li>
                <li>Una vez verificada, tendrás acceso inmediato al curso</li>
                <li>Podrás ver todos tus cursos en "Mis Cursos"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
