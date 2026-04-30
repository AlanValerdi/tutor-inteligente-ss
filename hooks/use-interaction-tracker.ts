"use client"

import { useRef, useEffect, useCallback } from "react"
import type { ResourceInteractionInput } from "@/lib/schemas/tracker/resource.schema"

interface UseInteractionTrackerOptions {
  topicId: string
  courseId: string
}

export function useInteractionTracker({ topicId, courseId }: UseInteractionTrackerOptions) {
  const startTimeRef = useRef(Date.now())
  const lastActivityRef = useRef(Date.now())
  const idleAccumulatedRef = useRef(0)
  const tabSwitchesRef = useRef(0)
  const missedClicksRef = useRef(0)
  const scrollReversalsRef = useRef(0)
  const consecutiveClicksRef = useRef(0)
  const copyAttemptsRef = useRef(0)
  const rightClickCountRef = useRef(0)
  const windowBlursRef = useRef(0)
  const clickTimestampsRef = useRef<number[]>([])
  const lastScrollPositionRef = useRef(0)
  const lastScrollDirectionRef = useRef<"up" | "down" | null>(null)
  const resourcesRef = useRef<ResourceInteractionInput[]>([])
  const isFlushedRef = useRef(false)

  const buildPayload = useCallback(
    () => ({
      topicId,
      courseId,
      totalTime: (Date.now() - startTimeRef.current) / 1000,
      idleTime: idleAccumulatedRef.current,
      tabSwitches: tabSwitchesRef.current,
      missedClicks: missedClicksRef.current,
      scrollReversals: scrollReversalsRef.current,
      consecutiveClicks: consecutiveClicksRef.current,
      copyAttempts: copyAttemptsRef.current,
      rightClickCount: rightClickCountRef.current,
      windowBlurs: windowBlursRef.current,
      resources: resourcesRef.current,
    }),
    [topicId, courseId]
  )

  // Async flush — used on React navigation (unmount). keepalive allows the
  // request to survive the component unmount during client-side routing.
  const flush = useCallback(async () => {
    if (isFlushedRef.current) return
    isFlushedRef.current = true
    try {
      await fetch("/api/tracker/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
        keepalive: true,
      })
    } catch (e) {
      console.error("[Tracker] flush failed", e)
    }
  }, [buildPayload])

  // Beacon flush — used on hard navigation / tab close. sendBeacon is
  // fire-and-forget and guaranteed to complete even after the page unloads.
  const flushBeacon = useCallback(() => {
    if (isFlushedRef.current) return
    isFlushedRef.current = true
    navigator.sendBeacon(
      "/api/tracker/sessions",
      new Blob([JSON.stringify(buildPayload())], { type: "application/json" })
    )
  }, [buildPayload])

  /** Register an individual resource interaction (video, slides, quiz, etc.) */
  const addResource = useCallback((resource: ResourceInteractionInput) => {
    resourcesRef.current = [...resourcesRef.current, resource]
  }, [])

  // ── Tab visibility ───────────────────────────────────────────────────────
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) tabSwitchesRef.current++
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [])

  // ── Click tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const now = Date.now()
      const ts = clickTimestampsRef.current
      ts.push(now)
      if (ts.length > 5) ts.shift()

      // 3+ clicks within 1 s → consecutive click burst
      if (ts.filter(t => now - t < 1000).length >= 3) {
        consecutiveClicksRef.current++
        clickTimestampsRef.current = []
      }

      // Click outside any interactive element → missed click
      const target = e.target as HTMLElement
      const interactive = target.closest(
        'button, input, label, a, select, textarea, [role="button"], [role="link"], [role="option"]'
      )
      if (!interactive && target.tagName !== "BODY" && target.tagName !== "HTML") {
        missedClicksRef.current++
      }

      lastActivityRef.current = now
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  // ── Scroll tracking ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const pos = window.scrollY
      const dir: "up" | "down" = pos > lastScrollPositionRef.current ? "down" : "up"
      if (lastScrollDirectionRef.current && lastScrollDirectionRef.current !== dir) {
        scrollReversalsRef.current++
      }
      lastScrollPositionRef.current = pos
      lastScrollDirectionRef.current = dir
      lastActivityRef.current = Date.now()
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ── Copy attempts ────────────────────────────────────────────────────────
  useEffect(() => {
    const onCopy = () => { copyAttemptsRef.current++ }
    document.addEventListener("copy", onCopy)
    return () => document.removeEventListener("copy", onCopy)
  }, [])

  // ── Right-click ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onContextMenu = () => { rightClickCountRef.current++ }
    document.addEventListener("contextmenu", onContextMenu)
    return () => document.removeEventListener("contextmenu", onContextMenu)
  }, [])

  // ── Window blur (alt-tab / app switch) ───────────────────────────────────
  useEffect(() => {
    const onBlur = () => { windowBlursRef.current++ }
    window.addEventListener("blur", onBlur)
    return () => window.removeEventListener("blur", onBlur)
  }, [])

  // ── Idle time accumulation ───────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current
      if (idle > 5000) {
        idleAccumulatedRef.current += Math.floor(idle / 1000)
        lastActivityRef.current = Date.now()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ── Flush on page unload / component unmount ─────────────────────────────
  useEffect(() => {
    const onBeforeUnload = () => flushBeacon()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      // Fires on React-router navigation (client-side route change)
      flush()
    }
  }, [flush, flushBeacon])

  return { addResource, flush }
}
