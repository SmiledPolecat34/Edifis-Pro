import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import SideBar from '../components/sideBar/SideBar';
import Header from './header/Header';
import Footer from './footer/Footer';

const PageLayout = () => {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <SideBar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden md:ms-[250px]">
                <Header setIsMobileNavOpen={setIsMobileNavOpen} />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
                {/* Overlay for mobile nav */}
                {isMobileNavOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                        onClick={() => setIsMobileNavOpen(false)}
                    ></div>
                )}
            </div>
        </div>
    );
};

export default PageLayout;
