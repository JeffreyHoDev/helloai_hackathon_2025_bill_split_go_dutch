
"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Item } from './items-grid';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ItemCardProps {
  item: Item;
  onClaim: (id: string) => void;
}

export default function ItemCard({ item, onClaim }: ItemCardProps) {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const handleClaimClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent navigation when claiming
    if (!item.claimed) {
      onClaim(item.id);
    }
  };

  return (
    <Link href={`/dashboard/receipt/${item.id}`} className="flex">
      <Card className="w-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full">
              <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
                  data-ai-hint={item.aiHint}
              />
              {item.claimed && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                      <Badge variant="secondary" className="text-lg bg-opacity-80 backdrop-blur-sm">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                          Claimed
                      </Badge>
                   </div>
              )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2">{item.title}</CardTitle>
          <div className="flex justify-between items-baseline text-muted-foreground">
            <span className="text-sm">Total:</span>
            <span className="font-mono text-base text-foreground font-medium">{formatCurrency(item.totalPayable)}</span>
          </div>
          <div className="flex justify-between items-baseline text-muted-foreground">
            <span className="text-sm">Balance:</span>
            <span className="font-mono text-base font-medium" style={{ color: 'hsl(var(--accent-foreground))' }}>{formatCurrency(item.balance)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
              className="w-full"
              onClick={handleClaimClick}
              disabled={item.claimed}
              style={!item.claimed ? { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' } : {}}
          >
              {item.claimed ? 'Claimed' : 'Claim'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
