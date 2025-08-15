
"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ItemsGrid, { type Item } from '@/components/items-grid';
import { useToast } from "@/hooks/use-toast";
import { Search } from 'lucide-react';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const initialItems: Item[] = [
  { id: '1', title: 'Weekly Groceries', image: 'https://placehold.co/600x400.png', aiHint: 'receipt groceries', totalPayable: 125.50, balance: 125.50, claimed: false, date: '2023-10-26' },
  { id: '2', title: 'Dinner at The Italian Place', image: 'https://placehold.co/600x400.png', aiHint: 'restaurant bill', totalPayable: 88.00, balance: 88.00, claimed: false, date: '2023-10-24' },
  { id: '3', title: 'Morning Coffee & Pastries', image: 'https://placehold.co/600x400.png', aiHint: 'coffee shop', totalPayable: 15.75, balance: 0, claimed: true, date: '2023-10-23' },
  { id: '4', title: 'Movie Night Tickets', image: 'https://placehold.co/600x400.png', aiHint: 'movie tickets', totalPayable: 32.00, balance: 32.00, claimed: false, date: '2023-10-22' },
  { id: '5', title: 'New Headphones', image: 'https://placehold.co/600x400.png', aiHint: 'electronics store', totalPayable: 199.99, balance: 199.99, claimed: false, date: '2023-10-20' },
  { id: '6', title: 'Summer T-Shirt', image: 'https://placehold.co/600x400.png', aiHint: 'clothing tag', totalPayable: 29.95, balance: 0, claimed: true, date: '2023-10-18' },
  { id: '7', title: 'Hardware Store Run', image: 'https://placehold.co/600x400.png', aiHint: 'store receipt', totalPayable: 45.20, balance: 45.20, claimed: false, date: '2023-10-15' },
  { id: '8', title: 'Bookstore Haul', image: 'https://placehold.co/600x400.png', aiHint: 'book store', totalPayable: 64.80, balance: 64.80, claimed: false, date: '2023-10-12' },
];


export default function Dashboard() {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('current_month');
    const { toast } = useToast();
  
    const handleClaimItem = (id: string) => {
      const itemToClaim = items.find(item => item.id === id);
      if (itemToClaim) {
          setItems(items.map(item => 
              item.id === id ? { ...item, claimed: true, balance: 0 } : item
          ));
          toast({
              title: "Item Claimed!",
              description: `You have successfully claimed "${itemToClaim.title}".`,
          });
      }
    };

    const filteredItems = useMemo(() => {
        let dateFiltered = items;

        if (dateFilter !== 'all') {
            const now = new Date();
            let interval: Interval;

            if (dateFilter === 'current_month') {
                interval = { start: startOfMonth(now), end: endOfMonth(now) };
            } else { // last_month
                const lastMonth = subMonths(now, 1);
                interval = { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            }

            dateFiltered = items.filter(item => isWithinInterval(new Date(item.date), interval));
        }

        if (!searchTerm) {
            return dateFiltered;
        }

        return dateFiltered.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm, dateFilter]);

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by title..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                </SelectContent>
            </Select>
        </div>
      <ItemsGrid items={filteredItems} onClaim={handleClaimItem} />
    </div>
  );
}
