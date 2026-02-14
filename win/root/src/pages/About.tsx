import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="gradient-text">About Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in leading-relaxed">
              Empowering gamers through accessibility and innovation
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Mission Card */}
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border/50 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <svg 
                    className="w-8 h-8 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" 
                    />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
                  Our Mission
                </h2>
              </div>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
                Doughmination System's mission is enabling accessibility in games, 
                where the main developers may fail to help their users. We believe 
                every gamer deserves the tools and support to fully experience their 
                favorite games.
              </p>
            </div>

            {/* Values Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-card/50 rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Inclusive</h3>
                <p className="text-muted-foreground">
                  Creating solutions that work for everyone, regardless of ability
                </p>
              </div>

              <div className="bg-card/50 rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovative</h3>
                <p className="text-muted-foreground">
                  Developing creative solutions where others haven't
                </p>
              </div>

              <div className="bg-card/50 rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Passionate</h3>
                <p className="text-muted-foreground">
                  Driven by love for gaming and helping our community
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;