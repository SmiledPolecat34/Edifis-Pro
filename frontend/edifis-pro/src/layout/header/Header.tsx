import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react'; // Import burger icon

interface HeaderProps {
  setIsMobileNavOpen: (isOpen: boolean | ((isOpen: boolean) => boolean)) => void;
}

export default function Header({ setIsMobileNavOpen }: HeaderProps) {
  const { user } = useAuth();

  // Correctly handle the image URL, removing /api if present
  const getProfileImageUrl = () => {
    if (user?.profile_picture) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
      return `${baseUrl}/uploads/profile_pictures/${user.profile_picture}`;
    }
    return 'https://i.pinimg.com/736x/ab/32/b1/ab32b1c5a8fabc0b9ae72250ce3c90c2.jpg';
  };

  return (
    <header className="sticky top-0 flex justify-between items-center w-full h-16 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:pr-8 pr-4 z-20">
      {/* Burger Menu for Mobile */}
      <div className="md:hidden flex items-center pl-4">
        <button
          onClick={() => setIsMobileNavOpen(prev => !prev)}
          className="p-2"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={24} />
        </button>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <Link
            to="/profile"
            className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-[20px] transition-all duration-300 ease-in-out hover:rounded-xl cursor-pointer"
            aria-label="Voir le profil"
          >
            <img
              className="aspect-square h-full w-full"
              src={getProfileImageUrl()}
              alt="photo de profil"
            />
          </Link>
          <span className="text-sm">
            {user.firstname} {user.lastname}
          </span>
        </div>
      )}
    </header>
  );
}
