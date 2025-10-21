import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient">
      {/* Navigation Header */}
      <header className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-b border-white border-opacity-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Task Manager </h1>
            <p className="text-1xl text-italic text-white">
              Exercise for dransay interview
            </p>
            <nav className="flex space-x-6">
              <a
                href="/"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Home
              </a>
              <a
                href="/dashboard"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/health"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Health
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {title && (
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-4xl font-extrabold text-white mb-2">{title}</h1>
            <div className="w-24 h-1 bg-white bg-opacity-50 rounded-full"></div>
          </div>
        )}

        <div className="animate-slideIn">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-t border-white border-opacity-20 mt-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-white text-sm">
            <p>
              &copy; 2025 Task Manager - Interview Prep Stack by{" "}
              <b>Or Sarfati</b>{" "}
            </p>
            <div style={{ fontWeight: "bold", marginTop: "0.5rem" }}>
              <a
                href="https://github.com/afarshezif/task-manager-interview-prep"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <span> - </span>
              <a
                href="https://www.linkedin.com/in/or-sarfati/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <span> - </span>
              <a
                href="https://orsarfati.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
