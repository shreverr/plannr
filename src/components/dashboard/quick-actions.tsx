import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

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
            <Button className="w-full">Start New Plan</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Import Student Data</CardTitle>
            <CardDescription>Update student information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Import Data</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}