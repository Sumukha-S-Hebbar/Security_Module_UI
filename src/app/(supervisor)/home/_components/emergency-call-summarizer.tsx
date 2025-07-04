'use client';

import { useState } from 'react';
import { summarizeEmergencyCall } from '@/ai/flows/summarize-emergency-call';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, Loader2, Sparkles } from 'lucide-react';
import type { Alert } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function EmergencyCallSummarizer({ alert }: { alert: Alert }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!alert.callDetails) {
      setError('No call details available to summarize.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No call details available for this alert.',
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await summarizeEmergencyCall({ callDetails: alert.callDetails });
      setSummary(result.summary);
    } catch (e) {
      console.error(e);
      setError('Failed to generate summary. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the call summary.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-lg">
          Emergency from {alert.guard} at {alert.site}
        </CardTitle>
        <CardDescription>
          Call received at {alert.date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alert.callDetails ? (
          <p className="text-sm text-muted-foreground italic">"{alert.callDetails}"</p>
        ) : (
          <p className="text-sm text-muted-foreground">No call details provided.</p>
        )}
        {summary && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              AI Summary
            </h4>
            <p className="text-sm text-primary/80">{summary}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
      {alert.callDetails && (
        <CardFooter>
          <Button onClick={handleSummarize} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Summarize with AI
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
