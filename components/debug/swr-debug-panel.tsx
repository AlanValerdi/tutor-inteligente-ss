import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDashboardData, usePublishedCourses } from "@/hooks/use-dashboard-data"
import { toast } from "sonner"

export function SWRDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const dashboardData = useDashboardData()
  const courseCatalog = usePublishedCourses(false) // Start disabled

  // Track when data updates
  useEffect(() => {
    if (dashboardData.stats || dashboardData.enrolledCourses) {
      setLastUpdate(new Date())
      setRequestCount(prev => prev + 1)
    }
  }, [dashboardData.stats, dashboardData.enrolledCourses])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background shadow-lg"
        >
          SWR Debug
        </Button>
      </div>
    )
  }

  const testCacheInvalidation = () => {
    dashboardData.refresh()
    toast.info("Cache invalidated - data should refresh")
  }

  const testCourseCatalogFetch = () => {
    // This would trigger the course catalog fetch
    toast.info("Course catalog fetch would be triggered here")
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">SWR Debug Panel</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Dashboard Data Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Dashboard Data</span>
              <Badge variant={dashboardData.isLoading ? "secondary" : dashboardData.hasError ? "destructive" : "default"}>
                {dashboardData.isLoading ? "Loading" : dashboardData.hasError ? "Error" : "Ready"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Stats: {dashboardData.stats ? "✓ Loaded" : "✗ Not loaded"}</div>
              <div>Courses: {dashboardData.enrolledCourses ? `✓ ${dashboardData.enrolledCourses.length} courses` : "✗ Not loaded"}</div>
              <div>Revalidating: {dashboardData.isValidating ? "Yes" : "No"}</div>
            </div>
          </div>

          <Separator />

          {/* Course Catalog Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Course Catalog</span>
              <Badge variant={courseCatalog.isLoading ? "secondary" : courseCatalog.hasError ? "destructive" : "outline"}>
                {courseCatalog.isLoading ? "Loading" : courseCatalog.hasError ? "Error" : "Cached"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              <div>Courses: {courseCatalog.data ? `${courseCatalog.data.length} available` : "Not fetched"}</div>
            </div>
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div>
            <div className="font-medium mb-2">Performance</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Requests: {requestCount}</div>
              <div>Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}</div>
            </div>
          </div>

          <Separator />

          {/* Test Actions */}
          <div className="space-y-2">
            <Button
              onClick={testCacheInvalidation}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Force Refresh Dashboard
            </Button>
            <Button
              onClick={testCourseCatalogFetch}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Test Course Catalog Fetch
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            This panel only appears in development mode
          </div>
        </CardContent>
      </Card>
    </div>
  )
}