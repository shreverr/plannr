import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"

export function QuickActions() {
  return (
    <section>
      <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Plan</CardTitle>
            <CardDescription>Generate a new seating arrangement</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/new-seating-plan">Start New Plan</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Rooms</CardTitle>
            <CardDescription>Upload and manage room information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/rooms">Manage Rooms</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}