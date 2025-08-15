
"use client";

import ItemCard from './item-card';

export interface Item {
  id: string;
  title: string;
  image: string;
  aiHint: string;
  totalPayable: number;
  balance: number;
  claimed: boolean;
  date: string;
  uploaderId: string;
  participantIds: string[];
}

interface User {
    name: string;
    avatar: string;
}
  
interface Users {
    [key: string]: User;
}

interface ItemsGridProps {
  items: Item[];
  users: Users;
}

export default function ItemsGrid({ items, users }: ItemsGridProps) {

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 col-span-full">
        <p>No receipts found.</p>
        <p className="text-sm">Try adjusting your search or filter.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} uploader={users[item.uploaderId]} />
      ))}
    </div>
  );
}
