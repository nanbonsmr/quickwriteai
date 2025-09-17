import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Percent } from "lucide-react";

interface DiscountCodeInputProps {
  onDiscountApplied: (discount: number) => void;
  className?: string;
}

export function DiscountCodeInput({ onDiscountApplied, className }: DiscountCodeInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);

  const validateAndApplyCode = async () => {
    if (!code.trim() || !user) return;

    setLoading(true);
    try {
      // Check if discount code exists and is valid
      const { data: discountCode, error: fetchError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (fetchError || !discountCode) {
        toast({
          title: "Invalid Code",
          description: "The discount code you entered is not valid or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if code has expired
      if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
        toast({
          title: "Code Expired",
          description: "This discount code has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if max uses reached
      if (discountCode.max_uses && discountCode.used_count >= discountCode.max_uses) {
        toast({
          title: "Code Limit Reached",
          description: "This discount code has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      // Check if user has already used this code
      const { data: existingUsage, error: usageError } = await supabase
        .from('discount_code_usage')
        .select('id')
        .eq('discount_code_id', discountCode.id)
        .eq('user_id', user.id)
        .single();

      if (existingUsage && !usageError) {
        toast({
          title: "Code Already Used",
          description: "You have already used this discount code.",
          variant: "destructive",
        });
        return;
      }

      // Apply the discount
      setAppliedDiscount(discountCode.discount_percent);
      onDiscountApplied(discountCode.discount_percent);

      // Record usage
      const { error: usageInsertError } = await supabase
        .from('discount_code_usage')
        .insert({
          discount_code_id: discountCode.id,
          user_id: user.id,
        });

      // Update usage count
      const { error: updateError } = await supabase
        .from('discount_codes')
        .update({ used_count: discountCode.used_count + 1 })
        .eq('id', discountCode.id);

      if (usageInsertError || updateError) {
        console.error('Error recording usage:', usageInsertError || updateError);
      }

      toast({
        title: "Code Applied!",
        description: `${discountCode.discount_percent}% discount has been applied to your order.`,
      });

    } catch (error) {
      console.error('Error validating discount code:', error);
      toast({
        title: "Error",
        description: "Failed to validate discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setCode("");
    onDiscountApplied(0);
    toast({
      title: "Discount Removed",
      description: "The discount has been removed from your order.",
    });
  };

  return (
    <div className={className}>
      {appliedDiscount ? (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {appliedDiscount}% discount applied
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeDiscount}
            className="text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="discount-code">Have a discount code?</Label>
          <div className="flex gap-2">
            <Input
              id="discount-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter discount code"
              disabled={loading}
            />
            <Button
              onClick={validateAndApplyCode}
              disabled={loading || !code.trim()}
              size="sm"
            >
              {loading ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}