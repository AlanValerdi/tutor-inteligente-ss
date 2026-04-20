# 📚 Tutor Inteligente SS - Estado del Proyecto

---

## 🎯 ¿Qué es Tutor Inteligente SS?

**Tutor Inteligente SS** es una plataforma de **aprendizaje adaptativo** (LMS - Learning Management System) diseñada para educar a estudiantes de forma personalizada según su estilo de aprendizaje.

### Características principales:
- ✅ Sistema de **perfiles de aprendizaje** (Visual, Auditivo, Kinestésico)
- ✅ Contenido **multimedia adaptativo** (textos, imágenes, videos, quizzes)
- ✅ Portal para **profesores** con editor visual de cursos
- ✅ Portal para **estudiantes** con test diagnóstico y seguimiento de progreso
- ✅ Sistema de **quiz con corrección automática**
- ✅ **Tracking de ansiedad** del estudiante durante el aprendizaje

---

## 🏗️ Stack Tecnológico

### Frontend
- **React 19** + **Next.js 16** (App Router - arquitectura moderna)
- **TypeScript** (type-safe)
- **Tailwind CSS 4** para estilos
- **shadcn/ui** (componentes de UI profesionales)
- **TipTap 3** (editor WYSIWYG para creación de contenido)
- **SWR 2.4.1** (data fetching y caching)
- **react-hook-form + Zod** (validación)

### Backend
- **Next.js API Routes** + **Server Actions** (arquitectura híbrida)
- **Auth.js v5** (autenticación)
- **Prisma v7 ORM** (type-safe database)

### Base de Datos
- **PostgreSQL** 

### Herramientas
- **pnpm** (gestor de paquetes)
- **Recharts** (gráficos)
- **@dnd-kit** (drag-and-drop)

---

## 📁 Estructura del Proyecto

```
tutor-inteligente-ss/
├── app/                      # Rutas y páginas (Next.js App Router)
│   ├── (auth)/              # Rutas públicas: login, register
│   ├── (student)/           # Dashboard y rutas de estudiante
│   ├── (teacher)/           # Portal del profesor
│   ├── (admin)/             # Panel administrativo
│   ├── (dashboard)/         # Layout compartido
│   └── api/                 # API REST endpoints
│
├── components/              # Componentes React reutilizables
│   ├── ui/                  # Primitivos de shadcn/ui
│   ├── auth/                # Formularios de login/registro
│   ├── lms/                 # Componentes específicos LMS
│   ├── student/             # UI para estudiantes
│   ├── teacher/             # UI para profesores
│   └── admin/               # UI administrativa
│
├── lib/                     # Utilidades y lógica compartida
│   ├── auth.ts              # Configuración de autenticación
│   ├── db.ts                # Conexión de Prisma
│   ├── content-helpers.ts   # Helpers para bloques de contenido
│   ├── quiz-helpers.ts      # Lógica de quizzes
│   ├── swr-config.ts        # Configuración global de SWR
│   ├── validations/         # Esquemas Zod
│   └── types/               # Tipos TypeScript compartidos
│
├── prisma/                  # Base de datos
│   ├── schema.prisma        # Definición de modelos
│   └── migrations/          # Historial de cambios
│
├── styles/                  # CSS global
├── public/                  # Archivos estáticos
├── node_modules/            # Dependencias
│
├── ARCHITECTURE.md          # Documentación técnica detallada
├── PLAN.md                  # Plan de implementación
├── README.md                # Introducción general
└── PROJECT_STATUS.md        # Este archivo
```

---

## 🔑 Funcionalidades Principales

### 1. **Sistema de Autenticación**
- Registro con email + contraseña
- Login local
- Google OAuth integration
- Tres roles: **STUDENT**, **TEACHER**, **ADMIN**
- **Test diagnóstico** al registrarse (determina perfil: Visual/Auditivo/Kinestésico)

### 2. **Portal del Profesor**
**Ubicación:** `/teacher`

- Dashboard con estadísticas de estudiantes
- Crear y editar cursos
- Generar **claves de inscripción únicas** para cada curso
- Editor visual de **contenido** con TipTap
- Crear **bloques de contenido adaptativo:**
  - Textos (HTML)
  - Imágenes
  - Videos (YouTube)
  - Quizzes
- Publicar/despublicar cursos
- Ver **reportes de estudiantes:**
  - Métricas de ansiedad
  - Progreso por tema
  - Puntuaciones de quizzes

### 3. **Portal del Estudiante**
**Ubicación:** `/student`

- Dashboard con mis cursos y progreso
- **Inscripción a cursos** con clave de profesor
- Visualización de **contenido adaptado a su perfil**
- **Quizzes inline** con feedback inmediato
- Tracking de progreso automático
- **Métricas personales:**
  - Cambios de tabs (distracciones)
  - Clics
  - Tiempo invertido
  - Momentos de inactividad (idle time)

### 4. **Panel Administrativo**
**Ubicación:** `/admin`

- Gestión de usuarios
- Visualización general de la plataforma
- Control de roles

---

## 🗄️ Modelos de Base de Datos (Principales)

```typescript
User
├── email, password, name, image
├── role: STUDENT | TEACHER | ADMIN
└── profile: VISUAL | AUDITORY | KINESTHETIC

Course
├── title, description, enrollKey (única)
├── teacherId (profesor propietario)
├── isPublished
└── createdAt

Topic
├── title, courseId
├── content (JSON con bloques)
└── order

Enrollment
├── studentId, courseId
├── learningProfile (perfil del estudiante)
├── metrics (JSON: ansiedad, progreso, etc)
└── completedAt

Quiz
├── courseId
└── questions (referencia a Question)

Question
├── courseId, text, options
└── correctAnswer

QuizAttempt
├── studentId, quizId
├── answers, score
└── completedAt
```

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev        # Inicia servidor de desarrollo (http://localhost:3000)

# Build
npm run build      # Compila para producción
npm run start      # Sirve el build de producción

# Calidad de código
npm run lint       # Ejecuta linting (eslint)

# Prisma
npx prisma studio # Abre interfaz visual de base de datos
npx prisma db push # Sincroniza cambios de schema con BD
```

---

## 🛣️ Rutas Principales de la Aplicación

### Públicas (sin autenticación)
```
GET  /                    # Landing page
GET  /login               # Formulario de login
GET  /register            # Formulario de registro
```

### Estudiante
```
GET  /student                              # Dashboard principal
GET  /student/enroll                       # Inscribirse a curso (con clave)
GET  /student/courses                      # Mis cursos
GET  /student/courses/[courseId]           # Detalles del curso
GET  /student/courses/[courseId]/topics/[topicId]  # Tema específico
GET  /onboarding                           # Test diagnóstico inicial
```

### Profesor
```
GET  /teacher                              # Dashboard con estadísticas
GET  /teacher/courses                      # Mis cursos
GET  /teacher/courses/create               # Crear nuevo curso
GET  /teacher/courses/[courseId]/edit      # Editar curso
```

### Administrador
```
GET  /admin                                # Panel administrativo
```

### API (Backend)
```
POST   /api/auth/register                  # Registro de usuario
POST   /api/auth/[...nextauth]            # Manejo de autenticación
GET    /api/courses                        # Listar cursos
GET    /api/courses/[id]                   # Detalle de curso
POST   /api/enrollments                    # Inscribir estudiante
GET    /api/student/courses                # Cursos del estudiante
GET    /api/student/stats                  # Estadísticas del estudiante
GET    /api/topics/[id]                    # Contenido de tema
```

---

## 🔄 Flujos Principales

### 1. Registro e Inscripción
```
1. Usuario entra a /register
2. Completa formulario (email, nombre, contraseña)
3. Sistema lo registra con rol STUDENT
4. Usuario redirigido a /onboarding
5. Completa test diagnóstico → obtiene perfil (VISUAL/AUDITORY/KINESTHETIC)
6. Redirigido a /student/enroll para inscribirse a primer curso
```

### 2. Crear un Curso (Profesor)
```
1. Profesor va a /teacher/courses/create
2. Completa: título, descripción
3. Sistema genera enrollKey única automáticamente
4. Profesor redirigido a /teacher/courses/[id]/edit
5. Usa editor visual para agregar temas y bloques
   a. Textos (HTML)
   b. Imágenes (URL)
   c. Videos (YouTube)
   d. Quizzes (referencia a preguntas)
6. Etiqueta cada bloque con perfiles aplicables (VISUAL/AUDITORY/KINESTHETIC)
7. Publica el curso
```

### 3. Estudiante Toma un Curso
```
1. Estudiante recibe enrollKey del profesor
2. Va a /student/enroll
3. Ingresa la clave → se inscribe automáticamente
4. Va a /student/courses/[courseId]
5. Visualiza temas
6. Abre tema → ve contenido adaptado a su perfil
   (si perfil = VISUAL, ve más imágenes/videos)
   (si perfil = AUDITORY, ve más textos/explicaciones)
   (si perfil = KINESTHETIC, ve interactividad/quizzes)
7. Completa quizzes con feedback inmediato
8. Sistema trackea métricas de ansiedad y progreso
```

---

## 📊 Arquitectura de Datos

### Estrategia Híbrida

La aplicación usa **dos patrones** según el caso de uso:

#### **Server Actions** (para operaciones de Profesor/Admin)
```typescript
// Usado en: crear/editar cursos, crear quizzes
// Ventajas: Menos overhead de API, server-first, type-safe
// Ubicación: /lib/actions/

async function createCourse(data: CourseInput) {
  // Valida, hashea, y guarda en BD
}
```

#### **API Routes + SWR** (para datos del Estudiante)
```typescript
// Usado en: obtener cursos, métricas, quizzes
// Ventajas: Caching, revalidación automática, escalable
// Ubicación: /app/api/
// Cliente: /hooks/use-*

const { data, isLoading, error } = useSWR('/api/student/courses', fetcher)
```

### Flujo de Datos
```
Cliente (React)
    ↓ (API Route o Server Action)
Servidor Next.js
    ↓ (Prisma ORM)
PostgreSQL (Railway)
    ↓
Respuesta a Cliente
```

---

## 🛡️ Autenticación y Autorización

### Cómo Funciona
1. **Auth.js (NextAuth)** maneja toda la autenticación
2. Usuario inicia sesión → JWT se crea automáticamente
3. Token almacenado en cookie httpOnly (segura)
4. Cada request incluye el token para verificar identidad
5. Roles (STUDENT/TEACHER/ADMIN) determinan acceso

### Protección de Rutas
```typescript
// Middleware automático en Next.js protege rutas
// /student/* → solo STUDENT
// /teacher/* → solo TEACHER
// /admin/* → solo ADMIN
```

### Google OAuth
- Si usuario se registra con Google, se sincroniza automáticamente
- Credenciales de Google se guardan seguro en la BD
- Usuario puede usar Google para todos sus logins

---

## 🎨 Contenido Adaptativo

### Sistema de Bloques

Cada **Tema (Topic)** contiene un array de bloques en formato JSON:

```typescript
type BlockContent = 
  | TextBlock   { type: "text", html: "...", profiles: [...] }
  | ImageBlock  { type: "image", url: "...", profiles: [...] }
  | VideoBlock  { type: "video", youtubeId: "...", profiles: [...] }
  | QuizBlock   { type: "quiz", quizId: "...", profiles: [...] }
```

### Filtrado por Perfil
```typescript
// Cuando estudiante visualiza un tema:
const aplicableBlocks = content.filter(
  block => block.profiles.includes(student.learningProfile)
)
// Muestra solo bloques relevantes a su perfil
```

---

## 📈 Métricas de Ansiedad

Sistema automático que trackea:

| Métrica | Qué mide | Cómo se usa |
|---------|----------|-----------|
| **Tab switches** | Cambios de pestaña del navegador | Indicator de distracción |
| **Clicks** | Número de clics por minuto | Indicador de nerviosismo |
| **Time invested** | Minutos en la plataforma | Engagement |
| **Idle time** | Segundos sin actividad | Apatía o dificultad |

**Visualización:** Profesor puede ver estas métricas en reportes para detectar estudiantes con dificultades.

---

## 🔧 Tecnologías Específicas

### Por Qué Cada Herramienta

| Herramienta | Razón |
|------------|-------|
| **Next.js 16** | Fullstack, SSR, API routes integradas |
| **React 19** | UI declarativa, latest features |
| **Prisma** | ORM type-safe, migraciones automáticas |
| **PostgreSQL** | Relacional, robusto para producción |
| **Auth.js** | Estándar de la industria, OAuth fácil |
| **Tailwind** | Utility-first, desarrollo rápido |
| **shadcn/ui** | Componentes accesibles y personalizables |
| **TipTap** | Editor WYSIWYG colaborativo, extensible |
| **SWR** | Data fetching elegante, caching automático |
| **Zod** | Validación con TypeScript puro |

---

## 📝 Convenciones del Proyecto

### Nombrado de Archivos
- Componentes: `PascalCase` (ej: `LoginForm.tsx`)
- Hooks: `camelCase` (ej: `useSWRUtils.ts`)
- Tipos: `PascalCase` (ej: `CourseInput.ts`)
- Constantes: `UPPER_SNAKE_CASE` (ej: `LEARNING_PROFILES`)

### Estructura de Componentes
```typescript
// Cada componente en su propia carpeta o archivo
Button.tsx
└── /components/ui/button/
    ├── Button.tsx        // Componente
    ├── button.module.css // Estilos (si aplica)
    └── index.ts          // Export

// Importar:
import { Button } from "@/components/ui/button"
```

### API Routes
```typescript
// Patrón RESTful
GET    /api/resource          → listar
GET    /api/resource/[id]     → obtener uno
POST   /api/resource          → crear
PUT    /api/resource/[id]     → actualizar
DELETE /api/resource/[id]     → eliminar
```

---

## 🚀 Getting Started (Para Nuevos Integrantes)

### 1. Configuración Inicial
```bash
# Clonar repo
git clone https://github.com/AlanValerdi/tutor-inteligente-ss.git
cd tutor-inteligente-ss

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con credenciales reales

# Sincronizar BD
npx prisma db push

# Iniciar desarrollo
pnpm run dev
# Abierto en http://localhost:3000
```

### 2. Entender la Estructura
- Leer `ARCHITECTURE.md` para detalles técnicos
- Leer `PLAN.md` para roadmap
- Explorar `/components/ui` para ver componentes disponibles

### 3. Flujo de Desarrollo
```bash
# Crear rama para feature
git checkout -b feature/nombre-feature

# Hacer cambios
# Testear en http://localhost:3000

# Commit
git add .
git commit -m "feat: descripción"

# Push
git push origin feature/nombre-feature

# Crear Pull Request en GitHub
```

### 4. Debug
```bash
# Base de datos visual
npx prisma studio

# Network requests (existe panel en dev)
# Ir a http://localhost:3000 → ver console del navegador

# Logs del servidor
# Ver terminal donde corre `npm run dev`
```

---

## 📚 Documentación Adicional

| Archivo | Contenido |
|---------|----------|
| **ARCHITECTURE.md** | Detalles técnicos profundos |
| **PLAN.md** | Roadmap y features planeadas |
| **README.md** | Intro general del proyecto |
| **PROJECT_STATUS.md** | Este archivo (estado actual) |

---

## 🤝 Cómo Contribuir

### Antes de Empezar
1. Asignarte un issue en GitHub
2. Crear rama desde `main`
3. Implementar cambios
4. Hacer test local

### Código de Conducta
- Commits claros y descriptivos
- Código legible, comentar lógica compleja
- Respetar el stack de tecnologías
- No ignorar warnings de TypeScript/ESLint

### Pull Request
- Describir qué hace el PR
- Referenciar el issue (#123)
- Esperar revisión antes de mergear

---

## ❓ Preguntas Frecuentes

### ¿Cómo agregó un nuevo bloque de contenido?
Editar `/lib/types/content.ts` → agregar tipo → actualizar componentes en `/components/lms/`

### ¿Cómo cambio el diseño de una página?
Editar componentes en `/components/` → usar Tailwind/shadcn/ui

### ¿Cómo agrego una nueva métrica de ansiedad?
Editar `/lib/quiz-helpers.ts` → agregar tracking en `/components/student/`

### ¿Cómo protejo una ruta?
NextAuth middleware automático. Ver `/middleware.ts` si existe.

### ¿Cómo conecto con la BD?
Usar `prisma.model.create()` en Server Actions o API Routes. Ver ejemplos en `/lib/actions/`

---

## ❓ TODO:

## Edición, Visualización de una clase:
return 404 (No implementado)

## Expiración para sesiones (En deploy)
- Configuración explícita de renovación (Settear a 10, 20 mins)
- Renovar el JWT en sesión
- Revocación total del token, logout total -> eliminacion de firma (no solo de la cookie)
- Conf explícita de cookies en nextAuth 

## Edición, Visualización de cuestionarios:
- Bug de content overflow
- Implementar cuestionario de conocimientos previos para cada clase (hacerlo opcional?)

## Eliminacion de contenido mock
- Eliminar contenido mock y no utilizado (creado por v0)
- Redireccionamiento a /courses (vista descontinuada)
- Eliminar metricas para quiz (irán en un servicio aparte)

## Implementación / Pruebas de contenido responsivo
- Implementar mediaqueries (tailwind), algunos componentes se desbordan en mobile



