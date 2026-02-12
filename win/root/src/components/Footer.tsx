import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  legal: [
    { name: "Legal", href: "/legal" },
    { name: "Our Pledge", href: "/pledge" },
    { name: "Contact Us", href: "/contact" }
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 md:gap-12">
          {/* Top Section: Branding & Social */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-2">
              {footerLinks.legal.map((social) => {
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith('http') ? "_blank" : undefined}
                    rel={social.href.startsWith('http') ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-sm"
                    title={social.name}
                  >
                    <span className="hidden sm:inline">{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Bottom Section: License & Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <p>
                © 2026 UnifiedGaming Systems Ltd •{" "}
                <a
                  href="https://find-and-update.company-information.service.gov.uk/company/16108983"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  16108983
                </a>
              </p>
            </div>
            <p className="text-center md:text-right">
              Doughmination System® is a trade mark in the United Kingdom under trademark number{" "}
              <Link to="https://www.ipo.gov.uk/t-tmj.htm/t-tmj/tm-journals/2025-039/UK00004263144.html" className="hover:text-foreground transition-colors">
                UK00004263144
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};