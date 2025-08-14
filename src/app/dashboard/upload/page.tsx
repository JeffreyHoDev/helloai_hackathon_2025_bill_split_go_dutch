
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Upload, PlusCircle, Trash2, Users, Loader2 } from 'lucide-react';
import { analyzeReceipt, AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt-flow';
import { Checkbox } from '@/components/ui/checkbox';
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

// Mock friends list for participants
const allUsers = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Sam Wilson' },
    { id: 'user4', name: 'Alice Johnson' },
    { id: 'user5', name: 'Bob Brown' },
];

export default function UploadPage() {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [items, setItems] = useState<AnalyzeReceiptOutput['items']>([]);
    const [participants, setParticipants] = useState<string[]>(['user1']); // Default to current user
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false);

    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const router = useRouter();
    const { toast } = useToast();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const imagePromises = Array.from(files).map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises).then(imageDataUrls => {
                setImages(imageDataUrls);
                setIsProcessed(false);
                setItems([]);
                setTitle('');
            });
        }
    };

    const processReceipt = async () => {
        if (images.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Image Selected',
                description: 'Please upload at least one receipt image first.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await analyzeReceipt({
                receiptDataUris: images,
            });
            setTitle(result.title);
            setItems(result.items);
            setIsProcessed(true);
            toast({
                title: "Receipt Processed!",
                description: "AI analysis is complete. Please review the items.",
            });
        } catch (error) {
            console.error('Error analyzing receipt:', error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not process the receipt image. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName && newItemPrice) {
            const newItem = {
                name: newItemName,
                price: parseFloat(newItemPrice),
            };
            setItems([...items, newItem]);
            setNewItemName('');
            setNewItemPrice('');
        }
    };

    const handleDeleteItem = (index: number) => {
        const itemToDelete = items[index];
        setItems(items.filter((_, i) => i !== index));
        toast({
            title: "Item Deleted",
            description: `"${itemToDelete.name}" has been removed.`,
            variant: "destructive"
        });
    };

    const handleParticipantChange = (userId: string) => {
        setParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const saveReceipt = () => {
        if (!title || items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Cannot Save Receipt',
                description: 'Please ensure there is a title and at least one item.',
            });
            return;
        }

        const totalPayable = items.reduce((sum, item) => sum + item.price, 0);

        // In a real app, this would be a database call.
        // Here we simulate it by logging to console and redirecting.
        console.log({
            title,
            items,
            participants,
            totalPayable,
            images,
        });
        
        toast({
            title: "Receipt Saved!",
            description: `"${title}" has been added to your dashboard.`,
        });

        // For this demo, we can't easily pass data back to the dashboard,
        // so we just navigate back. A real app would use a state management library.
        router.push('/dashboard');
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
             <h1 className="text-3xl font-bold mb-6">Upload Receipt</h1>
            <div className="grid md:grid-cols-2 gap-8">

                {/* Left Column: Upload & Preview */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Upload Image(s)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="w-full min-h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 p-2">
                                {images.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {images.map((image, index) => (
                                            <Image key={index} src={image} alt={`Receipt preview ${index + 1}`} width={150} height={200} className="object-contain h-48 w-auto rounded-md" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <Upload className="mx-auto h-12 w-12" />
                                        <p className="mt-2">Click to browse or drag & drop</p>
                                    </div>
                                )}
                            </div>
                            <Input id="receipt-upload" type="file" accept="image/*" onChange={handleImageUpload} multiple className="file:text-primary file:font-semibold" />
                        </CardContent>
                    </Card>

                    <Button onClick={processReceipt} disabled={images.length === 0 || isLoading} className="w-full">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : '2. Analyze with AI'}
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5"/> 3. Add Participants</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {allUsers.map(user => (
                                <div key={user.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`participant-${user.id}`}
                                        checked={participants.includes(user.id)}
                                        onCheckedChange={() => handleParticipantChange(user.id)}
                                        disabled={user.id === 'user1'} // Can't remove self
                                    />
                                    <Label htmlFor={`participant-${user.id}`} className="font-normal">{user.name}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: Edit & Confirm */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>4. Review & Edit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="title">Receipt Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Groceries" />
                            </div>
                            <Separator />

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                                        </div>
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
                                                    This will permanently delete the item "{item.name}".
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteItem(index)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
                                {isProcessed && items.length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">No items were detected. You can add them manually.</p>
                                )}
                            </div>

                            <Separator />

                            <form onSubmit={handleAddItem} className="space-y-2">
                                <p className="font-medium text-sm">Add New Item</p>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label htmlFor="new-item-name" className="sr-only">Name</Label>
                                        <Input id="new-item-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item Name" required/>
                                    </div>
                                    <div className="w-28">
                                        <Label htmlFor="new-item-price" className="sr-only">Price</Label>
                                        <Input id="new-item-price" type="number" step="0.01" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Price" required/>
                                    </div>
                                    <Button type="submit" size="icon" variant="outline"><PlusCircle className="h-4 w-4"/></Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Button onClick={saveReceipt} disabled={!isProcessed || isLoading} className="w-full">
                        5. Save Receipt & Finish
                    </Button>
                </div>
            </div>
        </div>
    );
}
