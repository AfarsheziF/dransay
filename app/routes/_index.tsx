import Layout from "~/components/Layout";

export default function Index() {
  return (
    <Layout>
      <div className="text-center">
        {/* Hero Section */}
        <div className="mb-12 animate-fadeIn">
          <h1 className="text-5xl font-extrabold text-white mb-6">
            Welcome to Task Manager
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            A modern, full-stack task management application built with Remix,
            tRPC, and Drizzle. Learning exercise based on dransay stack.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/dashboard" className="btn btn-primary btn-lg">
              🚀 Get Started
            </a>
            <a href="/health" className="btn btn-secondary btn-lg">
              📊 View Health
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="card card-glass text-center animate-slideIn">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Fast & Modern</h3>
            <p className="text-gray-200">
              Built with the latest web technologies including Remix, tRPC, and
              TypeScript.
            </p>
          </div>

          <div
            className="card card-glass text-center animate-slideIn"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-white mb-3">Beautiful UI</h3>
            <p className="text-gray-200">
              Gorgeous glassmorphism design with smooth animations and modern
              aesthetics.
            </p>
          </div>

          <div
            className="card card-glass text-center animate-slideIn"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold text-white mb-3">
              Developer Ready
            </h3>
            <p className="text-gray-200">
              Full-stack TypeScript with end-to-end type safety and excellent
              DX.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card card-solid mt-16 animate-fadeIn">
          <h2 className="text-2xl font-bold text-center mb-8">
            Built With Modern Technologies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">⚛️</div>
              <h4 className="font-semibold">React</h4>
              <p className="text-sm text-gray-600">UI Library</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🎵</div>
              <h4 className="font-semibold">Remix</h4>
              <p className="text-sm text-gray-600">Full-stack Framework</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🔷</div>
              <h4 className="font-semibold">TypeScript</h4>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🗄️</div>
              <h4 className="font-semibold">Drizzle</h4>
              <p className="text-sm text-gray-600">Database ORM</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
