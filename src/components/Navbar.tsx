import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Shield } from "lucide-react";
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

  // 🔥 Persistent menu state
  const navMenuRef = useRef(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 Restore menu state after route change
  useEffect(() => {
    setIsNavMenuOpen(navMenuRef.current);
  }, [location.pathname]);

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
      <div className="container mx-auto px-6 flex items-center justify-between relative">

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
            className="h-12  w-110 object-contain"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-4 relative">

          <AnimatePresence>
            {isNavMenuOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden flex items-center gap-6 rounded-full px-6 py-2 bg-orange-500"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`font-semibold whitespace-nowrap transition-all ${
                      location.pathname === link.href

                        ? "text-orange-500"
                        : "text-white hover:text-orange-600"


               }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              navMenuRef.current = !navMenuRef.current;
              setIsNavMenuOpen(navMenuRef.current);
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              isElevated
                ? "border-orange-500 text-orange-600 bg-white"
                : "border-white text-white"
            }`}



            
          >
            {isNavMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

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

        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="text-gray-900" />
            ) : (
              <Menu className={navColorClass} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white shadow-2xl absolute top-full left-0 w-full border-t border-gray-100 p-6 flex flex-col gap-6"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;