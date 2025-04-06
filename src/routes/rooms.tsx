import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import RoomsManagement from "@/pages/rooms"

export const Route = createFileRoute('/rooms')({ 
  component: () => (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header title="Rooms Management" />
        <div className="flex-1 p-6">
          <RoomsManagement />
        </div>
      </main>
    </>
  ),
})
