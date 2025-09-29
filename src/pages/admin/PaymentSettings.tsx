import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentSettings {
  id: string;
  test_mode: boolean;
  test_payer_email: string | null;
}

export default function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment settings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payment_settings')
        .update({
          test_mode: settings.test_mode,
          test_payer_email: settings.test_payer_email
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No payment settings found. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">Configure Mercado Pago payment and test mode</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Test Mode:</strong> When enabled, the signup flow will use the test payer email for Mercado Pago.
          This allows you to test the payment flow without processing real payments. Make sure you have created 
          test users in your Mercado Pago account and are using TEST credentials in Supabase secrets.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Mercado Pago Configuration</CardTitle>
          <CardDescription>
            Control test mode and configure test user credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="test-mode">Test Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use test credentials and test payer email for signups
              </p>
            </div>
            <Switch
              id="test-mode"
              checked={settings.test_mode}
              onCheckedChange={(checked) => setSettings({ ...settings, test_mode: checked })}
            />
          </div>

          {settings.test_mode && (
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Payer Email (Buyer Account)</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test_user_123456@testuser.com"
                value={settings.test_payer_email || ''}
                onChange={(e) => setSettings({ ...settings, test_payer_email: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                This email will be sent to Mercado Pago as the payer_email. Use the email from your 
                Mercado Pago test buyer account (format: test_user_xxxxx@testuser.com).
              </p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <h4 className="font-medium">Mercado Pago Test Setup:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create 2 test accounts in Mercado Pago (seller and buyer)</li>
              <li>Copy the TEST Access Token from the seller account to Supabase secrets (MERCADOPAGO_ACCESS_TOKEN)</li>
              <li>Copy the TEST Public Key from the seller account to Supabase secrets (MERCADOPAGO_PUBLIC_KEY)</li>
              <li>Enable "Test Mode" above and enter the buyer test email (test_user_xxxxx@testuser.com)</li>
              <li>Now signups will use the test email for payment processing</li>
            </ol>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            When you're ready to go live, disable test mode and replace your Supabase secrets 
            with production credentials:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Replace MERCADOPAGO_ACCESS_TOKEN with production Access Token</li>
            <li>Replace MERCADOPAGO_PUBLIC_KEY with production Public Key</li>
            <li>Disable "Test Mode" above</li>
            <li>Real customer emails will be used for payment processing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
