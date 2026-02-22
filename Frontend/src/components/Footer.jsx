import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Instagram, TrendingUp } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: "AI Analysis", href: "/analysis" },
        { label: "Watchlist", href: "/watchlist" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Live Market Data", href: "#" },
        { label: "AI Predictions", href: "#" },
        { label: "Portfolio Tracker", href: "#" },
        { label: "News & Insights", href: "#" },
      ],
    },
  ];

  const socials = [
    { icon: Twitter, href: "https://x.com/rudra_upasani" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/rudraupasani/" },
    { icon: Github, href: "https://github.com/rudraupasani" },
    { icon: Instagram, href: "https://www.instagram.com/rudra_upasani" },
  ];

  return (
    <footer
      className="pt-14 pb-6 border-t"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTopColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 w-fit">
              <div
                className="w-8 h-8 rounded-lg border flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent-bg)",
                  borderColor: "var(--accent-border)",
                }}
              >
                <TrendingUp size={16} style={{ color: "var(--accent)" }} />
              </div>
              <span
                className="text-lg font-extrabold"
                style={{ color: "var(--accent)" }}
              >
                StockBazar
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Your real-time crypto & market tracker with AI analysis, live prices, and smart insights.
            </p>

            {/* Socials */}
            <div className="flex gap-3 mt-5">
              {socials.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3
                className="text-sm font-semibold mb-4 uppercase tracking-wider"
                style={{ color: "var(--text-primary)" }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      onClick={() => {
                        window.scrollTo(0, 0);
                      }}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: "var(--text-primary)" }}
            >
              Contact
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@stockbazar.com"
                className="text-sm block transition-colors duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                support@stockbazar.com
              </a>
              <a
                href="tel:+9199999999999"
                className="text-sm block transition-colors duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                +91 98989898989
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderTopColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {year} StockBazar. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Real-time data · AI Powered
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
