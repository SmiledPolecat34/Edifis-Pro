import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/images/logo.svg";

export default function Header() {
  const { user } = useAuth();
  console.log(
    `Profile picture URL: http://localhost:5000/uploads/profile_pictures/${user.profile_picture}`
  );

  return (
    <header className="sticky top-0 flex justify-between items-center w-full h-16 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:pr-8 pr-4 z-20">
      <nav className="flex items-center space-x-4 h-full w-[250px] md:border-r md:border-slate-200 md:px-8 px-4">
        <Link
          to="/"
          className="flex items-center align-center space-x-1.5 text-lg text-slate-950 font-semibold uppercase transition-colors"
        >
          <img src={logo} alt="Edifis Pro" className="h-4 w-4" />
          Edifis <span className="font-light">Pro</span>
        </Link>
      </nav>
      <div className="flex items-center space-x-4">
        <Link
          to="/profile"
          className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-[20px] transition-all duration-300 ease-in-out hover:rounded-xl cursor-pointer"
        >
          <img
            className="aspect-square h-full w-full"
            src={
              user.profile_picture
                ? `http://localhost:5000/uploads/profile_pictures/${user.profile_picture}`
                : "https://i.pinimg.com/736x/ab/32/b1/ab32b1c5a8fabc0b9ae72250ce3c90c2.jpg"
            }
            alt="photo de profil"
          />
        </Link>
        <span className="text-sm">
          {user.firstname} {user.lastname}
        </span>
      </div>
    </header>
  );
}
