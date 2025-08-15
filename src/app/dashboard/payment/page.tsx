
"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SelectedItem {
    id: string;
    name: string;
    price: number;
}

function PaymentPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const itemsParam = searchParams.get('items');
    const receiptId = searchParams.get('receiptId');
    const selectedItems: SelectedItem[] = itemsParam ? JSON.parse(itemsParam) : [];

    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const handleConfirmPayment = () => {
        // In a real application, this would trigger a payment gateway integration
        // and on success, update the database to mark items as claimed.
        console.log("Processing payment for:", {
            receiptId,
            items: selectedItems.map(i => i.id),
            total: totalAmount,
        });

        toast({
            title: "Payment Successful!",
            description: `You have successfully paid for ${selectedItems.length} items.`,
        });

        // Redirect back to the receipt page
        router.push(`/dashboard/receipt/${receiptId}`);
    };

    if (selectedItems.length === 0) {
        return (
            <div className="text-center">
                <p className="text-lg text-muted-foreground">No items selected for payment.</p>
                <Button onClick={() => router.back()} variant="link">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <Button onClick={() => router.back()} variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Receipt
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                    <CardDescription>Review the items you are about to pay for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {selectedItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <span className="font-mono">{formatCurrency(item.price)}</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleConfirmPayment}>
                        <CreditCard className="mr-2 h-4 w-4" /> Pay {formatCurrency(totalAmount)}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}


export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading payment details...</div>}>
            <PaymentPageContent />
        </Suspense>
    );
}


    