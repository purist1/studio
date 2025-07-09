import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { mockScans } from '@/lib/data';
import type { Scan } from '@/lib/types';

const statusIcons: { [key in Scan['status']]: React.ReactNode } = {
  Verified: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  Suspect: <AlertTriangle className="h-5 w-5 text-red-500" />,
  Unknown: <HelpCircle className="h-5 w-5 text-yellow-500" />,
};

const statusColors: { [key in Scan['status']]: string } = {
    Verified: 'bg-green-100 text-green-800 border-green-200',
    Suspect: 'bg-red-100 text-red-800 border-red-200',
    Unknown: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};


export default function DashboardPage() {
  const recentScans = mockScans.slice(0, 3);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, CUSTECH Staff</h1>
          <p className="text-muted-foreground">Ready to verify some drugs? Let&apos;s get started.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/scan">
            <ScanLine className="mr-2 h-5 w-5" />
            Scan New Drug
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Here are the latest drugs you&apos;ve scanned.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {statusIcons[scan.status]}
                    <div>
                      <p className="font-semibold">{scan.drugName}</p>
                      <p className="text-sm text-muted-foreground">{scan.manufacturer} - {scan.barcode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge variant="outline" className={statusColors[scan.status]}>{scan.status}</Badge>
                     <span className="text-sm text-muted-foreground hidden md:block">
                        {scan.timestamp.toLocaleDateString()}
                     </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t scanned any drugs yet.</p>
              </div>
            )}
          </div>
            {mockScans.length > 3 && (
                 <div className="mt-6 text-center">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/history">View All Scans</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
