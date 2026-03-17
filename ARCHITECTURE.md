# Tutor Inteligente SS - Architecture Plan

> **Status**: Pending Implementation  
> **Last Updated**: 2026-03-16

---

## 1. Dependencies

### To Install
- [ ] `@auth/prisma-adapter` - Auth.js Prisma adapter
- [ ] `next-auth@beta` - Auth.js v5
- [ ] `prisma` - ORM (dev dependency)
- [ ] `@prisma/client` - Prisma client (production)

### Current Dependencies (Already Installed)
- Next.js 16
- React 19
- Zod
- react-hook-form
- @hookform/resolvers
- shadcn/ui components
- Tailwind CSS

---

## 2. Database Schema (Prisma + PostgreSQL)

### Models

```prisma
// schema.prisma outline (Prisma v7)

datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  emailVerified DateTime?    // Required for Auth.js
  name         String?
  image        String?
  role         Role          @default(STUDENT)
  password     String?       // Nullable - only for email auth
  accounts     Account[]
  sessions     Session[]
  courses      Course[]      @relation("TeacherCourses")
  enrollments  Enrollment[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Course {
  id           String        @id @default(cuid())
  title        String
  description  String?
  enrollKey    String        @unique  // One key per course for student enrollment
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
  enrolledAt  DateTime  @default(now())

  @@unique([userId, courseId])
}

model Topic {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Schema Notes
- `enrollKey` is unique per course - students enter this key to enroll
- `role` defaults to STUDENT on registration
- Admin emails will be checked at registration/login time (not in schema)

---

## 3. Authentication (Auth.js v5)

### Configuration Files

```
lib/
├── db.ts                # Prisma client singleton (with v7 adapter)
├── auth.ts              # Auth.js main config
└── admin.ts             # Admin email helpers
```

### Prisma v7 Configuration
- **prisma.config.ts** - Contains database URL configuration for migrations
- **lib/db.ts** - Uses PostgreSQL adapter for database connections
- **No url in schema** - Database URL moved to prisma.config.ts

### Auth Features
- **Google OAuth** for social login
- **Email/Password** for admin panel access
- **Role-based sessions** - session includes user role

### Admin Access Control

```typescript
// lib/admin.ts
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? []

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}

export async function getUserRole(email: string): Promise<Role> {
  if (isAdminEmail(email)) return "ADMIN"
  // Check if user is teacher (from database)
  const user = await prisma.user.findUnique({ where: { email } })
  return user?.role ?? "STUDENT"
}
```

### Environment Variables Required
```
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-with-openssl"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAILS="admin@example.com,another@example.com"
```

---

## 4. Project Structure

```
app/
├── (auth)/                    # Authentication routes
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)/               # Protected routes
│   ├── student/
│   │   ├── courses/
│   │   ├── progress/
│   │   └── page.tsx
│   ├── teacher/
│   │   ├── courses/
│   │   ├── create/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── users/
│   │   └── page.tsx
│   └── layout.tsx
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── layout.tsx
└── page.tsx
lib/
├── db.ts                      # Prisma client singleton (v7 with adapter)
├── auth.ts                    # Auth.js config
├── admin.ts                   # Admin helpers
├── utils.ts                   # Utility functions (existing)
├── actions/                   # Server actions
│   ├── auth.ts                # Auth actions (login, register)
│   ├── courses.ts             # Course CRUD
│   ├── enrollments.ts         # Enrollment actions
│   └── topics.ts              # Topic CRUD
└── validations/               # Zod schemas
    ├── auth.ts
    ├── course.ts
    └── enrollment.ts
components/
├── auth/                      # Auth components
│   ├── login-form.tsx
│   └── register-form.tsx
├── ui/                        # shadcn/ui (existing)
└── dashboard/                 # Dashboard components (existing lms/)
prisma/
├── schema.prisma              # Schema without URL (Prisma v7)
└── seed.ts                    # (future - not needed now)
prisma.config.ts               # Prisma v7 configuration file
.env                           # Environment variables
.env.example                   # Template
```

---

## 5. Server Actions Pattern

### Example Structure

```typescript
// lib/actions/courses.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createCourseSchema } from "@/lib/validations/course"
import { revalidatePath } from "next/cache"

export async function createCourse(data: CreateCourseInput) {
  const session = await auth()
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized")
  }

  const validated = createCourseSchema.parse(data)
  
  const course = await prisma.course.create({
    data: {
      ...validated,
      teacherId: session.user.id,
    },
  })

  revalidatePath("/teacher/courses")
  return course
}
```

---

## 6. Route Protection

### Middleware Pattern
```typescript
// middleware.ts
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

### Server-Side Protection
```typescript
// In server actions or page components
const session = await auth()
if (!session?.user || session.user.role !== "ADMIN") {
  throw new Error("Unauthorized")
}
```

---

## 7. Enrollment Flow

### Student Enrollment
1. Student views available courses (public list)
2. Enters course enrollment key
3. Server validates key against `Course.enrollKey`
4. If valid, creates `Enrollment` record
5. Student gains access to course content

```typescript
// lib/actions/enrollments.ts
export async function enrollInCourse(courseId: string, key: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Must be logged in")

  const course = await prisma.course.findUnique({ 
    where: { id: courseId } 
  })
  
  if (!course || course.enrollKey !== key) {
    throw new Error("Invalid enrollment key")
  }

  return prisma.enrollment.create({
    data: {
      userId: session.user.id,
      courseId,
    },
  })
}
```

---

## 8. Implementation Steps

### Step 1: Install Dependencies
- [x] Install Prisma and Auth.js packages

### Step 2: Database Setup
- [x] Create Prisma schema
- [x] Upgrade to Prisma v7 (removed url from schema)
- [x] Create prisma.config.ts for v7 configuration
- [x] Update PrismaClient to use PostgreSQL adapter
- [x] Generate Prisma client
- [x] Set up environment variables

### Step 3: Auth Configuration
- [x] Create lib/db.ts (Prisma singleton)
- [x] Create lib/auth.ts (Auth.js config)
- [x] Create lib/admin.ts (Admin helpers)
- [x] Set up API route handler

### Step 4: Server Actions
- [x] Create auth actions (login/register)
- [x] Create course actions
- [x] Create enrollment actions

### Step 5: Protected Routes
- [x] Create (auth) route group with login/register pages
- [x] Create (dashboard) route group
- [ ] Add middleware for protection (optional - using layout redirect)
- [x] Create role-based page components

### Step 6: UI Components
- [x] Create auth forms (login/register)
- [x] Integrate with server actions

---

## 9. Current Implementation Status

| Step | Status |
|------|--------|
| Install Dependencies | ✅ Complete |
| Database Setup | ✅ Complete |
| Auth Configuration | ✅ Complete |
| Server Actions | ✅ Complete |
| Protected Routes | ✅ Complete |
| UI Components | ✅ Complete |

---

## 10. Next Steps (Pending)

- [ ] Set up PostgreSQL database
- [ ] Configure Google OAuth credentials in .env
- [ ] Add admin emails to ADMIN_EMAILS in .env
- [ ] Run database migration: `pnpm prisma migrate dev`
- [ ] Create teacher course management pages
- [ ] Create student course browsing/enrollment
- [ ] Add middleware for route protection

---

## 10. Notes & Decisions

- **No email service** for password reset (not a functional requirement yet)
- **No demo data** - will add later after interface requirements are finalized
- **Enrollment keys** are teacher-generated, stored in plain text (can be hashed later if needed)
- **Admin emails** controlled via environment variable `ADMIN_EMAILS`
