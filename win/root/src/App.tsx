import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// 404 and Coming Soon page
import NotFound from "@/pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

// Main pages
import Index from "@/pages/Index";
import About from "@/pages/About";

// Divisions Pages
import DivCoding from "@/pages/divisions/DivCoding";
import DivModding from "@/pages/divisions/DivModding";

// Project pages
import ProCoding from "@/pages/projects/ProCoding";
import ProModding from "@/pages/projects/ProModding";

// Legal pages
import Legal from "@/pages/Legal";
import Contact from "@/pages/Contact";
import Team from "@/pages/Team";


const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>

                        {/* Divisions Pages */}
                        <Route path="/divisions/modding" element={<ComingSoon />} />
                        <Route path="/divisions/coding" element={<ComingSoon />} />

                        {/* Projects Pages */}
                        <Route path="/projects/modding" element={<ComingSoon />} />
                        <Route path="/projects/coding" element={<ComingSoon />} />

                        {/* Legal Pages */}
                        <Route path="/legal" element={<Legal />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/team" element={<Team />}/>
                        {/* Main Pages */}
                        <Route path="/about" element={<About />} />
                        <Route path="/" element={<Index />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;