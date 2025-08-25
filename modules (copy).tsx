import { useContext } from "react";
import { useLocation, useRoute } from "wouter";
import { AuthContext } from "@/App";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ModuleCard from "@/components/module-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowLeft } from "lucide-react";
import { LearningModule } from "@shared/schema";

export default function Modules() {
  const { user, isLoading } = useContext(AuthContext);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/modules/:id?");

  const { data: modules } = useQuery<LearningModule[]>({
    queryKey: ['/api/modules'],
    enabled: !!user,
  });

  const { data: currentModule } = useQuery<LearningModule>({
    queryKey: ['/api/modules', params?.id],
    enabled: !!user && !!params?.id,
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

  // Show individual module view
  if (params?.id && currentModule) {
    return (
      <div className="min-h-screen bg-slate-50" data-testid="module-detail-page">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/modules")}
            className="mb-6"
            data-testid="back-to-modules-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <img 
                  src={currentModule.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"}
                  alt={currentModule.title}
                  className="w-24 h-24 rounded-lg object-cover"
                  data-testid="module-detail-image"
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2" data-testid="module-detail-title">
                    {currentModule.title}
                  </CardTitle>
                  <p className="text-muted mb-4" data-testid="module-detail-description">
                    {currentModule.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-muted">
                    <span className="flex items-center" data-testid="module-detail-duration">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentModule.duration} minutes
                    </span>
                    <span className="flex items-center" data-testid="module-detail-exercises">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {currentModule.exercises} exercises
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      currentModule.difficulty === 'Beginner' ? 'bg-primary/10 text-primary' :
                      currentModule.difficulty === 'Intermediate' ? 'bg-accent/10 text-accent' :
                      'bg-secondary/10 text-secondary'
                    }`} data-testid="module-detail-difficulty">
                      {currentModule.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentModule.content.lessons.map((lesson, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6">
                    <h3 className="font-semibold text-lg mb-3" data-testid={`lesson-title-${index}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-muted mb-4" data-testid={`lesson-content-${index}`}>
                      {lesson.content}
                    </p>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Practice Exercises:</h4>
                      <div className="space-y-2">
                        {lesson.exercises.map((exercise, exerciseIndex) => (
                          <div 
                            key={exerciseIndex}
                            className="bg-white rounded p-3 border"
                            data-testid={`exercise-${index}-${exerciseIndex}`}
                          >
                            <p className="font-medium text-sm">
                              {exercise.question}
                            </p>
                            <span className="text-xs text-muted capitalize">
                              Type: {exercise.type.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 border-t">
                  <Button className="w-full" data-testid="start-module-button">
                    Start This Module
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  // Show modules list view
  return (
    <div className="min-h-screen bg-slate-50" data-testid="modules-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" data-testid="modules-page-title">
            Learning Modules
          </h1>
          <p className="text-muted">
            Comprehensive lessons designed to improve your relationship and communication skills
          </p>
        </div>

        {!modules ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : modules.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted" />
              <h3 className="text-xl font-semibold mb-2">No Modules Available</h3>
              <p className="text-muted">Check back later for new learning content.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                id={module.id}
                title={module.title}
                description={module.description}
                difficulty={module.difficulty}
                duration={module.duration}
                exercises={module.exercises}
                imageUrl={module.imageUrl}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
