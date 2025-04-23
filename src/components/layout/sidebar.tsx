import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, 
  // FolderOpen,
   School } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center border-b px-6">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Plannr
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            asChild
          >
            <Link to="/">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            asChild
          >
            <Link to="/new-seating-plan">
              <Plus className="h-5 w-5" />
              New Plan
            </Link>
          </Button>
          {/* <Button variant="ghost" className="w-full justify-start gap-2">
            <FolderOpen className="h-5 w-5" />
            Recent Plans
          </Button> */}
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/rooms">
              <School className="h-5 w-5" />
              Rooms
            </Link>
          </Button>
        </nav>
      </div>
    </aside>
  );
}
