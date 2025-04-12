import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeakDash - Home',
  description: 'Create customized, data-driven dashboards with AI assistance',
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-4xl w-full bg-card rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
            BeakDash
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            A powerful dashboard creation platform with AI assistance
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Create Dashboards</h3>
              <p className="text-muted-foreground">
                Build interactive dashboards with customizable widgets
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Connect Data</h3>
              <p className="text-muted-foreground">
                Integrate with databases, APIs, and other data sources
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
              <p className="text-muted-foreground">
                Get intelligent suggestions and analysis from your data
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
              <p className="text-muted-foreground">
                Share dashboards with your team and collaborate in real-time
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium text-center"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-md font-medium text-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}