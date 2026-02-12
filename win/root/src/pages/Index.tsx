import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar"

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <NavBar />

            {/* Title Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                            <span className="gradient-text-minecraft">Doughmination System</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
                            A UK-based company, providing accessible solutions for people with various impediments and disabilities
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Index;