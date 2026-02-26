import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Shield, LogIn, UserPlus } from "lucide-react";
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const navColorClass = isScrolled || isMobileMenuOpen ? "text-gray-900" : "text-white";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center transition-transform hover:scale-105">
          <img src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg" alt="VIET" className="h-12 w-auto" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className={`text-sm font-bold uppercase tracking-wider hover:text-orange-500 transition-colors ${navColorClass} ${location.pathname === link.href ? "text-orange-500" : ""}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth / Profile */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" className={`border-orange-500 text-orange-600 hover:bg-orange-50 ${isScrolled ? "" : "bg-white"}`}>
                    <Shield className="w-4 h-4 mr-2"/> Admin
                  </Button>
                </Link>
              )}
              {profile && <ProfileMenu profile={profile} onLogout={handleSignOut} />}
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" className={navColorClass}>Login</Button></Link>
              <Link to="/register"><Button className="bg-orange-500 hover:bg-orange-600 shadow-md rounded-full px-6">register</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2">
          {isMobileMenuOpen ? <X className="text-gray-900" /> : <Menu className={navColorClass} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="lg:hidden bg-white shadow-2xl absolute top-full left-0 w-full border-t border-gray-100 p-6 flex flex-col gap-6"
          >
            {navLinks.map(link => (
              <Link key={link.name} to={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-gray-800">{link.name}</Link>
            ))}
            <div className="h-px bg-gray-100" />
            {user ? (
              <div className="flex flex-col gap-4">
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-orange-500">Dashboard</Link>
                <button onClick={handleSignOut} className="text-left text-xl font-bold text-red-500">Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-gray-800">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full bg-orange-500 py-6 text-lg">Register</Button></Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;