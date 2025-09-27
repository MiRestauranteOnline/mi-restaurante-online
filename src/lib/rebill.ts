interface RebillPaymentData {
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  metadata: {
    signup_data: string;
    website_requirements: string;
  };
  return_url: string;
  webhook_url: string;
}

export class RebillService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = 'https://api.rebill.com/v1'; // Replace with actual Rebill API URL
    this.apiKey = ''; // This will be set from environment variables
  }

  async createPayment(data: RebillPaymentData): Promise<{ payment_url: string; payment_id: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customer,
          metadata: data.metadata,
          return_url: data.return_url,
          webhook_url: data.webhook_url,
        }),
      });

      if (!response.ok) {
        throw new Error(`Rebill API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        payment_url: result.payment_url,
        payment_id: result.id,
      };
    } catch (error) {
      console.error('Error creating Rebill payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; paid: boolean }> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Rebill API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        status: result.status,
        paid: result.status === 'paid',
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}

export const rebillService = new RebillService();