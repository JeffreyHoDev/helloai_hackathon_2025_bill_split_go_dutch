
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SelectedItem {
    id: string;
    name: string;
    price: number;
}

function CheckoutForm({ clientSecret, receiptId, selectedItems }: { clientSecret: string, receiptId: string, selectedItems: SelectedItem[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { user } = useAuth();

    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        if (!stripe || !elements) {
            setIsLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (cardElement == null) {
            setIsLoading(false);
            return;
        }

        try {
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (confirmError) {
                setErrorMessage(confirmError.message || 'An unknown error occurred during payment confirmation.');
                setIsLoading(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Update claimedBy status for each item
                const idToken = await user?.getIdToken();
                const updatePromises = selectedItems.map(item => {
                    return fetch(`http://localhost:3001/api/receipts/${receiptId}/items/${item.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({ claimedBy: user?.uid }),
                    });
                });

                const updateResults = await Promise.all(updatePromises);
                const allUpdatesSuccessful = updateResults.every(res => res.ok);

                if (allUpdatesSuccessful) {
                    toast({
                        title: "Payment Successful!",
                        description: `You have successfully paid for ${selectedItems.length} items.`,
                    });
                    router.push(`/dashboard/receipt/${receiptId}`);
                } else {
                    setErrorMessage('Payment succeeded, but failed to update all items.');
                    toast({
                        title: "Payment Successful!",
                        description: "Payment succeeded, but failed to update all items.",
                        variant: "destructive",
                    });
                    router.push(`/dashboard/receipt/${receiptId}`); // Still redirect, but show warning
                }
            } else {
                setErrorMessage(`Payment failed with status: ${paymentIntent.status}`);
            }
        } catch (error) {
            console.error('Error during payment process:', error);
            setErrorMessage('An unexpected error occurred during payment.');
        } finally {
            setIsLoading(false);
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
    const receiptId = searchParams.get('receiptId');
    const selectedItems: SelectedItem[] = itemsParam ? JSON.parse(itemsParam) : [];
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const { user } = useAuth();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const createIntent = async () => {
            if (!user) return;
            try {
                const idToken = await user.getIdToken();
                const res = await fetch('http://localhost:3001/api/payment/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ amount: totalAmount, currency: 'usd' }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setClientSecret(data.clientSecret);
                } else {
                    console.error("Failed to create payment intent");
                    toast({
                        title: "Payment Error",
                        description: "Failed to initialize payment. Please try again.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error creating payment intent: ", error);
                toast({
                    title: "Payment Error",
                    description: "Failed to initialize payment. Please try again.",
                    variant: "destructive",
                });
            }
        };

        if (totalAmount > 0 && !clientSecret) {
            createIntent();
        }
    }, [user, totalAmount, clientSecret, toast]);

    const options: StripeElementsOptions = {
        clientSecret: clientSecret || undefined,
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
            {clientSecret ? (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm clientSecret={clientSecret} receiptId={receiptId || ''} selectedItems={selectedItems} />
                </Elements>
            ) : (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-2">Loading payment...</p>
                </div>
            )}
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
