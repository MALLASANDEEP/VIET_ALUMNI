import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Shield, User, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import ProfileMenu from "./ProfileMenu";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Alumni", href: "/alumni" },
  { name: "Gallery", href: "/gallery" },
  { name: "About Us", href: "/AboutUs" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { data: profile } = useProfile();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isElevated = isScrolled;
  const navColorClass = isElevated ? "text-gray-900" : "text-white";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isElevated
          ? "bg-white/10 backdrop-blur-xl shadow-lg py-2 border-b border-white/20"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between relative">

        <Link
          to="/"
          className={
            isScrolled
              ? "flex items-center hover:scale-105 transition-all duration-300 rounded-md bg-orange-500 p-2"
              : "flex items-center transition-transform hover:scale-105"
          }
        >
          <img
            src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg"
            alt="VIET"
            className="h-11 sm:h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-4 relative">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-semibold whitespace-nowrap transition-all ${
                  location.pathname === link.href
                    ? "text-orange-500"
                    : navColorClass
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <Shield className="w-4 h-4 mr-2" /> Admin
                  </Button>
                </Link>
              )}
              {profile && (
                <ProfileMenu profile={profile} onLogout={handleSignOut} />
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" className={navColorClass}>
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          {user && profile && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1.5 shadow-sm"
            >
              <div className="h-7 w-7 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <span className="max-w-[90px] truncate text-xs font-semibold text-gray-800">
                {profile.full_name}
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full bg-white/90 shadow-sm"
          >
            {isMobileMenuOpen ? (
              <X className="text-gray-900" />
            ) : (
              <Menu className="text-gray-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white shadow-2xl absolute top-full left-0 w-full border-t border-gray-100 p-6 flex flex-col gap-6 z-40"
          >
            {user && profile && (
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
                    {profile.photo_url ? (
                      <img
                        src={profile.photo_url}
                        alt={profile.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-700"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-bold text-gray-800"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-bold text-orange-600"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 text-xl font-bold text-red-600 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-bold text-blue-600"
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;