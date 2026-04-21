import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-accent/50 via-secondary/20 to-primary/20 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-pacifico text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Cutify
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your one-stop shop for all things cute, aesthetic, and trendy! 💖✨
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-secondary hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 mt-1 shrink-0" />
                <span>support@cutify.com</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 mt-1 shrink-0" />
                <span>+92 123 456 789</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <span>Karachi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 Cutify. All rights reserved. Made with 💖</p>
        </div>
      </div>
    </footer>
  );
};
