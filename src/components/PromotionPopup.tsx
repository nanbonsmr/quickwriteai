import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Promotion {
  id: string;
  title: string;
  message: string;
  button_text: string;
  button_link: string | null;
  image_url: string | null;
}

interface PromotionPopupProps {
  showOnDashboard?: boolean;
  showOnLanding?: boolean;
}

export function PromotionPopup({ showOnDashboard = false, showOnLanding = false }: PromotionPopupProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotion = async () => {
      // For landing page, show to all users
      // For dashboard, only show to free users
      if (showOnDashboard && profile?.subscription_plan !== 'free') {
        return;
      }

      // Build the query based on location
      let query = supabase
        .from('promotions')
        .select('id, title, message, button_text, button_link, image_url')
        .eq('is_active', true);

      if (showOnDashboard) {
        query = query.eq('show_on_dashboard', true);
      }
      if (showOnLanding) {
        query = query.eq('show_on_landing', true);
      }

      // Check date constraints
      const now = new Date().toISOString();
      query = query.or(`start_date.is.null,start_date.lte.${now}`);
      query = query.or(`end_date.is.null,end_date.gte.${now}`);

      const { data: promotions, error } = await query.limit(1).maybeSingle();

      if (error || !promotions) {
        return;
      }

      // Check if user has dismissed this promotion
      if (user) {
        const { data: dismissed } = await supabase
          .from('dismissed_promotions')
          .select('id')
          .eq('user_id', user.id)
          .eq('promotion_id', promotions.id)
          .maybeSingle();

        if (dismissed) {
          return;
        }
      } else {
        // For non-logged-in users, check localStorage
        const dismissedPromotions = JSON.parse(localStorage.getItem('dismissed_promotions') || '[]');
        if (dismissedPromotions.includes(promotions.id)) {
          return;
        }
      }

      setPromotion(promotions);
      // Small delay before showing popup for better UX
      setTimeout(() => setIsOpen(true), 1000);
    };

    fetchPromotion();
  }, [user, profile, showOnDashboard, showOnLanding]);

  const handleDismiss = async () => {
    if (!promotion) return;

    if (user) {
      await supabase.from('dismissed_promotions').insert({
        user_id: user.id,
        promotion_id: promotion.id,
      });
    } else {
      const dismissedPromotions = JSON.parse(localStorage.getItem('dismissed_promotions') || '[]');
      dismissedPromotions.push(promotion.id);
      localStorage.setItem('dismissed_promotions', JSON.stringify(dismissedPromotions));
    }

    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (promotion?.button_link) {
      if (promotion.button_link.startsWith('http')) {
        window.open(promotion.button_link, '_blank');
      } else {
        navigate(promotion.button_link);
      }
    }
    handleDismiss();
  };

  if (!promotion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl overflow-hidden shadow-xl">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-4 h-4 text-primary-foreground" />
          </button>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative p-6 sm:p-8">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>

            {/* Image */}
            {promotion.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={promotion.image_url} 
                  alt={promotion.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
              {promotion.title}
            </h2>

            {/* Message */}
            <p className="text-primary-foreground/80 text-sm sm:text-base mb-6 leading-relaxed">
              {promotion.message}
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleButtonClick}
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
              size="lg"
            >
              {promotion.button_text || 'Learn More'}
            </Button>

            {/* Dismiss text */}
            <button
              onClick={handleDismiss}
              className="w-full mt-3 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
