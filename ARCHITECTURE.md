# Tutor Inteligente SS - Architecture Plan

> **Status**: Phase 4 Complete - Hybrid Architecture + Teacher Features  
> **Last Updated**: 2026-03-25

---

## 1. Dependencies

### Installed Dependencies
- Next.js 16 (with Turbopack)
- React 19
- SWR v2.4.1 - Data fetching and caching
- Zod - Schema validation
- react-hook-form + @hookform/resolvers
- shadcn/ui components
- Tailwind CSS
- Prisma v7 - ORM
- Auth.js v5 (beta) - Authentication

---

## 2. Architecture Overview

### Current Architecture: Hybrid (Server Actions + API Routes)

**Decision**: Pragmatic hybrid approach based on use case

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Teacher Features (SSR-first)          Student Features      │
│  ┌──────────────────┐                 ┌──────────────────┐  │
│  │ Server Component │──────┐          │   React UI       │  │
│  │   (Dashboard)    │      │          │   Components     │  │
│  └──────────────────┘      │          └──────────────────┘  │
│                            │                    │            │
│                            ▼                    ▼            │
├─────────────────────────────────────────────────────────────┤
│                     SERVER LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                            │                    │            │
│  ┌──────────────────┐      │          ┌──────────────────┐  │
│  │ Server Actions   │◀─────┘          │   SWR Hooks      │  │
│  │  (Teacher)       │                 │   (Student)      │  │
│  └──────────────────┘                 └──────────────────┘  │
│          │                                      │            │
│          │                                      ▼            │
│          │                            ┌──────────────────┐  │
│          │                            │   API Routes     │  │
│          │                            │   (REST)         │  │
│          │                            └──────────────────┘  │
│          │                                      │            │
│          └──────────────────┬───────────────────┘            │
│                             ▼                                │
│                    ┌──────────────────┐                      │
│                    │  Prisma Client   │                      │
│                    └──────────────────┘                      │
│                             │                                │
└─────────────────────────────┼────────────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    └──────────────────┘
```

### Key Principles

1. **Hybrid Architecture** - Server Actions for teacher reads, API Routes for student mutations
2. **SSR-First for Teachers** - No unnecessary API overhead, direct database access
3. **SWR for Students** - Automatic caching, revalidation, and optimistic updates
4. **RESTful API Design** - Standard HTTP methods and status codes where needed
5. **Type-Safe** - Shared types between client and server

---

## 3. Project Structure

```
app/
├── (auth)/                          # Authentication routes
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── register/
│   │   └── page.tsx                 # Register page
│   └── layout.tsx                   # Auth layout
│
├── (dashboard)/                     # Protected routes
│   ├── student/
│   │   ├── courses/                 # Student courses
│   │   └── page.tsx                 # Student dashboard
│   ├── teacher/
│   │   ├── courses/                 # Teacher course management
│   │   └── page.tsx                 # Teacher dashboard
│   ├── admin/
│   │   └── page.tsx                 # Admin dashboard
│   └── layout.tsx                   # Dashboard layout
│
├── api/                             # API Routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts             # Auth.js handler
│   │
│   ├── courses/
│   │   ├── route.ts                 # GET (list), POST (create)
│   │   └── published/
│   │       └── route.ts             # GET (public courses)
│   │
│   ├── enrollments/
│   │   └── route.ts                 # POST (enroll), GET (user enrollments)
│   │
│   ├── student/
│   │   ├── dashboard-stats/
│   │   │   └── route.ts             # GET (student stats)
│   │   └── enrolled-courses/
│   │       └── route.ts             # GET (enrolled courses with progress)
│   │
│   └── topics/
│       └── route.ts                 # GET, POST, PUT, DELETE
│
├── layout.tsx                       # Root layout
└── page.tsx                         # Landing page

lib/
├── db.ts                            # Prisma client singleton
├── auth.ts                          # Auth.js configuration
├── admin.ts                         # Admin email helpers
├── swr-config.ts                    # SWR global configuration
├── utils.ts                         # Utility functions
└── validations/                     # Zod schemas
    ├── auth.ts
    ├── course.ts
    ├── enrollment.ts
    └── topic.ts

types/
├── swr.ts                           # SWR data types and responses
└── api.ts                           # API request/response types

hooks/
├── use-swr-utils.ts                 # Base SWR utilities
├── use-dashboard-data.ts            # Dashboard data hooks
└── use-mutations.ts                 # Optimistic mutation hooks

components/
├── auth/                           # Auth components
│   ├── login-form.tsx
│   └── register-form.tsx
├── ui/                             # shadcn/ui components
├── dashboard/                       # Dashboard components
│   ├── student-portal.tsx          # Main student dashboard
│   ├── student-dashboard.tsx
│   ├── course-explorer.tsx
│   ├── course-view-adapter.tsx
│   ├── topic-detail-adapter.tsx
│   └── dashboard-skeletons.tsx
├── debug/
│   └── swr-debug-panel.tsx          # Development debugging
└── providers/
    └── swr-provider.tsx             # SWR provider component

prisma/
├── schema.prisma                    # Database schema
└── seed.ts                         # Database seeder (future)
```

---

## 4. Database Schema (Prisma)

### Models

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          Role          @default(STUDENT)
  password      String?
  accounts      Account[]
  sessions      Session[]
  courses       Course[]      @relation("TeacherCourses")
  enrollments   Enrollment[]
  quizAttempts  QuizAttempt[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Course {
  id           String        @id @default(cuid())
  title        String
  description  String?
  enrollKey    String        @unique
  isPublished  Boolean       @default(false)
  teacherId    String
  teacher      User          @relation("TeacherCourses", fields: [teacherId], references: [id])
  enrollments  Enrollment[]
  topics       Topic[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Enrollment {
  id                String        @id @default(cuid())
  userId            String
  courseId          String
  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  course            Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progress          Int           @default(0)
  completedTopics   Int           @default(0)
  lastAccessedAt    DateTime?
  enrolledAt        DateTime      @default(now())
  
  // Learning profile data
  studyProfile      StudyProfile?
  anxietyLevel      AnxietyLevel  @default(Bajo)
  averageScore      Int           @default(0)
  
  // Profile scores (0-100 for each learning style)
  visualScore       Int           @default(0)
  auditivoScore     Int           @default(0)
  kinestesicoScore  Int           @default(0)
  
  // Anxiety metrics (JSON arrays for last 10 sessions)
  tabSwitches       Json?
  consecutiveClicks Json?
  missedClicks      Json?
  timePerQuestion   Json?
  idleTime          Json?
  scrollReversals   Json?

  @@unique([userId, courseId])
}

model Topic {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  quizzes   Quiz[]
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Quiz {
  id              String         @id @default(cuid())
  title           String
  description     String?
  topicId         String
  topic           Topic          @relation(fields: [topicId], references: [id], onDelete: Cascade)
  questions       Question[]
  attempts        QuizAttempt[]
  passingScore    Int            @default(70)
  maxAttempts     Int?
  timeLimit       Int?
  shuffleQuestions Boolean       @default(false)
  isPublished     Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Question {
  id              String         @id @default(cuid())
  quizId          String
  quiz            Quiz           @relation(fields: [quizId], references: [id], onDelete: Cascade)
  type            QuestionType   @default(MULTIPLE_CHOICE)
  questionText    String         @db.Text
  imageUrl        String?
  order           Int
  points          Int            @default(1)
  options         Json
  explanation     String?        @db.Text
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model QuizAttempt {
  id                String         @id @default(cuid())
  quizId            String
  quiz              Quiz           @relation(fields: [quizId], references: [id], onDelete: Cascade)
  userId            String
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  score             Int
  totalPoints       Int
  maxPoints         Int
  answers           Json
  passed            Boolean        @default(false)
  timeSpent         Int?
  startedAt         DateTime       @default(now())
  completedAt       DateTime?
  
  // Anxiety tracking
  tabSwitches       Int            @default(0)
  consecutiveClicks Int            @default(0)
  missedClicks      Int            @default(0)
  idleTimeSeconds   Int            @default(0)
  scrollReversals   Int            @default(0)
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum StudyProfile {
  Visual
  Auditivo
  Kinestesico
}

enum AnxietyLevel {
  Bajo
  Medio
  Alto
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}
```

### Migrations Applied
- `20260319060248_add_analytics_fields` - Learning profiles & anxiety metrics
- `20260325052915_add_quiz_models` - Quiz system (Quiz, Question, QuizAttempt)

---

## 5. API Routes Pattern

### RESTful Endpoints

#### Courses API

```typescript
// app/api/courses/route.ts
// GET /api/courses - List courses (with auth)
// POST /api/courses - Create course (teacher only)

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { topics: true, enrollments: true } }
    }
  })

  return Response.json(courses)
}
```

#### Enrollments API

```typescript
// app/api/enrollments/route.ts
// POST /api/enrollments - Enroll in course
// GET /api/enrollments - Get user enrollments

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId, enrollKey } = await request.json()

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.enrollKey !== enrollKey) {
    return Response.json({ error: "Invalid enrollment key" }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: session.user.id,
      courseId
    }
  })

  return Response.json(enrollment, { status: 201 })
}
```

---

## 6. SWR Implementation

### Global Configuration

```typescript
// lib/swr-config.ts
import { SWRConfiguration } from 'swr'

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0, // Disable polling by default
  errorRetryCount: 3,
  onError: (error) => {
    console.error('SWR Error:', error)
    toast.error('Error al cargar datos')
  }
}

export const cacheKeys = {
  studentDashboard: () => '/api/student/dashboard-stats',
  studentCourses: () => '/api/student/enrolled-courses',
  publishedCourses: () => '/api/courses/published',
  course: (id: string) => `/api/courses/${id}`,
  courseTopics: (id: string) => `/api/courses/${id}/topics`
}
```

### SWR Provider

```typescript
// components/providers/swr-provider.tsx
"use client"

import { SWRConfig } from "swr"
import { swrConfig } from "@/lib/swr-config"
import { Toaster } from "sonner"

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
      <Toaster position="bottom-right" richColors />
    </SWRConfig>
  )
}
```

### Data Hooks

```typescript
// hooks/use-dashboard-data.ts
"use client"

import useSWR from "swr"
import { cacheKeys } from "@/lib/swr-config"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR(
    cacheKeys.studentDashboard(),
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true
    }
  )

  return {
    stats: data,
    isLoading,
    hasError: !!error,
    error,
    refresh: () => mutate()
  }
}
```

### Optimistic Mutations

```typescript
// hooks/use-mutations.ts
import useSWRMutation from 'swr/mutation'
import { mutate } from 'swr'

export function useMutations() {
  const enroll = useSWRMutation(
    '/api/enrollments',
    async (url: string, { arg }: { arg: EnrollmentData }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg)
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message)
      }
      
      return res.json()
    },
    {
      onSuccess: () => {
        mutate(cacheKeys.studentCourses())
        mutate(cacheKeys.studentDashboard())
        toast.success('¡Inscripción exitosa!')
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )

  return { enroll: enroll.trigger, isEnrolling: enroll.isMutating }
}
```

---

## 7. Authentication (Auth.js v5)

### Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Email/password auth logic
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  }
})
```

### API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

---

## 8. Implementation Status

### ✅ Phase 1: SWR Foundation (COMPLETED)
- [x] Install SWR v2.4.1
- [x] Create SWR configuration (`lib/swr-config.ts`)
- [x] Build SWR provider component
- [x] Create TypeScript interfaces for SWR responses
- [x] Build utility hooks for different data patterns

### ✅ Phase 2: Dashboard Optimization (COMPLETED)
- [x] Create specialized dashboard hooks
- [x] Replace manual state management with SWR
- [x] Build intelligent loading skeletons
- [x] Add SWR debug panel for development

### ✅ Phase 3: Optimistic Updates & Mutations (COMPLETED)
- [x] Create optimistic mutation hooks
- [x] Integrate mutations into UI components
- [x] Add loading states during mutations
- [x] Verify all functionality works

### ✅ Phase 4: Hybrid Architecture (COMPLETED)
- [x] Decide architecture based on use case (pragmatic approach)
- [x] Create `/dashboard` hub with role-based redirects
- [x] Update login/register forms with proper redirects
- [x] Implement Server Actions for teacher features
- [x] Keep API Routes + SWR for student features

### ✅ Teacher Dashboard & Analytics (COMPLETED)
- [x] Create teacher Server Actions (`lib/actions/teacher.ts`)
  - Dashboard: `getTeacherDashboardData()`
  - Analytics: `getStudentAnalytics()`, `updateStudentProfile()`
  - Courses: `createCourse()`, `updateCourse()`, `deleteCourse()`
  - Topics: `getCourseTopics()`, `createTopic()`, `updateTopic()`, `deleteTopic()`
  - Quizzes: `getTopicQuizzes()`, `createQuiz()`, `updateQuiz()`, `deleteQuiz()`
  - Questions: `getQuizQuestions()`, `createQuestion()`, `updateQuestion()`, `deleteQuestion()`
- [x] Build UI Components:
  - `teacher-stats.tsx` - Dashboard statistics cards
  - `teacher-courses-list.tsx` - Course listing with actions
  - `create-course-form.tsx` - Course creation form
  - `topic-creator-data.tsx` - Topic management CRUD
  - `student-analytics-data.tsx` - Learning profiles & anxiety metrics
  - `quiz-manager.tsx` - Quiz CRUD interface
- [x] Create Routes:
  - `/teacher` - Main dashboard
  - `/teacher/courses/create` - Create course
  - `/teacher/courses/[id]/topics` - Topic management
  - `/teacher/analytics` - Student analytics
  - `/teacher/topics/[topicId]/quizzes` - Quiz management
- [x] Implement Features:
  - Course creation with auto-generated enroll keys
  - Topic CRUD with inline editing
  - Student analytics with radar charts and anxiety tracking
  - Quiz management with passing scores, time limits, attempts

### 🚧 Phase 5: Quiz Question Management (IN PROGRESS)
- [x] Database schema for Quiz, Question, QuizAttempt
- [x] Server Actions for question CRUD
- [ ] UI for creating/editing questions
- [ ] Dynamic forms based on question type
- [ ] Question preview component
- [ ] Drag & drop question reordering

### 📋 Phase 6: Student Quiz Taking (PLANNED)
- [ ] Student quiz interface
- [ ] Timer functionality
- [ ] Anxiety metrics tracking during quiz
- [ ] Submit and grade quiz
- [ ] Show results and feedback
- [ ] Allow retakes based on maxAttempts

### 📊 Architecture Decision Matrix

| Feature | Solution | Reason |
|---------|----------|--------|
| Teacher Dashboard (read) | **Server Actions** | SSR, no extra endpoint, cost-effective |
| Teacher CRUD (mutations) | **Server Actions** | Simple mutations, no optimistic updates needed |
| Student Dashboard (read) | **API Routes + SWR** | Caching, auto-revalidation |
| Student Enrollment (mutation) | **API Routes + SWR** | Optimistic updates, better UX |
| User Registration | **API Route** | Immediate feedback needed |
| Role-based redirects | **Server Component** | Check session, redirect |
| Analytics Dashboard | **Server Actions** | Complex queries, SSR preferred |

---

## 9. Teacher Features Implementation

### Server Actions (lib/actions/teacher.ts)

All teacher features use Server Actions for direct database access. Each action:
- Verifies authentication via `auth()`
- Checks teacher role
- Validates ownership of resources
- Returns typed data or throws errors

**Dashboard & Analytics:**
```typescript
getTeacherDashboardData()     // Course stats, student counts
getStudentAnalytics()          // Learning profiles, anxiety metrics
updateStudentProfile()         // Manual profile override
```

**Course Management:**
```typescript
createCourse(data)             // Auto-generates enroll key
updateCourse(id, data)         // Update title, description, publish status
deleteCourse(id)               // Cascade deletes topics, quizzes
```

**Topic Management:**
```typescript
getCourseTopics(courseId)      // List all topics with order
createTopic(data)              // Title, content, order
updateTopic(id, data)          // Inline editing
deleteTopic(id)                // Remove topic
```

**Quiz Management:**
```typescript
getTopicQuizzes(topicId)       // List quizzes with question counts
createQuiz(data)               // Passing score, attempts, time limit
updateQuiz(id, data)           // Edit quiz parameters
deleteQuiz(id)                 // Remove quiz and questions
```

**Question Management:**
```typescript
getQuizQuestions(quizId)       // List questions with order
createQuestion(data)           // Type, text, options, points
updateQuestion(id, data)       // Edit question
deleteQuestion(id)             // Remove question
```

### UI Components

**Layout & Navigation:**
- `teacher-layout-client.tsx` - Sidebar with route detection
- `teacher-sidebar.tsx` - Navigation menu

**Dashboard:**
- `teacher-stats.tsx` - Stats cards (courses, students, topics)
- `teacher-courses-list.tsx` - Course cards with dropdown actions

**Course & Topic Management:**
- `create-course-form.tsx` - Form with enroll key generator
- `topic-creator-data.tsx` - Topic CRUD with inline editing

**Analytics:**
- `student-analytics-data.tsx` - Learning profiles, anxiety charts
  - Sortable table with search
  - Profile detail dialog with radar charts
  - Anxiety metrics over multiple sessions
  - Manual profile change with confirmation

**Quiz Management:**
- `quiz-manager.tsx` - Quiz CRUD interface
  - Create quiz with parameters (passing score, attempts, time)
  - Edit quiz inline
  - Publish/unpublish toggle
  - Delete with confirmation
  - Navigate to question management

### Routes

```
/teacher                                    # Dashboard
/teacher/courses/create                     # Create course
/teacher/courses/[id]/topics                # Topic management
/teacher/analytics                          # Student analytics
/teacher/topics/[topicId]/quizzes           # Quiz management
/teacher/quizzes/[id]/questions             # Question management (TODO)
```

---

## 10. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth.js
AUTH_SECRET="generate-with-openssl"
AUTH_URL="http://localhost:3000"

# OAuth (if using Google)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Admin
ADMIN_EMAILS="admin@example.com,another@example.com"
```

---

## 11. Notes & Decisions

### Architecture Decisions

1. **Hybrid Approach (Server Actions + API Routes)**
   - Server Actions for teacher features: SSR, cost-effective, direct DB access
   - API Routes + SWR for student features: Caching, optimistic updates
   - Choose based on use case, not dogma

2. **SWR over React Query**
   - Simpler API for Next.js
   - Built-in SSR support
   - Stable with Next.js 16

3. **Optimistic Updates (Student Side)**
   - Instant UI feedback for enrollments
   - Automatic rollback on errors
   - Better user experience

4. **Server-Side Rendering (Teacher Side)**
   - Reduce serverless function costs
   - Faster initial page loads
   - No unnecessary API overhead

### Security Notes

- All API routes validate session with `auth()`
- All Server Actions check user role and ownership
- Role-based access control throughout
- Enrollment keys stored in plain text (can be hashed later)
- Admin emails controlled via environment variable
- Quiz answers validated server-side

### Performance Goals

**Student Features (SWR):**
- **80% reduction** in API calls (via caching)
- **95% faster** cached data loading
- **Instant** UI updates for mutations
- **Automatic** background revalidation

**Teacher Features (Server Actions):**
- **Zero** API overhead for reads
- **Direct** database queries
- **SSR** for instant page loads
- **Cost-effective** serverless usage

---

## 12. Next Steps

### Immediate
1. ✅ Hybrid architecture implemented
2. ✅ Teacher dashboard complete
3. ✅ Analytics with learning profiles
4. ✅ Quiz management system
5. 🚧 Question management UI (IN PROGRESS)

### Short Term
- Complete question creation interface
- Implement student quiz-taking interface
- Add anxiety tracking during quizzes
- File upload system for topic media
- Add proper error boundaries

### Medium Term
- Question bank with tags and difficulty levels
- Automatic quiz generation from question bank
- Progress tracking dashboard for students
- Email notifications for quiz results
- Bulk import questions (CSV/JSON)

### Long Term
- Real-time collaboration features
- Advanced analytics and ML insights
- Adaptive quiz difficulty
- Gamification system
- Mobile app

---

**Last Updated**: 2026-03-25  
**Status**: Hybrid Architecture Stable - Teacher Features Complete
