// components/layout/Layout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackToTop from '../common/BackToTop';
import Sidebar from '../common/Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
