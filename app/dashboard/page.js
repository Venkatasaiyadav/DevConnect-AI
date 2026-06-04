"use client";

import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Search, Sparkles, Bell } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 text-slate-300">
        {/* Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 shadow-sm">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-90 transition-opacity">
            <span className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-sky-400 to-purple-500 text-black font-extrabold text-sm">
              🧠
            </span>
            DevConnect AI
          </Link>

          <div className="hidden md:flex relative w-full max-w-md mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search discussions, tags, error codes..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <Sparkles className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-sm border-2 border-slate-800">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Feed Section */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Composer */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 shadow-sm focus-within:border-sky-400/50 transition-colors">
                <textarea
                  placeholder="What are you working on? Ask a question or share code..."
                  className="w-full min-h-[80px] bg-transparent border-none resize-none text-white placeholder-slate-500 focus:outline-none text-sm"
                />
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/50">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-slate-700 text-slate-300 hover:bg-white/10 cursor-pointer">#javascript</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-400/10 border border-sky-400 text-sky-400 cursor-pointer">#react</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-slate-700 text-slate-300 hover:bg-white/10 cursor-pointer">#nextjs</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-300">
                      <input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" />
                      Ask AI Assistant
                    </label>
                  </div>
                  <button className="px-5 py-2 bg-sky-400 hover:bg-sky-500 text-slate-900 font-bold rounded-lg text-sm transition-colors">
                    Post
                  </button>
                </div>
              </div>

              {/* Feed Filters */}
              <div className="flex gap-2 border-b border-slate-700/50 pb-px overflow-x-auto">
                <button className="px-4 py-2 text-sm font-medium text-sky-400 border-b-2 border-sky-400">For You</button>
                <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Following</button>
                <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">AI Reviewed</button>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-800/30 border border-slate-700/30 rounded-xl border-dashed">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No posts to show yet</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  Welcome to DevConnect AI! Start the conversation by asking a coding question or sharing your latest snippet above.
                </p>
              </div>

            </div>

            {/* Right Sidebar */}
            <aside className="w-full md:w-80 flex flex-col gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Welcome, {user?.displayName || "Developer"}</h3>
                <p className="text-sm text-slate-400 mb-4">
                  You are successfully authenticated and ready to collaborate. Your developer profile is active.
                </p>
                <div className="text-xs text-slate-500 font-mono break-all bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  {user?.email}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-sky-400 hover:underline cursor-pointer">#nextjs15</span>
                  <span className="text-xs font-medium text-slate-300 hover:underline cursor-pointer">#tailwindv4</span>
                  <span className="text-xs font-medium text-purple-400 hover:underline cursor-pointer">#ai-agents</span>
                  <span className="text-xs font-medium text-slate-300 hover:underline cursor-pointer">#typescript</span>
                </div>
              </div>
            </aside>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}