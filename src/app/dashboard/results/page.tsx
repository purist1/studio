import { Suspense } from 'react';
import { ResultsContent } from './results-content';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                     <div>
                        <Skeleton className="h-6 w-1/3 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 mt-8">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
