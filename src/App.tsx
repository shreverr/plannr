import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import { RootLayout } from "@/components/layout/root-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentPlans } from "@/components/dashboard/recent-plans"
import { QuickActions } from "@/components/dashboard/quick-actions"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="plannr-theme">
      <RootLayout>
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Header title="Dashboard" />
          <div className="flex-1 p-6 space-y-6">
            <DashboardStats />
            <RecentPlans />
            <QuickActions />
          </div>
        </main>
      </RootLayout>
    </ThemeProvider>
  )
}

export default App
