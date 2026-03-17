import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface HeaderProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          Bienvenido, {user.name || "Usuario"}
        </h1>
        <span className="text-sm text-gray-500 capitalize">
          ({user.role.toLowerCase()})
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
