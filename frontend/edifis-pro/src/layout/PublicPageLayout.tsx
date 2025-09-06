import { Outlet } from 'react-router-dom';
import PublicHeader from './header/PublicHeader';
import Footer from './footer/Footer';

export default function PublicPageLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
        <PublicHeader />
        <main className="flex-grow">
            <Outlet />
        </main>
        <Footer />
    </div>
  );
}
