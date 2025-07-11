'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, ScanLine, AlertCircle, Info, Bot, BrainCircuit } from 'lucide-react';
import type { VerifyDrugOutput } from '@/ai/flows/verify-drug-flow';
import { verifyDrugWithAi } from '@/ai/flows/verify-drug-flow';
import { addScanToHistory } from '@/services/scan-history';
import type { Scan, User } from '@/lib/types';

export function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<VerifyDrugOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (!query) {
      router.replace('/dashboard/scan');
      return;
    }
    
    if (!currentUser) {
        return;
    }

    const verifyDrug = async () => {
      setIsLoading(true);
      try {
        const result = await verifyDrugWithAi({ query });
        setAnalysis(result);

        const newScan: Omit<Scan, 'id' | 'timestamp'> = {
            userId: currentUser.id,
            barcode: query,
            drugName: result.drugName || null,
            manufacturer: result.manufacturer || null,
            status: result.isSuspect ? 'Suspect' : 'Verified',
            reason: result.reason,
            isFlagged: result.isSuspect,
        };
        await addScanToHistory(newScan);

      } catch (error) {
        console.error('Verification failed:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not perform drug verification. The AI models may be temporarily unavailable.',
        });
        
        const failedScan: Omit<Scan, 'id' | 'timestamp'> = {
            userId: currentUser.id,
            barcode: query,
            drugName: 'N/A',
            manufacturer: 'N/A',
            status: 'Unknown',
            reason: 'AI analysis failed.',
            isFlagged: true,
        };
        await addScanToHistory(failedScan);

        setAnalysis(null); 
      } finally {
        setIsLoading(false);
      }
    };

    verifyDrug();
  }, [query, router, toast, currentUser]);

  if (isLoading) {
    return (
        <div className="container py-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-muted-foreground">
                <BrainCircuit className="h-12 w-12 mx-auto animate-pulse mb-4" />
                <p className="font-semibold">Consulting multiple AI experts for analysis...</p>
                <p className="text-sm">Please wait while we check all available data sources.</p>
            </div>
        </div>
    );
  }

  const isSuspect = analysis?.isSuspect ?? true;
  const cardColor = isSuspect ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5';
  const titleText = isSuspect ? 'Suspect Drug' : 'Verified Drug';

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card className={`shadow-lg transition-colors ${cardColor}`}>
        <CardHeader className="p-6 bg-muted/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {isSuspect ? <AlertCircle className="h-8 w-8 text-red-500"/> : <Bot className="h-8 w-8 text-green-500" />}
                    <div>
                        <CardTitle className="text-3xl font-bold">{titleText}</CardTitle>
                        <CardDescription className="font-semibold">
                            Searched for: {query}
                        </CardDescription>
                    </div>
                </div>
                 {analysis?.sourceModel && (
                    <div className="text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full border">
                        Verified by: <span className="font-semibold text-primary">{analysis.sourceModel}</span>
                    </div>
                 )}
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Info className="h-5 w-5 text-primary"/>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {analysis ? (
                    <>
                        <div className="space-y-1">
                            <h4 className="font-semibold">Reasoning:</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap">{analysis.reason}</p>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="rounded-md border p-3 bg-background/50">
                                <p className="text-sm font-medium text-muted-foreground">Drug Name</p>
                                <p className="font-semibold text-lg">{analysis.drugName || 'Not Identified'}</p>
                            </div>
                             <div className="rounded-md border p-3 bg-background/50">
                                <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                                <p className="font-semibold text-lg">{analysis.manufacturer || 'Not Identified'}</p>
                            </div>
                              <div className="rounded-md border p-3 bg-background/50">
                                <p className="text-sm font-medium text-muted-foreground">Approval Info</p>
                                <p className="font-semibold text-lg">{analysis.approvalInfo || 'Not Available'}</p>
                            </div>
                        </div>
                    </>
                   ) : (
                    <p className="text-muted-foreground text-center py-8">
                        The AI was unable to provide an analysis for this query. Please try again.
                    </p>
                   )}
                </CardContent>
            </Card>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 bg-muted/50 p-6">
            <Button variant="outline" asChild>
                <Link href="/dashboard/scan">
                  <ScanLine className="mr-2 h-4 w-4"/>
                  Scan Another Drug
                </Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href="/dashboard/chat">
                  <Bot className="mr-2 h-4 w-4"/>
                  Ask Follow-up Question
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
