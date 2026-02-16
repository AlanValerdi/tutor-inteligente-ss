"use client"

import { useState } from "react"
import { Upload, FileText, Video, Headphones, Plus, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { courses } from "@/lib/lms-data"

export function TopicCreator() {
  const [submitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [duration, setDuration] = useState("")

  const handleSubmit = () => {
    if (title && description && selectedCourse && duration) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setTitle("")
        setDescription("")
        setSelectedCourse("")
        setDuration("")
      }, 3000)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Create New Topic</h1>
          <p className="text-muted-foreground">
            Add a new topic to a course with content for each learning profile.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {submitted && (
            <Card className="mb-6 border-success/30 bg-success/5">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-sm font-medium text-success">
                  Topic created successfully! It has been added to the course.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">Topic Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Derivatives"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this topic covers..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="duration">Estimated Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 45 min"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">Learning Profile Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload distinct media for each learning profile. Students will see
                content matching their detected style.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Visual Profile Upload */}
              <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Visual Profile
                  </h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Upload video content, diagrams, or infographics for visual learners.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Video
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent">
                    <FileText className="h-3.5 w-3.5" />
                    Upload PDF
                  </Button>
                </div>
              </div>

              {/* Auditory Profile Upload */}
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Headphones className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Auditory Profile
                  </h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Upload audio lectures, podcasts, or narrated content for auditory learners.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Audio
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                    <FileText className="h-3.5 w-3.5" />
                    Upload Transcript
                  </Button>
                </div>
              </div>

              {/* Kinesthetic Profile Upload */}
              <div className="rounded-xl border border-dashed border-warning/40 bg-warning/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-5 w-5 text-warning" />
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Kinesthetic Profile
                  </h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Upload interactive exercises, worksheets, or hands-on activity guides.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2 border-warning/30 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Exercise
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-warning/30 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Upload PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">Topic Quiz</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add quiz questions that all students must pass to proceed.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <Plus className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-card-foreground mb-1">Add Quiz Questions</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Create multiple-choice questions for this topic.
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Add Question
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-3 pb-8">
            <Button variant="outline">Save as Draft</Button>
            <Button className="gap-2" onClick={handleSubmit}>
              <Plus className="h-4 w-4" />
              Create Topic
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
