import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, FolderOpen, Users, School } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center border-b px-6">
          <h1 className="text-2xl font-bold tracking-tight">Plannr</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Plus className="h-5 w-5" />
            New Plan
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FolderOpen className="h-5 w-5" />
            Recent Plans
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="h-5 w-5" />
            Students
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <School className="h-5 w-5" />
            Rooms
          </Button>
        </nav>
      </div>
    </aside>
  )
}