import { useContext, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { AuthContext } from "@/App";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ChartLine, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { Assessment, AssessmentResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AssessmentPage() {
  const { user, isLoading } = useContext(AuthContext);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/assessment/:id?");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ['/api/assessments'],
    enabled: !!user,
  });

  const { data: currentAssessment } = useQuery<Assessment>({
    queryKey: ['/api/assessments', params?.id],
    enabled: !!user && !!params?.id,
  });

  const { data: results } = useQuery<AssessmentResult[]>({
    queryKey: ['/api/assessment-results'],
    enabled: !!user,
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      const response = await apiRequest('POST', `/api/assessments/${params?.id}/submit`, { answers });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessment-results'] });
      setShowResults(true);
      toast({
        title: "Assessment Completed!",
        description: "Your results have been analyzed and saved.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit assessment",
      });
    },
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

  // Show assessment results
  if (showResults && params?.id) {
    const latestResult = results?.find(r => r.assessmentId === params?.id);
    
    return (
      <div className="min-h-screen bg-slate-50" data-testid="assessment-results-page">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-secondary" />
              <CardTitle className="text-2xl" data-testid="results-title">
                Assessment Complete!
              </CardTitle>
              <p className="text-muted">Here are your personalized results and recommendations</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {latestResult && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Scores:</h3>
                    <div className="space-y-4">
                      {Object.entries(latestResult.scores).map(([category, score]) => (
                        <div key={category}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium capitalize">
                              {category.replace('_', ' ')}
                            </span>
                            <span className="font-semibold">{score}/100</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recommendations:</h3>
                    <ul className="space-y-2">
                      {(latestResult.recommendations || []).map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              <div className="flex space-x-4">
                <Button onClick={() => setLocation("/modules")} data-testid="start-learning-button">
                  Start Learning
                </Button>
                <Button variant="outline" onClick={() => setLocation("/assessment")} data-testid="take-another-button">
                  Take Another Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  // Show individual assessment
  if (params?.id && currentAssessment) {
    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100;

    const handleAnswerChange = (value: any) => {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    };

    const handleNext = () => {
      if (currentQuestionIndex < currentAssessment.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    };

    const handlePrevious = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
    };

    const handleSubmit = () => {
      submitAssessmentMutation.mutate(answers);
    };

    const isLastQuestion = currentQuestionIndex === currentAssessment.questions.length - 1;
    const canProceed = answers[currentQuestion.id] !== undefined;

    return (
      <div className="min-h-screen bg-slate-50" data-testid="assessment-taking-page">
        <Header />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/assessment")}
            className="mb-6"
            data-testid="back-to-assessments-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle data-testid="assessment-taking-title">{currentAssessment.title}</CardTitle>
                <span className="text-sm text-muted" data-testid="question-counter">
                  {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" data-testid="assessment-progress" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="min-h-[200px]">
                <h3 className="text-lg font-semibold mb-4" data-testid="current-question">
                  {currentQuestion.question}
                </h3>
                
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <RadioGroup 
                    value={answers[currentQuestion.id] || ""} 
                    onValueChange={handleAnswerChange}
                    data-testid="multiple-choice-options"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.type === 'scale' && (
                  <div className="space-y-4">
                    <div className="px-3">
                      <Slider
                        value={[answers[currentQuestion.id] || 5]}
                        onValueChange={([value]) => handleAnswerChange(value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                        data-testid="scale-slider"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted px-3">
                      <span>1 - Poor</span>
                      <span className="font-semibold">
                        {answers[currentQuestion.id] || 5}
                      </span>
                      <span>10 - Excellent</span>
                    </div>
                  </div>
                )}
                
                {currentQuestion.type === 'text' && (
                  <Textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    data-testid="text-answer"
                  />
                )}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  data-testid="previous-question-button"
                >
                  Previous
                </Button>
                
                {isLastQuestion ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={!canProceed || submitAssessmentMutation.isPending}
                    data-testid="submit-assessment-button"
                  >
                    {submitAssessmentMutation.isPending ? "Submitting..." : "Submit Assessment"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed}
                    data-testid="next-question-button"
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  // Show assessments list
  return (
    <div className="min-h-screen bg-slate-50" data-testid="assessments-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4" data-testid="assessments-page-title">
            Skills Assessment
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            Take our comprehensive assessments to identify your strengths and areas for improvement in relationship skills.
          </p>
        </div>
        
        {!assessments ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChartLine className="text-primary text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2" data-testid={`assessment-title-${assessment.id}`}>
                    {assessment.title}
                  </h3>
                  <p className="text-muted mb-4" data-testid={`assessment-description-${assessment.id}`}>
                    {assessment.description}
                  </p>
                  <div className="text-sm text-muted mb-4">
                    <span className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {assessment.duration} minutes
                    </span>
                    <span className="mx-2">•</span>
                    <span>{assessment.questions.length} questions</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => setLocation(`/assessment/${assessment.id}`)}
                    data-testid={`start-assessment-${assessment.id}`}
                  >
                    Take Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Previous Results */}
        {results && results.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6" data-testid="previous-results-title">
              Previous Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => {
                const assessment = assessments?.find(a => a.id === result.assessmentId);
                return (
                  <Card key={result.id}>
                    <CardHeader>
                      <CardTitle className="text-lg" data-testid={`result-title-${result.id}`}>
                        {assessment?.title || "Assessment"}
                      </CardTitle>
                      <p className="text-sm text-muted">
                        Completed {new Date(result.completedAt!).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(result.scores).map(([category, score]) => (
                          <div key={category}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm capitalize">
                                {category.replace('_', ' ')}
                              </span>
                              <span className="text-sm font-medium">{score}/100</span>
                            </div>
                            <Progress value={score} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
