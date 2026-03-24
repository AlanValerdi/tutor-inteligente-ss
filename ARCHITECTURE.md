# Tutor Inteligente SS - Architecture Plan

> **Status**: Phase 3 Complete - SWR Implementation  
> **Last Updated**: 2026-03-18

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

### Current Architecture: API Routes + SWR

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React UI      │────▶│    SWR Hooks    │────▶│   API Routes    │
│   Components    │◀────│   (Client)       │◀────│   (Next.js)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │ Cache
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │  SWR Cache      │
                        │  (Optimistic)   │
                        │                 │
                        └─────────────────┘
```

### Key Principles

1. **No Server Actions** - All mutations go through API Routes
2. **SWR for All Data Fetching** - Automatic caching, revalidation, and optimistic updates
3. **RESTful API Design** - Standard HTTP methods and status codes
4. **Type-Safe APIs** - Shared types between client and server

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
  id           String        @id @default(cuid())
  email        String        @unique
  emailVerified DateTime?
  name         String?
  image        String?
  role         Role          @default(STUDENT)
  password     String?
  accounts     Account[]
  sessions     Session[]
  courses      Course[]      @relation("TeacherCourses")
  enrollments  Enrollment[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
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
  id          String    @id @default(cuid())
  userId      String
  courseId    String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progress    Int       @default(0)
  completedTopics Int   @default(0)
  lastAccessedAt DateTime?
  enrolledAt  DateTime  @default(now())

  @@unique([userId, courseId])
}

model Topic {
  id        String   @id @default(cuid())
  title     String
  description String?
  position  Int
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}
```

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

### 🔄 Phase 4: Hybrid Architecture (API Routes + Server Actions) (IN PROGRESS)
- [x] Decide architecture based on use case (pragmatic approach)
- [x] Remove old Server Actions
- [x] Create `/dashboard` hub with role-based redirects
- [x] Update login/register forms with proper redirects
- [ ] Implement teacher course management
- [ ] Add real-time features if needed

### ✅ Teacher Dashboard Implementation (COMPLETED)
- [x] Create teacher Server Actions (`lib/actions/teacher.ts`)
  - `getTeacherDashboardData()` - Fetch courses and stats
  - `createCourse()`, `updateCourse()`, `deleteCourse()`
- [x] Build TeacherStats component
- [x] Build TeacherCoursesList component
- [x] Connect dashboard page with real data

### 📊 Architecture Decision Matrix

| Feature | Solution | Reason |
|---------|----------|--------|
| Teacher Dashboard (read) | **Server Actions** | SSR, no extra endpoint |
| Student Enrollment (mutation) | **API Routes + SWR** | Optimistic updates, better UX |
| User Registration | **API Route** | Immediate feedback needed |
| Role-based redirects | **Server Component** | Check session, redirect |

---

## 9. Migration Plan: Server Actions → API Routes

### Files to Delete
- `lib/actions/` (entire directory)

### Files to Create/Update
- `app/api/auth/[...nextauth]/route.ts` ✅ Exists
- `app/api/courses/route.ts` - Create/Update
- `app/api/courses/published/route.ts` ✅ Exists
- `app/api/courses/[id]/route.ts` - Create
- `app/api/enrollments/route.ts` - Create
- `app/api/topics/route.ts` - Create/Update
- `app/api/student/dashboard-stats/route.ts` ✅ Exists
- `app/api/student/enrolled-courses/route.ts` ✅ Exists

### Components to Update
- `components/auth/register-form.tsx` - Use API route
- `app/(student)/student/courses/page.tsx` - Use SWR hook
- `app/(student)/student/courses/[courseId]/page.tsx` - Use SWR hook
- `components/teacher/teacher-layout-client.tsx` - Update logout
- `components/admin/admin-layout-client.tsx` - Update logout
- `components/dashboard/student-portal-wrapper.tsx` - Update logout

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

1. **API Routes over Server Actions**
   - Better interoperability (can be called from anywhere)
   - Standard HTTP semantics
   - Easier to test and debug
   - SWR provides caching/optimistic updates

2. **SWR over React Query**
   - Simpler API for Next.js
   - Built-in SSR support
   - Stable with Next.js 16

3. **Optimistic Updates**
   - Instant UI feedback
   - Automatic rollback on errors
   - Better user experience

### Security Notes

- All API routes validate session with `auth()`
- Role-based access control in API routes
- Enrollment keys stored in plain text (can be hashed later)
- Admin emails controlled via environment variable

### Performance Goals

- **80% reduction** in API calls (via SWR caching)
- **95% faster** cached data loading
- **Instant** UI updates for mutations
- **Automatic** background revalidation

---

## 12. Next Steps

### Immediate (This Session)
1. ✅ Remove `lib/actions/` directory
2. ✅ Update ARCHITECTURE.md
3. Create missing API routes
4. Update components to use API routes
5. Test end-to-end flow

### Short Term
- Add proper error boundaries
- Implement loading skeletons for all views
- Add pagination to course lists
- Create teacher course management UI

### Long Term
- Add real-time notifications
- Implement file uploads (course images)
- Add email notifications
- Performance monitoring

---

**Last Updated**: 2026-03-18  
**Status**: Migrating to API Routes architecture
