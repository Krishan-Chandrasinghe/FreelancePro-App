import Link from "next/link";
import { ArrowRight, CheckCircle, LayoutDashboard, Clock, DollarSign, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold text-primary">FreelancePro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary-foreground bg-primary px-4 py-2 rounded-lg inline-block">
                  Manage Your Business with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                  The all-in-one project management solution for freelancers. Track projects, clients, time, and invoices in one place.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/register"
                >
                  Get Started
                </Link>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/login"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-primary">Key Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card shadow-sm">
                <Users className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Client Management</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Organize client details, contacts, and trial periods effortlessly.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card shadow-sm">
                <LayoutDashboard className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Project Tracking</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Keep track of all your projects, tasks, and deadlines in one view.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card shadow-sm">
                <Clock className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Time Tracking</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Log billable hours for every task and generate reports.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card shadow-sm">
                <DollarSign className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Invoicing & Expenses</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Create professional invoices and track your business expenses.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card shadow-sm">
                <CheckCircle className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Task Management</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Stay organized with a robust task list and progress tracking.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card shadow-sm">
                <ArrowRight className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Trial Tracking</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Monitor post-service free trial periods for your clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Streamline Your Business?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
                  Join thousands of freelancers who trust FreelancePro.
                </p>
              </div>
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md bg-background text-primary px-8 py-4 text-sm font-bold shadow transition-colors hover:bg-secondary"
                href="/register"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 FreelancePro. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
