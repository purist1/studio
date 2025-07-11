'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle2, AlertTriangle, HelpCircle, MessageSquare, Loader2 } from 'lucide-react';
import { getScanHistory } from '@/services/scan-history';
import type { Scan, User } from '@/lib/types';
import { format } from 'date-fns';

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
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // This code runs only on the client, after hydration
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Fetch history for the current user
        const history = await getScanHistory(currentUser.id);
        setRecentScans(history.slice(0, 3));
        setTotalScans(history.length);
      } catch (error) {
        console.error("Failed to fetch scan history", error);
        setRecentScans([]);
        setTotalScans(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser?.fullname || 'CUSTECH Staff'}</h1>
          <p className="text-muted-foreground">Ready to verify some drugs? Let&apos;s get started.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/chat">
              <MessageSquare className="mr-2 h-5 w-5" />
              Ask AI Assistant
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/dashboard/scan">
              <ScanLine className="mr-2 h-5 w-5" />
              Verify Drug
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Here are the latest drugs you&apos;ve scanned.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
               <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2"/>
                  <p>Loading recent scans...</p>
              </div>
            ) : recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {statusIcons[scan.status]}
                    <div>
                      <p className="font-semibold">{scan.drugName || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{scan.manufacturer || 'N/A'} - {scan.barcode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge variant="outline" className={statusColors[scan.status]}>{scan.status}</Badge>
                     <span className="text-sm text-muted-foreground hidden md:block">
                        {format(new Date(scan.timestamp), 'PP')}
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
            {totalScans > 3 && (
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
