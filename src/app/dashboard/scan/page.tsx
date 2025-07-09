'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, Type, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState('');

  // Request camera permission and start the stream
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsScanning(true);
          }
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Barcode detection effect
  useEffect(() => {
    if (!isScanning || detectedBarcode) return;

    if (!('BarcodeDetector' in window)) {
        console.log('Barcode Detector is not supported by this browser.');
        toast({
            variant: 'destructive',
            title: 'Browser Not Supported',
            description: 'Barcode detection is not supported on this browser. Please enter the code manually.',
        });
        setIsScanning(false);
        return;
    }

    const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'qr_code', 'code_128', 'code_39', 'upc_a', 'upc_e', 'itf'],
    });

    const intervalId = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState >= 3) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0 && !detectedBarcode) {
            setDetectedBarcode(barcodes[0].rawValue);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [isScanning, toast, detectedBarcode]);
  
  // Navigate when barcode is detected
  useEffect(() => {
    if (detectedBarcode) {
      setIsScanning(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      router.push(`/dashboard/results?barcode=${detectedBarcode}`);
    }
  }, [detectedBarcode, router]);


  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const barcode = formData.get('barcode') as string;
    if (barcode) {
      router.push(`/dashboard/results?barcode=${barcode}`);
    }
  };

  const ScannerOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
        <div className="relative w-full h-1/2">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/50 animate-pulse"></div>
        </div>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Drug Barcode</CardTitle>
            <CardDescription>
              Position the drug&apos;s barcode inside the frame.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-1 text-center border-2 border-dashed relative overflow-hidden">
                {hasCameraPermission === undefined && (
                    <>
                        <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Requesting Camera Access</h3>
                        <p className="text-muted-foreground text-sm">Please wait...</p>
                    </>
                )}

                {hasCameraPermission === false && (
                    <div className="p-4">
                        <Alert variant="destructive">
                            <VideoOff className="h-4 w-4"/>
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings. You can still enter barcodes manually.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                
                {hasCameraPermission === true && (
                   <>
                     <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                     {isScanning && <ScannerOverlay />}
                     {!isScanning && detectedBarcode && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                            <p className="font-semibold">Scan complete!</p>
                            <p className="text-sm">Redirecting to results...</p>
                        </div>
                     )}
                   </>
                )}
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
