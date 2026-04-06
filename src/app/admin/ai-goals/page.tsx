'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, CheckCircle, AlertCircle, Target } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface GeneratedGoal {
  title: string;
  description: string;
  milestones: Milestone[];
  targetDate: string;
}

export default function AdminAIGoalsPage() {
  const [prompt, setPrompt] = useState('');
  const [userId, setUserId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; goal?: GeneratedGoal; error?: string } | null>(null);

  const examplePrompts = {
    easy: 'I want to read 5 books this year',
    medium: 'I want to learn Python programming in 3 months',
    hard: 'I want to train for and complete a marathon',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/goals/create-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userId,
          difficulty,
          adminApiKey: process.env.NEXT_PUBLIC_ADMIN_API_KEY,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, goal: data.goal });
      } else {
        setResult({ success: false, error: data.error || 'Failed to generate goal' });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = () => {
    setPrompt(examplePrompts[difficulty]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI Goal Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate personalized goals with AI-powered milestones for any user
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Goal</CardTitle>
            <CardDescription>
              Enter a user ID and goal description to generate a structured goal with milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter user UUID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  The UUID of the user for whom to generate the goal
                </p>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="easy">Easy</TabsTrigger>
                    <TabsTrigger value="medium">Medium</TabsTrigger>
                    <TabsTrigger value="hard">Hard</TabsTrigger>
                  </TabsList>
                  <TabsContent value="easy" className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      3 milestones - Gentle progression for simple goals
                    </p>
                  </TabsContent>
                  <TabsContent value="medium" className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      5 milestones - Balanced challenge for most goals
                    </p>
                  </TabsContent>
                  <TabsContent value="hard" className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      7 milestones - Ambitious progression for complex goals
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="prompt">Goal Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUseExample}
                    disabled={loading}
                  >
                    Use Example
                  </Button>
                </div>
                <Textarea
                  id="prompt"
                  placeholder={`e.g., "${examplePrompts[difficulty]}"`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Describe what the user wants to achieve
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Goal...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Goal with AI
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Generated Goal
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Error
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success && result.goal ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{result.goal.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.goal.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">
                      Milestones ({result.goal.milestones.length})
                    </h4>
                    <div className="space-y-2">
                      {result.goal.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{milestone.title}</h5>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {milestone.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Note:</strong> This goal data has been generated but not saved to the
                      database. You can use this data to create a goal through your application's
                      goal creation endpoint.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-lg">
                    <Label className="text-xs font-mono">JSON Response:</Label>
                    <pre className="text-xs mt-2 overflow-x-auto">
                      {JSON.stringify(result.goal, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Endpoint</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                POST /api/admin/goals/create-with-ai
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Required Environment Variable</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                NEXT_PUBLIC_ADMIN_API_KEY
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure this is set in your .env.local file
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Documentation</h4>
              <p className="text-sm text-muted-foreground">
                See <code>API_GOALS_DOCUMENTATION.md</code> and{' '}
                <code>GOALS_API_SETUP_GUIDE.md</code> for complete documentation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
