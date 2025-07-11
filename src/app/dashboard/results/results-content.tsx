'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, ScanLine, AlertCircle, Info, Bot, BrainCircuit, CheckCircle, FileText } from 'lucide-react';
import type { VerifyDrugOutput } from '@/ai/flows/verify-drug-flow';
import { verifyDrugWithAi } from '@/ai/flows/verify-drug-flow';
import { addScanToHistory } from '@/services/scan-history';
import type { Scan, User } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const drugName = searchParams.get('drugName');
  const ndc = searchParams.get('ndc');
  const gtin = searchParams.get('gtin');
  const nafdacNumber = searchParams.get('nafdacNumber');

  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<VerifyDrugOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        setCurrentUser(JSON.parse(userStr));
    } else {
        router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
        return;
    }

    if (!drugName && !ndc && !gtin && !nafdacNumber) {
      router.replace('/dashboard/scan');
      return;
    }

    const runVerification = async () => {
      setIsLoading(true);
      const input = { 
        drugName: drugName ?? undefined, 
        ndc: ndc ?? undefined, 
        gtin: gtin ?? undefined,
        nafdacNumber: nafdacNumber ?? undefined
      };
      
      let result: VerifyDrugOutput | null = null;
      try {
        result = await verifyDrugWithAi(input);
        setAnalysis(result);
      } catch (error) {
        console.error('Verification failed:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not perform drug verification. The AI models may be temporarily unavailable.',
        });
      } finally {
         const newScan: Omit<Scan, 'id' | 'timestamp'> = {
            userId: currentUser.id,
            barcode: ndc || gtin || nafdacNumber || 'N/A',
            drugName: result?.drugName || drugName || 'N/A',
            manufacturer: result?.manufacturer || 'N/A',
            status: result ? (result.isSuspect ? 'Suspect' : 'Verified') : 'Unknown',
            reason: result?.reason || 'AI analysis failed to complete.',
            isFlagged: result?.isSuspect ?? true,
        };
        await addScanToHistory(newScan);
        setIsLoading(false);
      }
    };

    runVerification();
  }, [drugName, ndc, gtin, nafdacNumber, currentUser, router, toast]);

  if (isLoading) {
    return (
        <div className="container py-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-muted-foreground">
                <BrainCircuit className="h-12 w-12 mx-auto animate-pulse mb-4" />
                <p className="font-semibold">Consulting AI pharmaceutical specialist...</p>
                <p className="text-sm">Please wait while we analyze the drug information.</p>
            </div>
        </div>
    );
  }

  const isSuspect = analysis?.isSuspect ?? true;
  const cardColor = isSuspect ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5';
  const titleText = isSuspect ? 'Suspect Drug' : 'Verified Drug';
  const TitleIcon = isSuspect ? AlertCircle : CheckCircle;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card className={`shadow-lg transition-colors ${cardColor}`}>
        <CardHeader className="p-6 bg-muted/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <TitleIcon className={`h-8 w-8 ${isSuspect ? 'text-red-500' : 'text-green-500'}`}/>
                    <div>
                        <CardTitle className="text-3xl font-bold">{titleText}</CardTitle>
                        <CardDescription className="font-semibold">
                            Verification complete for: {ndc || gtin || drugName}
                        </CardDescription>
                    </div>
                </div>
                 <div className="text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full border">
                     Analysis by: <span className="font-semibold text-primary">Gemini AI</span>
                 </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Info className="h-5 w-5 text-primary"/>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                   {analysis ? (
                    <>
                        <div className="space-y-1">
                            <h4 className="font-semibold">Verdict:</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap">{analysis.reason}</p>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="rounded-md border p-3 bg-background/50">
                                <p className="text-sm font-medium text-muted-foreground">Identified Drug Name</p>
                                <p className="font-semibold text-lg">{analysis.drugName || 'Not Identified'}</p>
                            </div>
                             <div className="rounded-md border p-3 bg-background/50">
                                <p className="text-sm font-medium text-muted-foreground">Identified Manufacturer</p>
                                <p className="font-semibold text-lg">{analysis.manufacturer || 'Not Identified'}</p>
                            </div>
                        </div>
                        {analysis.approvalInfo && (
                            <Accordion type="single" collapsible className="w-full pt-2">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4"/> View Approval Details
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{analysis.approvalInfo}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </>
                   ) : (
                    <p className="text-muted-foreground text-center py-8">
                        The AI was unable to provide an analysis for this query. This could be due to a network error or an issue with the AI providers. The attempt has been logged in your history.
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
