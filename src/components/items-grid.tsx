
"use client";

import { useState } from 'react';
import ItemCard from './item-card';
import { useToast } from "@/hooks/use-toast";

export interface Item {
  id: string;
  title: string;
  image: string;
  aiHint: string;
  totalPayable: number;
  balance: number;
  claimed: boolean;
  date: string;
}

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

export default function ItemsGrid() {
  const [items, setItems] = useState<Item[]>(initialItems);
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} onClaim={handleClaimItem} />
      ))}
    </div>
  );
}
