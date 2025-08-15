
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { CheckCircle2, PlusCircle, Trash2, Calendar, Users, UserPlus, User, ArrowRight } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';


"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { Separator }m '@/components/ui/separator';
import { CheckCircle2, PlusCircle, Trash2, Calendar, Users, UserPlus, User, ArrowRight } from 'lucide-react';
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
import { Input }m "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { Receipt, ReceiptItem, User as UserType } from '@/types';

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [receiptDetails, setReceiptDetails] = useState<Receipt | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isAddParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchReceipt = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const res = await fetch(`http://localhost:3001/api/receipts/${params.id}`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (res.ok) {
            const data: Receipt = await res.json();
            setReceiptDetails(data);
            setItems(data.items || []);
            setParticipants(data.participantIds || []);
          } else {
            console.error("Failed to fetch receipt");
            toast({
              title: "Error",
              description: "Failed to load receipt details.",
              variant: "destructive",
            });
            router.push('/dashboard'); // Redirect to dashboard on error
          }
        } catch (error) {
          console.error("Error fetching receipt: ", error);
          toast({
            title: "Error",
            description: "Failed to load receipt details.",
            variant: "destructive",
          });
          router.push('/dashboard'); // Redirect to dashboard on error
        }
      }
    };

    fetchReceipt();
  }, [params.id, user, router, toast]);

  if (!receiptDetails) {
    return <div className="flex min-h-screen items-center justify-center">Loading receipt...</div>;
  }

  const isUploader = user?.uid === receiptDetails.uploaderId;
  const uploaderInfo = receiptDetails.users[receiptDetails.uploaderId];

  const handleSelectionChange = (itemId: string) => {
    setSelectedItems(prev =>
        prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId]
    );
  };

  const handleProceedToPayment = () => {
    const selectedItemDetails = items
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({ id: item.id, name: item.name, price: item.price }));
    
    // In a real app, you might want to encrypt this or pass it more securely
    const query = new URLSearchParams({
        receiptId: params.id,
        items: JSON.stringify(selectedItemDetails),
    });
    router.push(`/dashboard/payment?${query.toString()}`);
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName && newItemPrice) {
        try {
            const idToken = await user?.getIdToken();
            const res = await fetch(`http://localhost:3001/api/receipts/${receiptDetails.id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ name: newItemName, price: parseFloat(newItemPrice) }),
            });

            if (res.ok) {
                const addedItem = await res.json();
                setItems(prev => [...prev, addedItem]);
                toast({
                    title: "Item Added",
                    description: `${newItemName} has been added to the list.`,
                });
                setNewItemName('');
                setNewItemPrice('');
                setAddItemDialogOpen(false);
            } else {
                console.error("Failed to add item");
                toast({
                    title: "Error",
                    description: "Failed to add item.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error adding item: ", error);
            toast({
                title: "Error",
                description: "Failed to add item.",
                variant: "destructive",
            });
        }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
        const idToken = await user?.getIdToken();
        const res = await fetch(`http://localhost:3001/api/receipts/${receiptDetails.id}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (res.ok) {
            setItems(prev => prev.filter(item => item.id !== itemId));
            toast({
                title: "Item Deleted",
                description: "Item has been removed from the list.",
                variant: "destructive"
            });
        } else {
            console.error("Failed to delete item");
            toast({
                title: "Error",
                description: "Failed to delete item.",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Error deleting item: ", error);
        toast({
            title: "Error",
            description: "Failed to delete item.",
            variant: "destructive",
        });
    }
  };

  const handleParticipantChange = (userId: string) => {
    setParticipants(prev =>
        prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
    );
  };

  const saveParticipants = async () => {
    try {
        const idToken = await user?.getIdToken();
        const res = await fetch(`http://localhost:3001/api/receipts/${receiptDetails.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ participantIds: participants }),
        });

        if (res.ok) {
            toast({
                title: "Participants Updated",
                description: "The participant list has been saved.",
            });
            setAddParticipantDialogOpen(false);
        } else {
            console.error("Failed to update participants");
            toast({
                title: "Error",
                description: "Failed to update participants.",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Error saving participants: ", error);
        toast({
            title: "Error",
            description: "Failed to save participants.",
            variant: "destructive",
        });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{receiptDetails.title}</h1>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(receiptDetails.date)}</span>
                </div>
                 <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Uploaded by {uploaderInfo?.name}</span>
                </div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="flex items-center text-sm font-medium text-muted-foreground"><Users className="mr-2 h-4 w-4" /> Participants</h3>
                {isUploader && (
                    <Dialog open={isAddParticipantDialogOpen} onOpenChange={setAddParticipantDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4"/> Manage</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Participants</DialogTitle>
                                <DialogDescription>Add or remove friends who are part of this receipt.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-4 max-h-60 overflow-y-auto pr-2">
                                {Object.values(receiptDetails.users).map((user: UserType) => (
                                    <div key={user.email} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`participant-${user.email}`}
                                            checked={participants.includes(user.email)}
                                            onCheckedChange={() => handleParticipantChange(user.email)}
                                            disabled={user.email === uploaderInfo?.email} // Can't remove self
                                        />
                                        <Label htmlFor={`participant-${user.email}`} className="font-normal flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {user.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button onClick={saveParticipants}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                {participants.map(userId => (
                    <Tooltip key={userId}>
                        <TooltipTrigger>
                            <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-border">
                                <AvatarImage src={receiptDetails.users[userId]?.avatar} />
                                <AvatarFallback>{receiptDetails.users[userId]?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{receiptDetails.users[userId]?.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
              </TooltipProvider>
            </div>
        </div>
        <Card>
          <CardContent className="p-2">
            <Carousel className="w-full">
              <CarouselContent>
                {receiptDetails.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={image.gcsUrl}
                        alt={`Receipt image ${index + 1}`}
                        fill
                        className="object-contain rounded-md"
                        data-ai-hint={image.analysis?.aiHint || ''}
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
                <div className="space-y-2 max-h-[calc(70vh-80px)] overflow-y-auto">
                    {items.map((item, index) => (
                        <div key={item.id} className={cn({"opacity-50": !!item.claimedBy})}>
                            <div className="flex items-center p-4">
                                <Checkbox
                                    id={`item-${item.id}`}
                                    checked={selectedItems.includes(item.id)}
                                    onCheckedChange={() => handleSelectionChange(item.id)}
                                    disabled={!!item.claimedBy}
                                    className="mr-4"
                                />
                                <Label htmlFor={`item-${item.id}`} className={cn("flex-1", {"cursor-pointer": !item.claimedBy})}>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                                </Label>
                                <div className="flex items-center gap-x-4">
                                    {item.claimedBy ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <span>Claimed by</span>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={receiptDetails.users[item.claimedBy]?.avatar} />
                                                <AvatarFallback>{receiptDetails.users[item.claimedBy]?.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ) : (
                                       isUploader && (
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
                                       )
                                    )}
                                </div>
                            </div>
                           {index < items.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
            </CardContent>
            {selectedItems.length > 0 && (
                <>
                    <Separator />
                    <CardContent className="p-4">
                        <Button className="w-full" onClick={handleProceedToPayment}>
                            Proceed to Payment ({selectedItems.length} items)
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </>
            )}
        </Card>
      </div>
    </div>
  );
}

    

    

  const handleSelectionChange = (itemId: string) => {
    setSelectedItems(prev =>
        prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId]
    );
  };

  const handleProceedToPayment = () => {
    const selectedItemDetails = items
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({ id: item.id, name: item.name, price: item.price }));
    
    // In a real app, you might want to encrypt this or pass it more securely
    const query = new URLSearchParams({
        receiptId: params.id,
        items: JSON.stringify(selectedItemDetails),
    });
    router.push(`/dashboard/payment?${query.toString()}`);
  }

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

  const handleParticipantChange = (userId: string) => {
    setParticipants(prev =>
        prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
    );
  };

  const saveParticipants = () => {
    // In a real app, this would be a database call
    console.log("Saving participants:", participants);
    toast({
        title: "Participants Updated",
        description: "The participant list has been saved.",
    });
    setAddParticipantDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{receiptDetails.title}</h1>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(receiptDetails.date)}</span>
                </div>
                 <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Uploaded by {uploaderInfo.name}</span>
                </div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="flex items-center text-sm font-medium text-muted-foreground"><Users className="mr-2 h-4 w-4" /> Participants</h3>
                {isUploader && (
                    <Dialog open={isAddParticipantDialogOpen} onOpenChange={setAddParticipantDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4"/> Manage</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Participants</DialogTitle>
                                <DialogDescription>Add or remove friends who are part of this receipt.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-4 max-h-60 overflow-y-auto pr-2">
                                {allUsers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`participant-${user.id}`}
                                            checked={participants.includes(user.id)}
                                            onCheckedChange={() => handleParticipantChange(user.id)}
                                            disabled={user.id === receiptDetails.uploaderId} // Can't remove self
                                        />
                                        <Label htmlFor={`participant-${user.id}`} className="font-normal flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={users[user.id as keyof typeof users]?.avatar} />
                                                <AvatarFallback>{users[user.id as keyof typeof users]?.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {user.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button onClick={saveParticipants}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                {participants.map(userId => (
                    <Tooltip key={userId}>
                        <TooltipTrigger>
                            <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-border">
                                <AvatarImage src={users[userId as keyof typeof users]?.avatar} />
                                <AvatarFallback>{users[userId as keyof typeof users]?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{users[userId as keyof typeof users]?.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
              </TooltipProvider>
            </div>
        </div>
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
                <div className="space-y-2 max-h-[calc(70vh-80px)] overflow-y-auto">
                    {items.map((item, index) => (
                        <div key={item.id} className={cn({"opacity-50": !!item.claimedBy})}>
                            <div className="flex items-center p-4">
                                <Checkbox
                                    id={`item-${item.id}`}
                                    checked={selectedItems.includes(item.id)}
                                    onCheckedChange={() => handleSelectionChange(item.id)}
                                    disabled={!!item.claimedBy}
                                    className="mr-4"
                                />
                                <Label htmlFor={`item-${item.id}`} className={cn("flex-1", {"cursor-pointer": !item.claimedBy})}>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                                </Label>
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
                                       isUploader && (
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
                                       )
                                    )}
                                </div>
                            </div>
                           {index < items.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
            </CardContent>
            {selectedItems.length > 0 && (
                <>
                    <Separator />
                    <CardContent className="p-4">
                        <Button className="w-full" onClick={handleProceedToPayment}>
                            Proceed to Payment ({selectedItems.length} items)
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </>
            )}
        </Card>
      </div>
    </div>
  );
}

    

    