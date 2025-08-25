import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/App";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProgressCard from "@/components/progress-card";
import ModuleCard from "@/components/module-card";
import { Button } from "@/components/ui/button";
import { LearningModule } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useContext(AuthContext);
  const [, setLocation] = useLocation();

  const { data: modules } = useQuery<LearningModule[]>({
    queryKey: ['/api/modules'],
    enabled: !!user,
  });

  const { data: progress } = useQuery({
    queryKey: ['/api/progress'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  // Calculate progress percentages
  const getProgressForSkill = (skillType: string) => {
    const skillProgress = (progress as any[])?.find((p: any) => p.skillType === skillType);
    return skillProgress?.progress || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="home-page">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4" data-testid="hero-title">
              Build Healthy Relationships
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto" data-testid="hero-description">
              Learn communication skills, understand social cues, and develop meaningful connections through AI-powered guidance and interactive exercises.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/modules">
                <Button className="bg-primary text-white hover:bg-blue-700" data-testid="start-learning-button">
                  Start Learning
                </Button>
              </Link>
              <Link href="/assessment">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" data-testid="take-assessment-button">
                  Take Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Dashboard */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2" data-testid="progress-title">
              Your Learning Journey
            </h3>
            <p className="text-muted">Track your progress across different relationship skills</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <ProgressCard 
              title="Communication"
              subtitle="Basic Skills"
              progress={getProgressForSkill('communication')}
              icon="communication"
            />
            <ProgressCard 
              title="Social Cues"
              subtitle="Recognition"
              progress={getProgressForSkill('social_cues')}
              icon="social_cues"
            />
            <ProgressCard 
              title="Empathy"
              subtitle="Building"
              progress={getProgressForSkill('empathy')}
              icon="empathy"
            />
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2" data-testid="modules-title">
              Learning Modules
            </h3>
            <p className="text-muted">Interactive lessons designed to improve your relationship skills</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {modules?.slice(0, 4).map((module) => (
              <ModuleCard
                key={module.id}
                id={module.id}
                title={module.title}
                description={module.description}
                difficulty={module.difficulty}
                duration={module.duration}
                exercises={module.exercises}
                imageUrl={module.imageUrl || undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI Coach Preview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white" data-testid="ai-coach-title">
                    AI Relationship Coach
                  </h3>
                  <p className="text-blue-100">Get personalized guidance and practice conversations</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-muted mb-6">
                Practice real conversations with our AI coach to improve your communication skills in a safe, supportive environment.
              </p>
              <Link href="/chat">
                <Button className="bg-primary text-white hover:bg-blue-700" data-testid="start-chat-button">
                  Start Coaching Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
