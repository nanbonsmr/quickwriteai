import { PaymentPlans } from '@/components/PaymentPlans';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

const comparisonFeatures = [
  { category: 'Content Generation', features: [
    { name: 'Words per month', basic: '10,000', pro: '50,000', enterprise: '200,000' },
    { name: 'All content templates', basic: true, pro: true, enterprise: true },
    { name: 'Export formats', basic: 'Basic', pro: 'Advanced', enterprise: 'All formats' },
  ]},
  { category: 'Support & Collaboration', features: [
    { name: 'Support level', basic: 'Basic', pro: 'Priority', enterprise: '24/7 Dedicated' },
    { name: 'Response time', basic: '48 hours', pro: '24 hours', enterprise: '1 hour' },
    { name: 'Team collaboration', basic: false, pro: true, enterprise: true },
    { name: 'User seats', basic: '1', pro: '5', enterprise: 'Unlimited' },
  ]},
  { category: 'Advanced Features', features: [
    { name: 'API access', basic: false, pro: true, enterprise: true },
    { name: 'Advanced analytics', basic: false, pro: true, enterprise: true },
    { name: 'White-label options', basic: false, pro: false, enterprise: true },
    { name: 'Custom integrations', basic: false, pro: false, enterprise: true },
    { name: 'Priority processing', basic: false, pro: true, enterprise: true },
    { name: 'Dedicated account manager', basic: false, pro: false, enterprise: true },
  ]},
  { category: 'Security & Compliance', features: [
    { name: 'Data encryption', basic: true, pro: true, enterprise: true },
    { name: 'SSO/SAML', basic: false, pro: false, enterprise: true },
    { name: 'Advanced security', basic: false, pro: false, enterprise: true },
    { name: 'Custom SLA', basic: false, pro: false, enterprise: true },
  ]},
];

export default function Pricing() {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/app');
  };

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-primary mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-0.5 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Billing & Pricing</h2>
        <p className="text-muted-foreground text-lg">
          Choose the plan that works best for you and upgrade your content creation experience.
        </p>
      </div>
      
      <PaymentPlans onSuccess={handlePaymentSuccess} />

      {/* Comparison Table */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Detailed Plan Comparison</h3>
          <p className="text-muted-foreground">
            Compare all features across our plans to find the perfect fit
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold min-w-[200px]">Features</th>
                  <th className="text-center p-4 font-semibold min-w-[150px]">Basic</th>
                  <th className="text-center p-4 font-semibold min-w-[150px]">
                    <div className="flex items-center justify-center gap-2">
                      Pro
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold min-w-[150px]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((section, sectionIdx) => (
                  <>
                    <tr key={`section-${sectionIdx}`} className="bg-muted/30">
                      <td colSpan={4} className="p-4 font-semibold text-sm">
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((feature, featureIdx) => (
                      <tr 
                        key={`feature-${sectionIdx}-${featureIdx}`}
                        className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 text-sm">{feature.name}</td>
                        <td className="p-4 text-center">{renderValue(feature.basic)}</td>
                        <td className="p-4 text-center bg-primary/5">{renderValue(feature.pro)}</td>
                        <td className="p-4 text-center">{renderValue(feature.enterprise)}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="p-6 bg-muted/30">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold mb-2">30-Day Money Back</h4>
              <p className="text-sm text-muted-foreground">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cancel Anytime</h4>
              <p className="text-sm text-muted-foreground">
                No long-term contracts. Cancel your subscription at any time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Need Help Choosing?</h4>
              <p className="text-sm text-muted-foreground">
                <a href="/contact" className="text-primary hover:underline">Contact us</a> and we'll help you find the right plan.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}