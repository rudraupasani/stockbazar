import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, TrendingUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const links = [
    { title: "Home", path: "/" },
    { title: "Market", path: "/market" },
    { title: "AI Analysis", path: "/analysis" },
    { title: "Watchlist", path: "/watchlist" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        backgroundColor: "var(--navbar-bg)",
        borderBottomColor: "var(--border)",
      }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3.5">

        {/* Logo */}
        <Link to="/"
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-2 group">

          <span
            className="text-xl font-extrabold tracking-tight group-hover:opacity-90 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            StockBazar
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => window.scrollTo(0, 0)}
              style={{
                color: isActive(link.path) ? "var(--accent)" : "var(--text-secondary)",
                backgroundColor: isActive(link.path) ? "var(--accent-bg)" : "transparent",
              }}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-[var(--accent)] hover:bg-[var(--accent-bg)]"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            className="w-9 h-9 rounded-lg border flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Mobile Menu Icon */}
          <button
            className="md:hidden w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderTopColor: "var(--border)",
          }}
          className="border-t px-4 py-3 space-y-1"
        >
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => { setOpen(false); window.scrollTo(0, 0); }}
              style={{
                color: isActive(link.path) ? "var(--accent)" : "var(--text-secondary)",
                backgroundColor: isActive(link.path) ? "var(--accent-bg)" : "transparent",
              }}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:text-[var(--accent)] hover:bg-[var(--accent-bg)]"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
