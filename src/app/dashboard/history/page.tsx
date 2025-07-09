'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockScans } from '@/lib/data';
import type { Scan } from '@/lib/types';
import { ListFilter, Search, FileDown } from 'lucide-react';

const statusColors: { [key in Scan['status']]: string } = {
    Verified: 'bg-green-100 text-green-800 border-green-200',
    Suspect: 'bg-red-100 text-red-800 border-red-200',
    Unknown: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<Scan['status']>>(new Set());

  const filteredScans = useMemo(() => {
    return mockScans
      .filter((scan) => {
        if (statusFilters.size === 0) return true;
        return statusFilters.has(scan.status);
      })
      .filter((scan) => {
        const search = searchTerm.toLowerCase();
        return (
          scan.drugName.toLowerCase().includes(search) ||
          scan.manufacturer.toLowerCase().includes(search) ||
          scan.barcode.toLowerCase().includes(search)
        );
      });
  }, [searchTerm, statusFilters]);

  const toggleStatusFilter = (status: Scan['status']) => {
    setStatusFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(filteredScans, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'scan-history.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
        <p className="text-muted-foreground">
          A log of all drugs verified through the app.
        </p>
      </div>

      <div className="bg-card p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by drug name, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(['Verified', 'Suspect', 'Unknown'] as Scan['status'][]).map(
                  (status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilters.has(status)}
                      onCheckedChange={() => toggleStatusFilter(status)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={downloadJSON}>
              <FileDown className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-medium">{scan.drugName}</TableCell>
                    <TableCell>{scan.manufacturer}</TableCell>
                    <TableCell className="text-muted-foreground">{scan.barcode}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[scan.status]}>{scan.status}</Badge>
                    </TableCell>
                    <TableCell>{scan.timestamp.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
