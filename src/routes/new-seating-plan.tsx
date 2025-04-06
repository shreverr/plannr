import NewSeatingPlan from '@/pages/new-seating-plan'
import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export const Route = createFileRoute('/new-seating-plan')({
  component: () => (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header title="New Seating Plan" />
        <div className="flex-1 p-6">
          <NewSeatingPlan />
        </div>
      </main>
    </>
  ),
})
