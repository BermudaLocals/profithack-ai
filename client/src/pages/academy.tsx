import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, Trophy, Clock, Users } from 'lucide-react';

export default function AcademyPage() {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Placeholder data - in a real app, this would be fetched from the API
  const question = {
    id: 'google-ads-01',
    text: "What is the primary benefit of using Responsive Search Ads?",
    options: {
      A: "They allow you to show a single, static ad to all users.",
      B: "They automatically test different combinations of your headlines and descriptions to find the best-performing ad.",
      C: "They guarantee your ad will be shown in the top position.",
      D: "They are only available on the Google Display Network.",
    },
    correctAnswer: 'B',
  };

  const handleSubmit = () => {
    if (selectedAnswer === question.correctAnswer) {
      setIsCorrect(true);
      // Here you would make an API call to complete the challenge and earn credits
    } else {
      setIsCorrect(false);
    }
    setShowResult(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">The Learn-to-Earn Academy</h1>
        <p className="text-xl text-muted-foreground">
          Master in-demand skills, get certified, and earn rewards while you learn.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard icon={<Trophy className="h-8 w-8" />} title="Earn Credits" description="Get rewarded with credits for passing challenges and leveling up your skills." />
        <StatCard icon={<Users className="h-8 w-8" />} title="Become an Affiliate" description="Top performers are invited to our exclusive affiliate program to earn real income." />
        <StatCard icon={<CheckCircle className="h-8 w-8" />} title="Get Certified" description="We'll help you prepare for and pay for official industry certifications." />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Google Ads Challenge</h2>
          <Badge variant="secondary">Beginner</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {Object.entries(question.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key}>{value}</Label>
                </div>
              ))}
            </RadioGroup>
            {showResult && (
              <div className={`p-4 rounded-md ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isCorrect ? 'Correct! You have earned 50 credits.' : 'Incorrect. Please try again.'}
              </div>
            )}
            <Button onClick={handleSubmit} disabled={!selectedAnswer || showResult}>
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Helper component for cleaner code
function StatCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
