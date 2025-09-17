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
      // Use the secure server-side function to validate and apply the discount code
      const { data, error } = await supabase.rpc('apply_discount_code', {
        discount_code_text: code.trim(),
        user_uuid: user.id
      });

      if (error) {
        throw error;
      }

      // Type the response properly
      const result = data as any;

      // Check if the code validation was successful
      if (!result?.valid) {
        toast({
          title: "Invalid Code",
          description: result?.error || "The discount code you entered is not valid.",
          variant: "destructive",
        });
        return;
      }

      // Code was successfully applied
      if (result?.applied) {
        const discountPercent = Number(result.discount_percent);
        setAppliedDiscount(discountPercent);
        onDiscountApplied(discountPercent);

        toast({
          title: "Code Applied!",
          description: `${discountPercent}% discount has been applied to your order.`,
        });
      }

    } catch (error) {
      console.error('Error applying discount code:', error);
      toast({
        title: "Error",
        description: "Failed to apply discount code. Please try again.",
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