'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, Type, VideoOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { detectBarcode } from '@/ai/flows/detect-barcode-from-image';

// Debounce function to limit how often we call the expensive AI
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}


export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState('');

  // Stop all streams and intervals
  const cleanup = useCallback(() => {
    if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request camera permission and start the stream
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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

    return cleanup;
  }, [toast, cleanup]);

  // Debounced barcode detection function
  const debouncedDetectBarcode = useCallback(
    debounce(async (imageDataUri: string) => {
      if (detectedBarcode) return; // Already found one
      try {
        const result = await detectBarcode({ imageDataUri });
        if (result.barcode) {
          setDetectedBarcode(result.barcode);
        }
      } catch (error) {
        console.error("Error detecting barcode:", error);
        // Optionally show a toast for backend errors
      } finally {
        setIsProcessing(false); // Ready for next frame
      }
    }, 500),
    [detectedBarcode]
  );
  
  // Barcode detection interval
  useEffect(() => {
    if (!isCameraReady || detectedBarcode) {
        if(scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        return;
    }

    scanIntervalRef.current = setInterval(() => {
        if (isProcessing || !videoRef.current || !canvasRef.current) return;
        
        setIsProcessing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataUri = canvas.toDataURL('image/jpeg');
            debouncedDetectBarcode(imageDataUri);
        } else {
             setIsProcessing(false);
        }

    }, 200); // How often to capture a frame

    return () => {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    }

  }, [isCameraReady, isProcessing, detectedBarcode, debouncedDetectBarcode]);
  
  // Navigate when barcode is detected
  useEffect(() => {
    if (detectedBarcode) {
        cleanup();
        router.push(`/dashboard/results?barcode=${detectedBarcode}`);
    }
  }, [detectedBarcode, router, cleanup]);


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
            {isProcessing && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/50 animate-pulse"></div>}
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
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-center border-2 border-dashed relative overflow-hidden">
                <video
                    ref={videoRef}
                    className={cn(
                        'w-full h-full object-cover',
                        !isCameraReady && 'hidden'
                    )}
                    autoPlay
                    playsInline
                    muted
                    onCanPlay={() => setIsCameraReady(true)}
                />
                <canvas ref={canvasRef} className="hidden" />

                {isCameraReady && <ScannerOverlay />}

                {hasCameraPermission === undefined && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                        <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Requesting Camera Access</h3>
                        <p className="text-muted-foreground text-sm">Please wait...</p>
                    </div>
                )}
                
                {hasCameraPermission && !isCameraReady && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                        <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
                        <h3 className="font-semibold text-lg">Starting Camera...</h3>
                    </div>
                )}

                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4">
                        <Alert variant="destructive">
                            <VideoOff className="h-4 w-4"/>
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please allow camera access. You can still enter barcodes manually below.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                
                {detectedBarcode && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <p className="font-semibold">Scan complete!</p>
                        <p className="text-sm">Redirecting to results...</p>
                    </div>
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
