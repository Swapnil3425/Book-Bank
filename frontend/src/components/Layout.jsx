// frontend/src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 md:p-6">
      <div className="flex-1 w-full max-w-7xl mx-auto bg-slate-900/60 rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-700/40 ring-1 ring-white/10 relative">
        <Navbar />
        <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row gap-6 px-4 pb-8 pt-6 flex-1">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
