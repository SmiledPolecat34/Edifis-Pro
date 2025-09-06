import { useAuth } from './context/AuthContext';
import PageLayout from './layout/PageLayout';
import PublicPageLayout from './layout/PublicPageLayout';
import Loading from './components/loading/Loading';

export default function ConditionalLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loading />
        </div>
    );
  }

  return isAuthenticated ? <PageLayout /> : <PublicPageLayout />;
}
