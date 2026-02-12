import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { GraduationCap, Menu, X, Shield, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 
import { useProfile } from "@/hooks/useProfile";

// Nav links
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Alumni", href: "/alumni" },
  { name: "Gallery", href: "/gallery" },
  { name: "Events", href: "#events" }, // ✅ CHANGED HERE
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

  // ✅ Smooth Scroll Function (NEW)
  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

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
            <div className={`transition-all duration-300 rounded-md ${isScrolled ? "bg-black/30 p-1" : ""}`}>
              <img
                src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg"
                alt="VIET Logo"
                className="h-16 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <button
                  key={link.name}
                  onClick={() => handleScrollToSection(link.href.replace("#", ""))}
                  className={`font-medium transition-all duration-200 hover:text-gold relative ${
                    isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"
                  }`}
                >
                  {link.name}
                </button>
              ) : (
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
              )
            )}
          </div>

          {/* Actions (UNCHANGED) */}
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

          {/* Mobile Toggle (UNCHANGED) */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2">
            {isMobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-white"}`} />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
