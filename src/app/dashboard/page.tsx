
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
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import ItemsGrid, { type Item } from '@/components/items-grid';
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, format, addDays } from 'date-fns';
import { DateRange } from "react-day-picker";

const initialItems: Item[] = [
  { id: '1', title: 'Weekly Groceries', image: 'https://placehold.co/600x400.png', aiHint: 'receipt groceries', totalPayable: 125.50, balance: 125.50, claimed: false, date: '2023-10-26', uploaderId: 'user1', participantIds: ['user1', 'user2'] },
  { id: '2', title: 'Dinner at The Italian Place', image: 'https://placehold.co/600x400.png', aiHint: 'restaurant bill', totalPayable: 88.00, balance: 88.00, claimed: false, date: '2023-10-24', uploaderId: 'user2', participantIds: ['user1', 'user2', 'user3'] },
  { id: '3', title: 'Morning Coffee & Pastries', image: 'https://placehold.co/600x400.png', aiHint: 'coffee shop', totalPayable: 15.75, balance: 0, claimed: true, date: '2023-10-23', uploaderId: 'user1', participantIds: ['user1'] },
  { id: '4', title: 'Movie Night Tickets', image: 'https://placehold.co/600x400.png', aiHint: 'movie tickets', totalPayable: 32.00, balance: 32.00, claimed: false, date: '2023-10-22', uploaderId: 'user3', participantIds: ['user3', 'user1'] },
  { id: '5', title: 'New Headphones', image: 'https://placehold.co/600x400.png', aiHint: 'electronics store', totalPayable: 199.99, balance: 199.99, claimed: false, date: '2023-10-20', uploaderId: 'user1', participantIds: ['user1'] },
  { id: '6', title: 'Summer T-Shirt', image: 'https://placehold.co/600x400.png', aiHint: 'clothing tag', totalPayable: 29.95, balance: 0, claimed: true, date: '2023-10-18', uploaderId: 'user2', participantIds: ['user2'] },
  { id: '7', title: 'Hardware Store Run', image: 'https://placehold.co/600x400.png', aiHint: 'store receipt', totalPayable: 45.20, balance: 45.20, claimed: false, date: '2023-10-15', uploaderId: 'user1', participantIds: ['user1', 'user3'] },
  { id: '8', title: 'Bookstore Haul', image: 'https://placehold.co/600x400.png', aiHint: 'book store', totalPayable: 64.80, balance: 64.80, claimed: false, date: '2023-10-12', uploaderId: 'user2', participantIds: ['user2', 'user1'] },
];

const currentUserId = 'user1';


export default function Dashboard() {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('current_month');
    const [ownershipFilter, setOwnershipFilter] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
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
    
    const handleDateFilterChange = (value: string) => {
        setDateFilter(value);
        if (value !== 'custom') {
            setDateRange(undefined);
        }
    }

    const filteredItems = useMemo(() => {
        let results = items;

        // Filter by ownership
        if (ownershipFilter === 'my_uploads') {
            results = results.filter(item => item.uploaderId === currentUserId);
        } else if (ownershipFilter === 'my_bills') {
            results = results.filter(item => item.participantIds.includes(currentUserId));
        }

        // Filter by date
        if (dateFilter !== 'all') {
            let interval: Interval | undefined;
            const now = new Date();

            if (dateFilter === 'current_month') {
                interval = { start: startOfMonth(now), end: endOfMonth(now) };
            } else if (dateFilter === 'last_month') {
                const lastMonth = subMonths(now, 1);
                interval = { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            } else if (dateFilter === 'custom' && dateRange?.from && dateRange?.to) {
                interval = { start: dateRange.from, end: dateRange.to };
            }
             else if (dateFilter === 'custom' && dateRange?.from) {
                interval = { start: dateRange.from, end: addDays(dateRange.from, 1) };
            }

            if(interval) {
                results = results.filter(item => isWithinInterval(new Date(item.date), interval!));
            } else if (dateFilter === 'custom') {
                // if custom is selected but no range, show nothing
                results = [];
            }
        }

        // Filter by search term
        if (searchTerm) {
            results = results.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return results;

    }, [items, searchTerm, dateFilter, dateRange, ownershipFilter]);

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by title..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by involvement" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Show All</SelectItem>
                        <SelectItem value="my_uploads">My Uploads</SelectItem>
                        <SelectItem value="my_bills">My Bills</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="current_month">Current Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>
                {dateFilter === 'custom' && (
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className="w-[300px] justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
      <ItemsGrid items={filteredItems} onClaim={handleClaimItem} />
    </div>
  );
}
