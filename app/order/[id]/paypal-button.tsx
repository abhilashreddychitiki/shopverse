'use client';

import { Button } from '@/components/ui/button';
import { approvePayPalOrder } from '@/lib/actions/order.actions';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PayPalButton({ 
  orderId, 
  totalPrice 
}: { 
  orderId: string;
  totalPrice: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // This is a placeholder for the actual PayPal integration
  // In a real application, you would use the PayPal SDK to create a payment button
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      // Simulate a successful PayPal payment
      const result = await approvePayPalOrder(orderId, { orderID: 'simulated-paypal-order-id' });
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Payment failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Processing...' : `Pay with PayPal ($${totalPrice})`}
    </Button>
  );
}
