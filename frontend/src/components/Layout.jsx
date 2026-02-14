// frontend/src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="mx-auto flex max-w-6xl gap-4 px-4 pb-8 pt-4 md:pt-6">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
