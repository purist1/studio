'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, ScanLine, Type } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();

  const handleSimulateScan = () => {
    const barcodes = ['VALID123456789', 'SUSPECT987654321', 'UNKNOWN11223344'];
    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
    router.push(`/dashboard/results?barcode=${randomBarcode}`);
  };

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const barcode = formData.get('barcode') as string;
    if (barcode) {
      router.push(`/dashboard/results?barcode=${barcode}`);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Drug Barcode</CardTitle>
            <CardDescription>
              Position the drug&apos;s barcode in front of the camera or enter it manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-8 text-center border-2 border-dashed">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Webcam Scanner</h3>
              <p className="text-muted-foreground text-sm">
                Webcam functionality is simulated. Use the buttons below.
              </p>
            </div>
            <div className="mt-6 text-center">
               <Button size="lg" onClick={handleSimulateScan}>
                <ScanLine className="mr-2 h-5 w-5" />
                Simulate Scan
              </Button>
            </div>
          </CardContent>
          
          <div className="p-6 pt-0 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground font-semibold">OR</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleManualSubmit}>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="barcode-input" className="flex items-center">
                        <Type className="mr-2 h-4 w-4 text-muted-foreground"/>
                        Enter Barcode Manually
                    </Label>
                    <Input id="barcode-input" name="barcode" placeholder="e.g., VALID123456789" />
                </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Verify Manually
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
