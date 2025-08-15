
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Item } from '@/types';
import { CheckCircle2, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const uploader = item.users ? item.users[item.uploaderId] : null;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <Link href={`/dashboard/receipt/${item.id}`} className="flex">
      <Card className="w-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full">
              <Image
                  src={item.images[0]?.gcsUrl || ''}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
                  data-ai-hint={item.images[0]?.analysis?.aiHint || ''}
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
        <CardContent className="p-4 flex-grow space-y-2">
          <CardTitle className="text-lg font-semibold mb-1">{item.title}</CardTitle>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDate(item.date)}</span>
            </div>
            {uploader && (
                <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Uploaded by {uploader.name}</span>
                </div>
            )}
          </div>
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
        </CardFooter>
      </Card>
    </Link>
  );
}
