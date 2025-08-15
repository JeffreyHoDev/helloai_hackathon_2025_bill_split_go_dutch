
"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SelectedItem {
    id: string;
    name: string;
    price: number;
}

function CheckoutForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const itemsParam = searchParams.get('items');
    const receiptId = searchParams.get('receiptId');
    const selectedItems: SelectedItem[] = itemsParam ? JSON.parse(itemsParam) : [];
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            setIsLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (cardElement == null) {
            setIsLoading(false);
            return;
        }

        // In a real app, you'd create a PaymentIntent on your server
        // and use the client secret here.
        // For this demo, we'll simulate a successful payment.
        console.log("Creating payment method...");

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.error(error);
            setErrorMessage(error.message || 'An unknown error occurred.');
            setIsLoading(false);
        } else {
            console.log('PaymentMethod:', paymentMethod);
            // Here you would send paymentMethod.id to your server to confirm the payment
            setTimeout(() => {
                toast({
                    title: "Payment Successful!",
                    description: `You have successfully paid for ${selectedItems.length} items.`,
                });
                router.push(`/dashboard/receipt/${receiptId}`);
            }, 1000); // Simulate network latency
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Enter Payment Details</CardTitle>
                    <CardDescription>
                        Complete your payment for {formatCurrency(totalAmount)} using our secure checkout.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 border rounded-md">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }} />
                    </div>
                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertTitle>Payment Error</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={!stripe || isLoading} type="submit">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}


function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const itemsParam = searchParams.get('items');
    const selectedItems: SelectedItem[] = itemsParam ? JSON.parse(itemsParam) : [];
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const options: StripeElementsOptions = {
        // In a real application, you'd pass a client secret from your server
        // For demo purposes, we will not create a payment intent here.
        mode: 'payment',
        amount: Math.round(totalAmount * 100),
        currency: 'usd',
        appearance: {
            theme: 'stripe'
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <Button onClick={() => router.back()} variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Summary
            </Button>
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm />
            </Elements>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading checkout...</div>}>
            <CheckoutPageContent />
        </Suspense>
    );
}
