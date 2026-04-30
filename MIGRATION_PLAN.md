# Plan de Migración a Microservicios — Tutor Inteligente

> **Elaborado por:** Equipo inicial (3 integrantes)  
> **Fecha:** 2026-04-30  
> **Estado del sistema base:** Monolito Next.js funcional entregado como punto de partida.  
> **Destinatarios:** Equipos futuros que continúen el desarrollo del sistema.

---

## Contexto

El sistema actual es un monolito desarrollado en **Next.js 16 + Prisma + PostgreSQL** con tres roles de usuario (Estudiante, Profesor, Administrador). Implementa hipermedia dinámica que adapta el contenido según el perfil de aprendizaje y nivel de ansiedad del estudiante.

Este documento propone una división en **3 microservicios independientes**, uno por equipo de trabajo, que permita escalar y mantener el sistema de forma paralela.

---

## Stack actual

| Capa | Tecnología |
|---|---|
| Frontend + BFF | Next.js 16 (App Router) |
| ORM | Prisma 7 |
| Base de datos | PostgreSQL |
| Autenticación | Auth.js v5 (JWT + OAuth Google) |
| Validación | Zod |
| UI | shadcn/ui + Tailwind CSS |

---

## División propuesta

### Servicio 1 — `ms-auth` *(Autenticación y Usuarios)*

**Responsabilidad:** Todo lo relacionado con la identidad del usuario. Es el único servicio que conoce contraseñas, tokens de sesión y proveedores OAuth.

**Modelos de Prisma propios:**
- `User`
- `Account`
- `Session`
- `VerificationToken`

**Enums propios:**
- `Role` (STUDENT, TEACHER, ADMIN)
- `StudyProfile` (Visual, Auditivo, Kinestesico)

**Endpoints principales:**
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /users/:id
PATCH  /users/:id/role          ← limpia studyProfile si el rol pasa a TEACHER o ADMIN
PATCH  /users/:id/study-profile
```

**Eventos que emite:**
| Evento | Payload |
|---|---|
| `user.registered` | `{ userId, email, role }` |
| `user.role-changed` | `{ userId, oldRole, newRole }` |

**Notas técnicas:**
- Emite **JWT firmado** con `{ userId, role, studyProfile }`. Los otros servicios validan este JWT localmente sin consultar `ms-auth` en cada request.
- La verificación de email (token → confirmar cuenta) está preparada en el schema (`VerificationToken`, `emailVerified`) pero no implementada. Es el primer feature a agregar en este servicio.
- OAuth con Google ya funciona vía Auth.js — migrar a un provider de OAuth propio o mantener Auth.js en este servicio.

---

### Servicio 2 — `ms-lms` *(Core Académico)*

**Responsabilidad:** Todo el contenido educativo, el flujo de aprendizaje y los resultados académicos. No almacena métricas de comportamiento — eso es responsabilidad de `ms-tracker`.

**Modelos de Prisma propios:**
- `Course`
- `Topic`
- `TopicCompletion`
- `Quiz`
- `Question`
- `Enrollment`
- `QuizAttempt`

**Enums propios:**
- `QuestionType` (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER)
- `AnxietyLevel` (Bajo, Medio, Alto) — solo almacenado en `Enrollment`, calculado por `ms-tracker`
- `StudyProfile` — copia local para adaptar contenido sin consultar `ms-auth`

**Endpoints principales:**
```
GET    /courses
POST   /courses
GET    /courses/:id
PATCH  /courses/:id
DELETE /courses/:id
GET    /courses/:id/topics
POST   /courses/:id/topics
GET    /topics/:id
PATCH  /topics/:id
DELETE /topics/:id
PATCH  /topics/:id/mark-read
GET    /courses/:id/quizzes
POST   /courses/:id/quizzes
GET    /quizzes/:id
POST   /quizzes/:id/attempts     ← registra resultado académico (score, passed, etc.)
POST   /enrollments
GET    /enrollments/:userId/:courseId
GET    /students/:userId/progress
```

**Eventos que emite:**
| Evento | Payload |
|---|---|
| `quiz.completed` | `{ userId, courseId, topicId, quizId, score, passed, timeSpent, correctAnswers, incorrectAnswers }` |
| `topic.read` | `{ userId, courseId, topicId }` |
| `enrollment.created` | `{ userId, courseId }` |

**Eventos que consume:**
| Evento | Acción |
|---|---|
| `ms-tracker.anxiety-updated` | Actualiza `Enrollment.anxietyLevel` con el nivel calculado por el tracker |
| `user.role-changed` | Si el usuario deja de ser estudiante, puede limpiar enrollments activos |

**Notas técnicas:**
- `QuizAttempt` almacena **solo resultados académicos**: `score`, `passed`, `totalPoints`, `maxPoints`, `correctAnswers`, `incorrectAnswers`, `timeSpent`, `answers`. Las métricas conductuales (tabSwitches, missedClicks, etc.) viven en `ms-tracker`.
- El campo `Enrollment.anxietyLevel` es **escribible solo por `ms-tracker`** vía evento. `ms-lms` lo lee para adaptar el contenido pero no lo calcula.
- `isDiagnostic` en `Quiz` permite identificar cuestionarios de diagnóstico inicial al inscribirse.

---

### Servicio 3 — `ms-tracker` *(Métricas, Ansiedad y Analítica)*

**Responsabilidad:** Captura y almacenamiento de métricas de interacción del estudiante, cálculo del nivel de ansiedad y generación de reportes para profesores y administradores.

**Modelos de Prisma propios:**
- `InteractionSession`
- `ResourceInteraction`
- Copia desnormalizada de `Enrollment` (solo `userId`, `courseId`, `anxietyLevel` y arrays de métricas)

**Enums propios:**
- `AnxietyLevel`
- `ResourceType` (Video, Audio, Diapositiva, JuegoInteractivo, ImagenInteractiva, Simulacion, DiapositivaAdicional)
- `StudyProfile` — copia local para correlacionar perfil con métricas

**Endpoints principales:**
```
POST   /sessions                          ← recibe sesión de interacción completa
GET    /sessions/:id
GET    /analytics/students?courseId=      ← datos para la vista de Estudiantes del profesor
GET    /analytics/reports?courseId=       ← datos para reportes del profesor
GET    /analytics/admin/reports           ← datos para el panel de admin
```

**Eventos que emite:**
| Evento | Payload |
|---|---|
| `anxiety.updated` | `{ userId, courseId, anxietyLevel }` |

**Eventos que consume:**
| Evento | Acción |
|---|---|
| `enrollment.created` | Crea registro en su copia del enrollment |
| `quiz.completed` | Dispara recálculo de nivel de ansiedad |
| `topic.read` | Registra en historial de actividad |
| `user.role-changed` | Limpia datos si el usuario deja de ser estudiante |

**Métricas que captura en `InteractionSession`:**

*Conductuales (toda sesión):*
- `totalTime`, `idleTime`, `tabSwitches`, `missedClicks`, `scrollReversals`
- `consecutiveClicks`, `copyAttempts`, `rightClickCount`, `windowBlurs`
- `anxietyLevel` (calculado al guardar la sesión)

*Engagement del quiz (solo sesiones de quiz):*
- `timePerQuestion` → `[{questionId, seconds}]`
- `attemptsPerQuestion` → `[{questionId, attempts}]`
- `backNavigations`, `timeToFirstAnswer` → `[{questionId, seconds}]`

**Métricas que captura en `ResourceInteraction`:**
- Por Video/Audio: `percentageWatched`, `timeWatched`, `timesPaused`, `timesReplayed`
- Por Diapositiva: `totalSlides`, `slidesViewed`, `percentageViewed`, `timesReviewed`, `zoomUsed`
- Por JuegoInteractivo: `gameCompleted`, `timesPlayed`, `helpUsed`, `correctResponses`, `incorrectResponses`, `completionPercent`
- Por ImagenInteractiva: `zonesMarked`, `visualAidsUsed`, `attemptsImage`, `correctIdentifications`
- Por Simulacion: `dataSelected`, `simulationChanges`, `attempts`, `toolsUsed`, `solutionPrecision`
- Por DiapositivaAdicional: `modifiedCaseResolved`, `visualSupportUsed`, `reflectionTime`, `errorsIdentified`, `reflectionLevel`

**Nota:** `ResourceInteraction` está modelado y el API route funciona, pero la instrumentación por tipo de recurso en el frontend **está pendiente de implementar**. El hook `useInteractionTracker` ya expone `addResource()` para que cada renderer de contenido reporte sus métricas.

**Notas técnicas:**
- El cálculo de ansiedad se basa en promedios de las últimas 10 `InteractionSession` del estudiante en el curso. Los umbrales actuales son ajustables.
- Al recibir una sesión, el tracker actualiza automáticamente `Enrollment.anxietyLevel` en su copia y emite `anxiety.updated` para que `ms-lms` sincronice el suyo.

---

## Arquitectura de comunicación

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  - Llama a los servicios vía API Gateway│
│  - JWT validado localmente por cada svc │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  API Gateway │  ← valida JWT, enruta requests
        └──┬───┬───┬───┘
           │   │   │
    ┌──────┘   │   └──────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────┐
│ms-auth │ │ms-lms  │ │ms-tracker│
└────┬───┘ └───┬────┘ └─────┬────┘
     │         │             │
     └────┬────┘─────────────┘
          ▼
   Message Queue
   (RabbitMQ / Redis Pub-Sub)
```

**Patrón de autenticación entre servicios:**
- El frontend incluye el JWT en cada request (`Authorization: Bearer <token>`)
- Cada servicio valida la firma del JWT localmente (sin llamar a `ms-auth`)
- Solo `ms-auth` puede emitir tokens válidos

**Comunicación sincrónica (REST):** Para operaciones CRUD que el usuario espera respuesta inmediata.

**Comunicación asíncrona (eventos):** Para operaciones que no bloquean al usuario — cálculo de ansiedad, sincronización de perfiles, actualización de reportes.

---

## Estrategia de migración gradual

Recomendamos extraer los servicios en este orden, de menor a mayor acoplamiento:

### Fase 1 — Extraer `ms-tracker`
Es el candidato más natural porque:
- Ya tiene su propio API route (`/api/tracker/sessions`)
- Tiene schemas Zod independientes
- El hook `useInteractionTracker` ya está desacoplado del resto del frontend
- Sus modelos (`InteractionSession`, `ResourceInteraction`) no tienen dependencias hacia `Course` o `Quiz` — solo usan IDs

**Trabajo pendiente antes de extraer:**
- Instrumentar los renderers de contenido para llamar a `addResource()` (actualmente pendiente)
- Agregar autenticación por JWT en el nuevo servicio independiente

### Fase 2 — Extraer `ms-auth`
- `api/auth/register` y `api/admin/users/:id/role` ya están aislados
- Requiere configurar un provider de OAuth propio o portar Auth.js al nuevo servicio
- Definir el formato del JWT compartido antes de que los otros servicios dependan de él

### Fase 3 — Extraer `ms-lms`
- Es el servicio más grande pero el más estable
- Para este punto los otros dos ya están fuera, lo que queda en el monolito es `ms-lms`
- Separar las server actions de teacher en endpoints REST

---

## Lo que ya facilita la migración

| Elemento | Por qué ayuda |
|---|---|
| Schemas Zod en `lib/schemas/tracker/` | Contrato de API del tracker ya definido y tipado |
| Auth.js v5 con JWT | Los tokens son stateless, validables en cualquier servicio |
| `submitQuizAttempt` sin lógica de ansiedad | ms-lms y ms-tracker ya tienen responsabilidades claras |
| `useInteractionTracker` hook | El cliente ya sabe a quién reportar métricas |
| `api/tracker/sessions` independiente | El tracker ya tiene su propio entry point |
| Modelos bien delimitados por dominio | Hay poca lógica cruzada entre Auth, LMS y Tracker |

---

## Deuda técnica relevante para la migración

| Deuda | Impacto en migración |
|---|---|
| `ResourceInteraction` no está instrumentado en frontend | El tracker recibirá `resources: []` hasta que se implemente |
| Verificación de email no implementada | `ms-auth` debe implementarla antes de ir a producción |
| No hay unique constraint en `Quiz.topicId` | La BD permite múltiples quizzes por tema; definir si se agrega |
| Errores de TypeScript pre-existentes en vistas de teacher | Corregir antes de separar `ms-lms` para no heredar deuda |

---

## Referencias del sistema actual

- **Schema Prisma:** `prisma/schema.prisma`
- **Hook de tracking:** `hooks/use-interaction-tracker.ts`
- **API del tracker:** `app/api/tracker/sessions/route.ts`
- **Validaciones del tracker:** `lib/schemas/tracker/`
- **Arquitectura general:** `ARCHITECTURE.md`
- **Server actions por rol:** `lib/actions/student.ts`, `lib/actions/teacher.ts`
