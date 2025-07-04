'use client';

import type { Guard } from '@/types';
import type { AnalyzeSelfieComplianceOutput } from '@/ai/flows/analyze-selfie-compliance';
import { useState, useEffect } from 'react';
import { analyzeSelfieCompliance } from '@/ai/flows/analyze-selfie-compliance';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileWarning, Lightbulb, Sparkles } from 'lucide-react';

export function ComplianceAnalyzer({ guard }: { guard: Guard }) {
  const [analysis, setAnalysis] = useState<AnalyzeSelfieComplianceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getAnalysis() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeSelfieCompliance({
          guardId: guard.id,
          missedSelfieCount: guard.missedSelfieCount,
          totalSelfieRequests: guard.totalSelfieRequests,
        });
        setAnalysis(result);
      } catch (e) {
        console.error(e);
        setError('Failed to load compliance analysis.');
      } finally {
        setIsLoading(false);
      }
    }
    getAnalysis();
  }, [guard]);

  const missedPercentage =
    guard.totalSelfieRequests > 0
      ? ((guard.missedSelfieCount / guard.totalSelfieRequests) * 100).toFixed(0)
      : 0;

  return (
    <Card className={analysis?.complianceIssueIdentified ? 'bg-amber-50 border-amber-200' : ''}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={guard.avatar} alt={guard.name} />
            <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{guard.name}</CardTitle>
            <CardDescription>
              {guard.missedSelfieCount} of {guard.totalSelfieRequests} missed ({missedPercentage}%)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        {error && (
            <div className="p-3 bg-destructive/10 rounded-lg text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
            </div>
        )}
        {analysis && (
          <>
            <div className="p-3 bg-primary/10 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-primary mb-1">
                    <Sparkles className="w-4 h-4" /> Analysis
                </h4>
                <p className="text-sm text-primary/80">{analysis.analysis}</p>
            </div>
             <div className="p-3 bg-accent/10 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-accent mb-1">
                    <Lightbulb className="w-4 h-4" /> Recommendation
                </h4>
                <p className="text-sm text-accent/80">{analysis.recommendations}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
