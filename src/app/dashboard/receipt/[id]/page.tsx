
"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


// Mock data - in a real app, you'd fetch this based on the `id` param
const receiptDetails = {
  id: '1',
  title: 'Weekly Groceries',
  images: [
    'https://placehold.co/600x800.png',
    'https://placehold.co/600x800.png',
    'https://placehold.co/600x800.png',
  ],
  aiHint: 'receipt groceries',
  uploaderId: 'user1', // The ID of the user who uploaded this
  items: [
    { id: 'i1', name: 'Organic Bananas', price: 2.50, claimedBy: null },
    { id: 'i2', name: 'Almond Milk', price: 4.15, claimedBy: null },
    { id: 'i3', name: 'Avocados (4-pack)', price: 6.99, claimedBy: 'user2' },
    { id: 'i4', name: 'Sourdough Bread', price: 5.49, claimedBy: null },
    { id: 'i5', name: 'Free-Range Eggs', price: 7.20, claimedBy: 'user3' },
    { id: 'i6', name: 'Greek Yogurt', price: 4.75, claimedBy: 'user2' },
  ]
};

const users = {
  'user1': { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  'user2': { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
  'user3': { name: 'Sam Wilson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
};

// Assume the current user is the uploader for demonstration
const currentUserId = 'user1';


export default function ReceiptPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState(receiptDetails.items);
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const { toast } = useToast();
  const isUploader = currentUserId === receiptDetails.uploaderId;

  const handleClaim = (itemId: string) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId && !item.claimedBy) {
        toast({
          title: "Item Claimed!",
          description: `You have successfully claimed "${item.name}".`,
        });
        return { ...item, claimedBy: currentUserId };
      }
      return item;
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName && newItemPrice) {
        const newItem = {
            id: `i${Date.now()}`,
            name: newItemName,
            price: parseFloat(newItemPrice),
            claimedBy: null,
        };
        setItems([...items, newItem]);
        toast({
            title: "Item Added",
            description: `${newItem.name} has been added to the list.`,
        });
        setNewItemName('');
        setNewItemPrice('');
        setAddItemDialogOpen(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find(item => item.id === itemId);
    setItems(items.filter(item => item.id !== itemId));
    if (itemToDelete) {
        toast({
            title: "Item Deleted",
            description: `${itemToDelete.name} has been removed from the list.`,
            variant: "destructive"
        });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">{receiptDetails.title}</h1>
        <Card>
          <CardContent className="p-2">
            <Carousel className="w-full">
              <CarouselContent>
                {receiptDetails.images.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={src}
                        alt={`Receipt image ${index + 1}`}
                        fill
                        className="object-contain rounded-md"
                        data-ai-hint={receiptDetails.aiHint}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-16" />
              <CarouselNext className="mr-16" />
            </Carousel>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Items List</h2>
            {isUploader && (
                <Dialog open={isAddItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><PlusCircle className="mr-2"/> Add Item</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                            <DialogDescription>Manually add an item to the receipt list.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" placeholder="e.g. Soda" required/>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">Price</Label>
                                    <Input id="price" type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="col-span-3" placeholder="e.g. 2.50" required/>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Item</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
        <Card>
            <CardContent className="p-0">
                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {items.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex items-center p-4">
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    {item.claimedBy ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <span>Claimed by</span>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={users[item.claimedBy as keyof typeof users]?.avatar} />
                                                <AvatarFallback>{users[item.claimedBy as keyof typeof users]?.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={() => handleClaim(item.id)} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                                            Claim
                                        </Button>
                                    )}
                                    {isUploader && !item.claimedBy && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the item
                                                    "{item.name}" from the list.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                           {index < items.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
