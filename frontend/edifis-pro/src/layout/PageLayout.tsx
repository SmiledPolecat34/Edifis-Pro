import { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';

import SideBar from '../components/sideBar/SideBar';
import Header from './header/Header';
import Footer from './footer/Footer';
import ScrollButton from '../components/scrollButton/ScrollButton'; // Import ScrollButton

const PageLayout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
      <div
        ref={scrollableContainerRef}
        className="relative flex flex-1 flex-col md:ms-[250px] min-h-screen"
      >
        <Header setIsMobileNavOpen={setIsMobileNavOpen} />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer /> {/* colle toujours en bas */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          ></div>
        )}
        <ScrollButton scrollableRef={scrollableContainerRef} />
      </div>
    </div>
  );
};

export default PageLayout;
