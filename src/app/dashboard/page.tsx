
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, format, addDays, Interval } from 'date-fns';
import { DateRange } from "react-day-picker";
import type { Item } from '@/types';

export default function Dashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('current_month');
    const [ownershipFilter, setOwnershipFilter] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    useEffect(() => {
      const fetchReceipts = async () => {
        if (user) {
          try {
            const idToken = await user.getIdToken();
            const res = await fetch('http://localhost:3001/api/receipts', {
              headers: {
                'Authorization': `Bearer ${idToken}`,
              },
            });

            if (res.ok) {
              const data = await res.json();
              setItems(data);
            } else {
              console.error("Failed to fetch receipts");
            }
          } catch (error) {
            console.error("Error fetching receipts: ", error);
          }
        }
      };

      fetchReceipts();
    }, [user]);
    
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
            results = results.filter(item => item.uploaderId === user?.uid);
        } else if (ownershipFilter === 'my_bills') {
            results = results.filter(item => item.participantIds.includes(user?.uid));
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

    }, [items, searchTerm, dateFilter, dateRange, ownershipFilter, user]);

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
      <ItemsGrid items={filteredItems} />
    </div>
  );
}
