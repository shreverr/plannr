import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function RecentPlans() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Plans</h3>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Mid-Term Examination</CardTitle>
            <CardDescription>Created on April 1, 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">300 Students</span>
              <span className="text-muted-foreground">5 Rooms</span>
            </div>
            <Button className="w-full mt-4" variant="outline">View Details</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Final Examination</CardTitle>
            <CardDescription>Created on March 15, 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">450 Students</span>
              <span className="text-muted-foreground">8 Rooms</span>
            </div>
            <Button className="w-full mt-4" variant="outline">View Details</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mock Test</CardTitle>
            <CardDescription>Created on March 1, 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">150 Students</span>
              <span className="text-muted-foreground">3 Rooms</span>
            </div>
            <Button className="w-full mt-4" variant="outline">View Details</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}