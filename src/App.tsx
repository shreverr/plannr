import './App.css'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LayoutDashboard, Plus, FolderOpen, Users, School, Settings } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h2 className="text-lg font-medium">Dashboard</h2>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">Across all plans</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">+3 new this semester</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Current semester</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Plans */}
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

          {/* Quick Actions */}
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
        </div>
      </main>
    </div>
  )
}

export default App
