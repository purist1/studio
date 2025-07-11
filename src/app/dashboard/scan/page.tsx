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
    const query = formData.get('query') as string;
    if (query) {
      router.push(`/dashboard/results?query=${encodeURIComponent(query)}`);
    }
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
              Enter a drug's name, barcode, or NDC number to verify its authenticity.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleManualSubmit}>
            <CardContent>
                <div className="space-y-2 pt-4">
                    <Label htmlFor="query-input" className="sr-only">
                        Enter Drug Name, Barcode, or NDC
                    </Label>
                    <Input id="query-input" name="query" placeholder="e.g., Amoxicillin or 0093-8547-52" required className="text-center text-lg h-12"/>
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
