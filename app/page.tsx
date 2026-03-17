import Link from "next/link"
import { GraduationCap, BookOpen, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Tutor Inteligente</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Plataforma de Aprendizaje Adaptativo
          </h1>
          <p className="text-xl text-gray-600">
            Un sistema de gestión de aprendizaje moderno con evaluaciones diagnósticas,
            contenido personalizado y seguimiento en tiempo real.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Comenzar ahora</Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Cursos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Contenido adaptativo basado en tu nivel y objetivos de aprendizaje.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Evaluación Diagnóstica</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Identifica tus fortalezas y áreas de mejora con pruebas iniciales.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Seguimiento en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitorea tu progreso y obtén analíticas detalladas de tu rendimiento.
              </CardDescription>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2026 Tutor IA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
