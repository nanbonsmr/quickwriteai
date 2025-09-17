import { useState } from 'react';
import { PaymentPlans } from '@/components/PaymentPlans';
import { DiscountCodeInput } from '@/components/DiscountCodeInput';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function Pricing() {
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);

  const handlePaymentSuccess = () => {
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Billing & Pricing</h2>
        <p className="text-muted-foreground">
          Choose the plan that works best for you and upgrade your content creation experience.
        </p>
      </div>

      {/* Discount Code Input */}
      <div className="max-w-md mx-auto">
        <DiscountCodeInput 
          onDiscountApplied={setDiscount} 
          className="w-full"
        />
        {discount > 0 && (
          <div className="text-center mt-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {discount}% discount will be applied at checkout
            </Badge>
          </div>
        )}
      </div>
      
      <PaymentPlans onSuccess={handlePaymentSuccess} discount={discount} />
    </div>
  );
}