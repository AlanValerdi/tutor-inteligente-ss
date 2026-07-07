"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PortalShellProps {
  portalTitle: string
  desktopSidebar: React.ReactNode
  renderMobileSidebar: (onClose: () => void) => React.ReactNode
  children: React.ReactNode
}

export function PortalShell({
  portalTitle,
  desktopSidebar,
  renderMobileSidebar,
  children,
}: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden shrink-0 md:block">{desktopSidebar}</div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-black/80 md:hidden"
            onClick={closeMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <div className="relative h-full">
              {renderMobileSidebar(closeMobile)}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-3 z-10 text-white hover:bg-white/10 md:hidden"
                onClick={closeMobile}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="truncate font-semibold">{portalTitle}</span>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
