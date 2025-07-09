'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { flagSuspectDrug, type FlagSuspectDrugOutput } from '@/ai/flows/flag-suspect-drugs';
import { getMockDrugDetails } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2, FlaskConical, Calendar, Hash, ScanLine, AlertCircle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type VerificationResult = FlagSuspectDrugOutput & {
    drugDetails: ReturnType<typeof getMockDrugDetails>
};

export function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcode = searchParams.get('barcode');
  const { toast } = useToast();

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barcode) {
      router.replace('/dashboard/scan');
      return;
    }

    const verifyDrug = async () => {
      setIsLoading(true);
      try {
        const drugDetails = getMockDrugDetails(barcode);
        const aiResult = await flagSuspectDrug(drugDetails);
        setResult({ ...aiResult, drugDetails });
      } catch (error) {
        console.error('Verification failed:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not perform drug verification.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyDrug();
  }, [barcode, router, toast]);

  const handleFlagForNafdac = () => {
    toast({
      title: 'Drug Flagged',
      description: 'This drug has been flagged for review by NAFDAC.',
    });
  };

  if (isLoading || !result) {
    return (
        <div className="container py-8 max-w-4xl mx-auto flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <ScanLine className="h-12 w-12 mx-auto animate-pulse mb-4" />
                <p className="font-semibold">Verifying Drug...</p>
                <p className="text-sm">Please wait while we check the details.</p>
            </div>
        </div>
    );
  }

  const { isSuspect, reason, drugDetails } = result;
  const status = isSuspect ? 'Suspect' : 'Verified';
  const statusIcon = isSuspect ? (
    <AlertTriangle className="h-8 w-8 text-destructive" />
  ) : (
    <CheckCircle2 className="h-8 w-8 text-green-500" />
  );
  const statusColor = isSuspect ? 'destructive' : 'default';
  const statusBg = isSuspect ? 'bg-red-100 dark:bg-red-900/10' : 'bg-green-100 dark:bg-green-900/10';

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card className={`shadow-lg border-2 ${isSuspect ? 'border-destructive' : 'border-green-500'}`}>
        <CardHeader className={`p-6 ${statusBg}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {statusIcon}
                    <div>
                        <CardTitle className="text-3xl font-bold">{status}</CardTitle>
                        <CardDescription className={`font-semibold ${isSuspect ? 'text-destructive' : 'text-green-600'}`}>
                            Barcode: {barcode}
                        </CardDescription>
                    </div>
                </div>
                 <Badge variant={statusColor} className="text-lg px-4 py-2">{status}</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <Card className="bg-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><AlertCircle className="h-5 w-5 text-accent"/>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{reason}</p>
                </CardContent>
            </Card>

            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-accent"/>Drug Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-3"><FlaskConical className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">Manufacturer:</span> {drugDetails.manufacturer}</div>
                <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">Production Date:</span> {drugDetails.productionDate}</div>
                <div className="flex items-center gap-3"><Hash className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">Batch Number:</span> {drugDetails.batchNumber}</div>
              </div>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">OpenFDA Details</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{drugDetails.openFDADetails}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">GS1 Details</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{drugDetails.gs1Details}</CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-base">Internal Dataset Details</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{drugDetails.internalDatasetDetails}</CardContent>
                </Card>
            </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-4 bg-muted/50 p-6">
            <Button variant="outline" asChild>
                <Link href="/dashboard/scan">
                  <ScanLine className="mr-2 h-4 w-4"/>
                  Scan Another Drug
                </Link>
            </Button>
            {isSuspect && (
                <Button variant="destructive" onClick={handleFlagForNafdac}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Flag for NAFDAC
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
