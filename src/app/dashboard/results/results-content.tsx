'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { chatWithAi } from '@/ai/flows/chat-with-ai-flow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, ScanLine, AlertCircle, Info, FileCheck2, Bot } from 'lucide-react';

export function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcode = searchParams.get('barcode');
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barcode) {
      router.replace('/dashboard/scan');
      return;
    }

    const verifyDrug = async () => {
      setIsLoading(true);
      try {
        const result = await chatWithAi({ 
            history: [], 
            message: `Please verify the drug with barcode: ${barcode}. Provide a detailed analysis based on all available data sources.` 
        });
        setAnalysis(result.response);
      } catch (error) {
        console.error('Verification failed:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not perform drug verification.',
        });
        setAnalysis("An unexpected error occurred during verification. Please try again or check the console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyDrug();
  }, [barcode, router, toast]);


  if (isLoading || !analysis) {
    return (
        <div className="container py-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-muted-foreground">
                <ScanLine className="h-12 w-12 mx-auto animate-pulse mb-4" />
                <p className="font-semibold">Contacting AI Assistant for analysis...</p>
                <p className="text-sm">Please wait while we check all available data sources.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="p-6 bg-muted/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Bot className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-3xl font-bold">Verification Result</CardTitle>
                        <CardDescription className="font-semibold text-primary">
                            Barcode: {barcode}
                        </CardDescription>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <Card className="bg-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><AlertCircle className="h-5 w-5 text-accent"/>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{analysis}</p>
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
