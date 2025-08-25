import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: number;
  imageUrl?: string;
}

const difficultyColors = {
  Beginner: "bg-primary/10 text-primary",
  Intermediate: "bg-accent/10 text-accent", 
  Advanced: "bg-secondary/10 text-secondary",
};

export default function ModuleCard({ 
  id, 
  title, 
  description, 
  difficulty, 
  duration, 
  exercises, 
  imageUrl 
}: ModuleCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 hover:shadow-md transition-shadow" data-testid={`module-card-${id}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
          alt={title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          data-testid={`module-image-${id}`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-lg font-semibold text-slate-900" data-testid={`module-title-${id}`}>
              {title}
            </h4>
            <span 
              className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.Beginner}`}
              data-testid={`module-difficulty-${id}`}
            >
              {difficulty}
            </span>
          </div>
          <p className="text-muted mb-3" data-testid={`module-description-${id}`}>
            {description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted">
              <span className="flex items-center" data-testid={`module-duration-${id}`}>
                <Clock className="w-4 h-4 mr-1" />
                {duration} min
              </span>
              <span className="flex items-center" data-testid={`module-exercises-${id}`}>
                <BookOpen className="w-4 h-4 mr-1" />
                {exercises} exercises
              </span>
            </div>
            <Link href={`/modules/${id}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary hover:bg-primary/5"
                data-testid={`module-start-${id}`}
              >
                Start <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
