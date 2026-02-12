import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  name: string;
  href?: string;
  children?: { name: string; href: string }[];
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  {
    name: "Divisions",
    children: [
      { name: "Doughmination Modding", href: "/divisions/modding" },
      { name: "Doughmination Coding", href: "/divisions/coding" },
    ],
  },
  {
    name: "Projects",
    children: [
      { name: "Modding Projects", href: "/projects/modding" },
      { name: "Coding Projects", href: "/projects/coding" },
    ],
  },
  { name: "The Team", href: "/team" },
  { name: "Contact", href: "/contact" },
  { name: "Legal", href: "/legal" },
];

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const closeTimeoutRef = useState<NodeJS.Timeout | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isChildActive = (children?: { name: string; href: string }[]) => {
    return children?.some((child) => location.pathname === child.href);
  };

  const handleMouseEnter = (name: string) => {
    if (closeTimeoutRef[0]) {
      clearTimeout(closeTimeoutRef[0]);
      closeTimeoutRef[0] = null;
    }
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef[0] = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center h-12 gap-1">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(link.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${isChildActive(link.children)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                  >
                    {link.name}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {openDropdown === link.name && (
                    <div className="absolute top-full left-0 pt-1">
                      <div className="min-w-[200px] bg-background border border-border rounded-md shadow-lg py-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`block px-4 py-2 text-sm transition-colors ${isActive(child.href)
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.href!}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.href!)
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-12">
            <span className="text-sm font-medium text-muted-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isOpen && (
            <div className="pb-4 space-y-1">
              {navLinks.map((link) => {
                if (link.children) {
                  return (
                    <div key={link.name}>
                      <button
                        onClick={() =>
                          setMobileOpenDropdown(
                            mobileOpenDropdown === link.name ? null : link.name
                          )
                        }
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-colors ${isChildActive(link.children)
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          }`}
                      >
                        {link.name}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${mobileOpenDropdown === link.name ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                      {mobileOpenDropdown === link.name && (
                        <div className="ml-4 mt-1 space-y-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={() => setIsOpen(false)}
                              className={`block px-4 py-2 rounded-md text-sm transition-colors ${isActive(child.href)
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                }`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.href!}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.href!)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};