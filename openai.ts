import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachingResponse {
  response: string;
  suggestions: string[];
  feedback: string;
}

export async function generateCoachingResponse(
  messages: ChatMessage[],
  userContext?: { age: number; preferences?: any }
): Promise<CoachingResponse> {
  try {
    const systemPrompt = `You are RelationshipWise AI, an expert relationship coach focused on teaching healthy communication skills and emotional intelligence. Your role is to:

1. Provide educational, supportive guidance on relationship skills
2. Help users practice communication scenarios
3. Offer constructive feedback on their responses
4. Suggest practical exercises and improvements
5. Maintain a professional, encouraging tone

Guidelines:
- Keep all content appropriate and educational
- Focus on healthy relationship dynamics
- Provide specific, actionable advice
- Encourage self-reflection and growth
- Use age-appropriate language based on user context

User context: ${userContext ? `Age: ${userContext.age}` : 'Not provided'}

Respond with a JSON object containing:
- response: Your main coaching response
- suggestions: Array of 2-3 quick suggestion buttons
- feedback: Brief constructive feedback if applicable`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      response: result.response || "I'm here to help with your relationship skills. What would you like to work on?",
      suggestions: result.suggestions || ["Give me an example", "Different scenario", "I need help"],
      feedback: result.feedback || ""
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate coaching response. Please try again.");
  }
}

export async function analyzeAssessmentAnswers(
  questions: Array<{ id: string; question: string; category: string; type: string; }>,
  answers: Record<string, any>
): Promise<{ scores: Record<string, number>; recommendations: string[] }> {
  try {
    const prompt = `Analyze these assessment answers for relationship skills evaluation:

Questions and Answers:
${questions.map(q => `${q.category} - ${q.question}: ${answers[q.id] || 'No answer'}`).join('\n')}

Provide analysis as JSON with:
- scores: Object with category scores (0-100 scale) for each category found
- recommendations: Array of specific improvement recommendations

Focus on these skill categories:
- communication: How well they communicate
- social_awareness: Ability to read social cues
- conflict_resolution: Handling disagreements
- empathy: Understanding others' feelings
- trust_building: Creating trusted relationships`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 600
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      scores: result.scores || {},
      recommendations: result.recommendations || ["Continue learning with our modules", "Practice active listening", "Work on emotional awareness"]
    };
  } catch (error) {
    console.error("Assessment analysis error:", error);
    throw new Error("Failed to analyze assessment results. Please try again.");
  }
}

export async function generateLearningContent(
  topic: string,
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  userAge: number
): Promise<{ content: string; exercises: Array<{ question: string; type: string; }> }> {
  try {
    const prompt = `Create educational content about "${topic}" for ${difficulty} level relationship skills learning.

User age: ${userAge}

Generate JSON with:
- content: Educational explanation (2-3 paragraphs, age-appropriate)
- exercises: Array of 3 practice exercises with question and type fields

Focus on healthy relationship dynamics and practical skills. Keep content professional and educational.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      content: result.content || "This lesson covers important relationship skills.",
      exercises: result.exercises || [
        { question: "Reflect on this topic", type: "text" }
      ]
    };
  } catch (error) {
    console.error("Content generation error:", error);
    throw new Error("Failed to generate learning content. Please try again.");
  }
}
