'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const drugName = formData.get('drugName') as string;
    const ndc = formData.get('ndc') as string;
    const gtin = formData.get('gtin') as string;
    const nafdacNumber = formData.get('nafdacNumber') as string;
    
    if (!drugName && !ndc && !gtin && !nafdacNumber) {
        // Simple validation: at least one field must be filled
        alert("Please fill in at least one field.");
        return;
    }

    const params = new URLSearchParams();
    if (drugName) params.set('drugName', drugName);
    if (ndc) params.set('ndc', ndc);
    if (gtin) params.set('gtin', gtin);
    if (nafdacNumber) params.set('nafdacNumber', nafdacNumber);
    
    router.push(`/dashboard/results?${params.toString()}`);
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl pt-4">Drug Verification Center</CardTitle>
            <CardDescription>
              Enter the information from the drug's packaging to verify its authenticity.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleManualSubmit}>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="drugName-input">Drug Name (as seen on the carton)</Label>
                    <Input id="drugName-input" name="drugName" placeholder="e.g., Amoxicillin 500mg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="nafdac-input">NAFDAC Registration Number</Label>
                    <Input id="nafdac-input" name="nafdacNumber" placeholder="e.g., A4-1234" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="ndc-input">NDC Number (National Drug Code)</Label>
                    <Input id="ndc-input" name="ndc" placeholder="e.g., 0093-8547-52" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="gtin-input">GTIN Number (from barcode)</Label>
                    <Input id="gtin-input" name="gtin" placeholder="e.g., 00312345678906" />
                </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg">
                <Search className="mr-2 h-5 w-5" />
                Verify Drug
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
