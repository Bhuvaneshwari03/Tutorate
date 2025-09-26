import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  BookOpen, 
  Globe, 
  FileText, 
  Presentation, 
  Video, 
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI creates comprehensive courses from just a topic"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Generate courses in 8+ languages with automatic translation"
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      description: "PDF, PowerPoint, Micro-lessons, and Video Scripts"
    },
    {
      icon: Zap,
      title: "Instant Creation",
      description: "Complete course materials generated in minutes"
    }
  ];

  const steps = [
    { step: "01", title: "Login", description: "Sign in with email or Google account" },
    { step: "02", title: "Enter Topic", description: "Describe your course topic and preferences" },
    { step: "03", title: "AI Generation", description: "AI creates outline, content, quizzes, and scripts" },
    { step: "04", title: "Review & Export", description: "Edit content and export in your preferred format" }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-neural animate-gradient opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 via-transparent to-cyber-pink/10"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-electric-purple rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-3 h-3 bg-cyber-pink rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-neon-green rounded-full animate-float opacity-70" style={{animationDelay: '4s'}}></div>
      
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="mx-auto max-w-5xl">
            <Badge className="mb-8 gradient-cosmic text-white animate-glow border-0 px-6 py-2 text-lg font-semibold">
              ✨ AI Course Creator - Neural Edition
            </Badge>
            <h1 className="mb-8 text-7xl font-bold leading-tight">
              Spark the Future of{" "}
              <span className="text-gradient-cosmic animate-gradient">
                Learning
              </span>
            </h1>
            <p className="mb-10 text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform any topic into a complete educational experience with AI that thinks beyond boundaries.
              Generate course outlines, lesson content, quizzes, and video scripts in <span className="text-electric-purple font-semibold">seconds</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="gradient-cosmic hover:scale-105 transition-all duration-300 text-white text-lg px-8 py-4 glow-purple animate-glow"
              >
                Launch AI Creator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-electric-blue text-electric-blue hover:bg-electric-blue/10 hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
              >
                <Video className="w-5 h-5 mr-2" />
                Watch Neural Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gradient-cosmic">Neural Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced AI capabilities that redefine educational content creation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center bg-card/50 backdrop-blur-sm border-electric-purple/20 hover:border-electric-purple/50 transition-all duration-500 hover:scale-105 hover:glow-purple group">
                <CardHeader className="pb-4">
                  <div className="mx-auto w-16 h-16 gradient-cosmic rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground group-hover:text-electric-purple transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/5 to-electric-blue/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Neural Process</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four quantum steps to revolutionize your course creation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-20 h-20 gradient-fire rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 group-hover:scale-110 transition-all duration-300 glow-pink animate-glow" style={{animationDelay: `${index * 0.3}s`}}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4 group-hover:text-electric-purple transition-colors">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Formats */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gradient-cosmic">Quantum Export Formats</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your reality - export in formats that transcend traditional boundaries
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FileText, name: "Neural PDF", desc: "Quantum-enhanced course documentation", color: "electric-purple" },
              { icon: Presentation, name: "Cosmic PowerPoint", desc: "Dimension-shifting presentation slides", color: "cyber-pink" },
              { icon: BookOpen, name: "Micro-Reality", desc: "Bite-sized learning fragments", color: "neon-green" },
              { icon: Video, name: "Neural Script", desc: "AI-optimized narration sequences", color: "solar-orange" }
            ].map((format, index) => (
              <Card key={index} className="text-center bg-card/30 backdrop-blur-sm border-transparent hover:border-electric-purple/50 transition-all duration-500 hover:scale-105 group">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-${format.color} bg-${format.color}/10 group-hover:bg-${format.color}/20 transition-all duration-300 group-hover:scale-110`}>
                    <format.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-electric-purple transition-colors">{format.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{format.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 gradient-neural animate-gradient opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Card className="max-w-4xl mx-auto bg-card/20 backdrop-blur-xl border-electric-purple/30 hover:border-electric-purple/60 transition-all duration-500 glow-purple">
            <CardHeader className="pb-8">
              <CardTitle className="text-4xl mb-4 text-gradient-cosmic">Ready to Transcend Reality?</CardTitle>
              <CardDescription className="text-2xl text-muted-foreground">
                Join the neural revolution - thousands of educators are already creating in the quantum realm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex justify-center items-center space-x-8 text-lg text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-neon-green" />
                  <span>Quantum Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-electric-blue" />
                  <span>No Neural Limits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-cyber-pink" />
                  <span>Instant Reality</span>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="gradient-cosmic hover:scale-110 transition-all duration-300 text-white text-xl px-12 py-6 glow-purple animate-glow"
              >
                Enter the Neural Dimension
                <Sparkles className="w-6 h-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-electric-purple/20 bg-card/10 backdrop-blur-sm py-12 relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 gradient-cosmic rounded-xl flex items-center justify-center animate-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gradient-cosmic">Neural Course Creator</span>
          </div>
          <p className="text-muted-foreground text-lg">
            Empowering educators to transcend traditional boundaries with quantum AI technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
