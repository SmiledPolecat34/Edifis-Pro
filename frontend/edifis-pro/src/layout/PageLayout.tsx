import { Outlet } from 'react-router-dom';

import SideBar from '../components/sideBar/SideBar';
import Header from './header/Header';
import Footer from './footer/Footer';

const PageLayout = () => (
    <>
        {/* <div className='flex h-screen overflow-hidden'>            
            <SideBar />
            <div className='flex flex-col w-full'>
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div> */}


        <Header />
        {/* <main className="grid grid-cols-[250px_1fr] md:grid-cols-[250px_1fr] grid-cols-1min-h-[calc(100dvh-65px)] w-full max-w-screen-2xl"> */}

        <div className='flex h-screen'>
            <SideBar />
            <div className='w-full md:ms-[250px]'>
                <Outlet />
                <Footer />
            </div>
        </div>
    </>
);

export default PageLayout;
