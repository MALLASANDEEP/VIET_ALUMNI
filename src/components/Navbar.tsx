import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Shield, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 
import { useProfile } from "@/hooks/useProfile";

// Nav links
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-white/10 backdrop-blur-md shadow-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`transition-all duration-300 rounded-md ${isScrolled ? "bg-orange-500/30 p-1" : ""}`}>
              <img
                src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg"
                alt="VIET Logo"
                className="h-16 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-all duration-200 hover:text-gold relative ${
                  isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"
                } ${isActive(link.href) ? "text-gold" : ""}`}
              >
                {link.name}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className={`gap-2 ${isScrolled ? "text-foreground hover:text-gold" : "text-white hover:text-gold"}`}>
                      <Shield className="w-4 h-4" /> Admin
                    </Button>
                  </Link>
                )}
                {profile?.status === "approved" && (
                  <Link to="/dashboard">
                    <Button variant="ghost" className={`gap-2 ${isScrolled ? "text-foreground hover:text-gold" : "text-white hover:text-gold"}`}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className={`gap-2 ${isScrolled ? "text-foreground hover:text-gold" : "text-white hover:text-gold"}`}
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className={`gap-2 ${isScrolled ? "text-foreground hover:text-gold" : "text-white hover:text-gold"}`}>
                    <LogIn className="w-4 h-4" /> Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gold hover:bg-gold-dark text-navy-dark font-bold rounded-full px-6 gap-2 border-none shadow-md transition-transform hover:scale-105">
                    <UserPlus className="w-4 h-4" /> Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 z-50">
            {isMobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-white"}`} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with stronger frosted look */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed top-20 left-4 right-4 z-40 bg-white/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 overflow-hidden"
          >
            <div className="flex flex-col py-6 px-6 gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground font-semibold text-lg hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <hr className="border-white/40" />

              {/* Auth Buttons */}
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-foreground font-semibold text-lg hover:text-gold transition-colors">
                      Admin
                    </Link>
                  )}
                  {profile?.status === "approved" && (
                    <Link to="/dashboard" className="text-foreground font-semibold text-lg hover:text-gold transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-foreground font-semibold text-lg text-left hover:text-gold transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-foreground font-semibold text-lg hover:text-gold transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-foreground font-semibold text-lg hover:text-gold transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
