"use client"

import { useState } from "react"
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Search,
  Eye,
  Ear,
  Hand,
  ArrowUpDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { students, courses, type Student, type StudyProfile, type AnxietyLevel } from "@/lib/lms-data"

const profileIcons: Record<StudyProfile, React.ElementType> = {
  Visual: Eye,
  Auditory: Ear,
  Kinesthetic: Hand,
}

const profileColors: Record<StudyProfile, string> = {
  Visual: "bg-accent/10 text-accent",
  Auditory: "bg-primary/10 text-primary",
  Kinesthetic: "bg-warning/10 text-warning-foreground",
}

const anxietyColors: Record<AnxietyLevel, { bg: string; text: string; dot: string }> = {
  Low: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  Medium: { bg: "bg-warning/10", text: "text-warning-foreground", dot: "bg-warning" },
  High: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
}

type SortKey = "name" | "score" | "progress" | "anxiety"

export function StudentAnalytics() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortAsc, setSortAsc] = useState(true)

  const filteredStudents = students
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      switch (sortKey) {
        case "name":
          return dir * a.name.localeCompare(b.name)
        case "score":
          return dir * (a.averageScore - b.averageScore)
        case "progress":
          return dir * (a.progress - b.progress)
        case "anxiety": {
          const order: Record<AnxietyLevel, number> = { Low: 0, Medium: 1, High: 2 }
          return dir * (order[a.anxietyLevel] - order[b.anxietyLevel])
        }
        default:
          return 0
      }
    })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const totalStudents = students.length
  const avgScore = Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / totalStudents)
  const highAnxiety = students.filter((s) => s.anxietyLevel === "High").length
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / totalStudents)

  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg. Score", value: `${avgScore}%`, icon: Award, color: "text-primary", bg: "bg-primary/10" },
    { label: "High Anxiety", value: highAnxiety, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Student Analytics</h1>
          <p className="text-muted-foreground">
            Monitor student performance, learning profiles, and interaction metrics.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-display text-lg">Enrolled Students</CardTitle>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3"
                        onClick={() => toggleSort("name")}
                      >
                        Student
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Profile
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3"
                        onClick={() => toggleSort("anxiety")}
                      >
                        Anxiety Level
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3"
                        onClick={() => toggleSort("score")}
                      >
                        Avg. Score
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3"
                        onClick={() => toggleSort("progress")}
                      >
                        Progress
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Courses
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const ProfileIcon = profileIcons[student.profile]
                    const anxiety = anxietyColors[student.anxietyLevel]

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                      >
                        {/* Student Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-card-foreground">
                              {student.name}
                            </span>
                          </div>
                        </td>

                        {/* Detected Profile Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${profileColors[student.profile]}`}
                          >
                            <ProfileIcon className="h-3 w-3" />
                            {student.profile}
                          </span>
                        </td>

                        {/* Anxiety Level */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${anxiety.bg} ${anxiety.text}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${anxiety.dot}`} />
                            {student.anxietyLevel}
                          </span>
                        </td>

                        {/* Average Score */}
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              student.averageScore >= 85
                                ? "text-success"
                                : student.averageScore >= 70
                                ? "text-warning-foreground"
                                : "text-destructive"
                            }`}
                          >
                            {student.averageScore}%
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Progress value={student.progress} className="h-2 w-24" />
                            <span className="text-sm text-muted-foreground">{student.progress}%</span>
                          </div>
                        </td>

                        {/* Enrolled Courses */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {student.enrolledCourses.map((courseId) => {
                              const course = courses.find((c) => c.id === courseId)
                              return course ? (
                                <span
                                  key={courseId}
                                  className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                >
                                  {course.title.split(" ")[0]}
                                </span>
                              ) : null
                            })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
