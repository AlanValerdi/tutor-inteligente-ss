"use client"

import { GraduationCap, Users, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RoleSelectorProps {
  onSelectRole: (role: "student" | "teacher") => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-foreground text-balance">
            Bienvenido a TutorInteligente
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Una plataforma de aprendizaje adaptativo que se adapta a tu ritmo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="group cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-lg"
            onClick={() => onSelectRole("student")}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mb-2 font-display text-xl font-semibold text-card-foreground">
                Portal Estudiante
              </h2>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                Realiza tu evaluacion diagnostica, explora cursos y aprende a tu propio ritmo con contenido adaptativo.
              </p>
              <Button className="gap-2 group-hover:gap-3 transition-all">
                Entrar como Estudiante
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-2 border-transparent transition-all hover:border-accent hover:shadow-lg"
            onClick={() => onSelectRole("teacher")}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h2 className="mb-2 font-display text-xl font-semibold text-card-foreground">
                Portal Docente
              </h2>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                Gestiona cursos, crea contenido por temas y monitorea el rendimiento estudiantil con analitica detallada.
              </p>
              <Button variant="outline" className="gap-2 group-hover:gap-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all">
                Entrar como Docente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
