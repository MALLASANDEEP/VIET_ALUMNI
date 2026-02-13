import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="border  text-slate-700 border-t border-slate-200 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-navy-dark" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Alumni Visakha
                </h3>
                <p className="text-slate-500 text-xs">Est. 2008</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Connecting generations of excellence. Building bridges between the
              past and future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-4 text-slate-900">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {["Home", "Alumni", "Gallery", "About Us"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-gold transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-4 text-slate-900">
              Departments
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Computer Science",
                "Electronics",
                "Mechanical",
                "Civil",
                "Electrical",
                "MBA / MCA / BBA / BCA",
              ].map((dept) => (
                <li key={dept}>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-gold transition-colors"
                  >
                    {dept}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-4 text-slate-900">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5" />
                <span className="text-slate-600">
                  88th Division, Narava, GVMC,
                  Visakhapatnam, Andhra Pradesh 530027
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold" />
                <span className="text-slate-600">
                  9959617476, 9959617477, 9550957054
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold" />
                <span className="text-slate-600">
                  website@viet.edu.in
                </span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="https://www.viet.edu.in/"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-slate-200 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <p className="text-slate-500">
            © 2026 Alumni Portal. All rights reserved.
          </p>

          <div className="flex gap-5">
            <a href="#" className="text-slate-500 hover:text-gold transition">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-500 hover:text-gold transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
