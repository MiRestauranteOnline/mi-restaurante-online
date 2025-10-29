/**
 * OpenPay Configuration
 * 
 * Switch between sandbox and production by changing the 'environment' value.
 * Make sure to update the OPENPAY_ENVIRONMENT secret in Supabase as well.
 */

type Environment = 'sandbox' | 'production';

interface OpenPayConfig {
  environment: Environment;
  merchantId: string;
  publicKey: string;
  apiBase: string;
  isSandbox: boolean;
}

// ⚠️ CHANGE THIS TO SWITCH ENVIRONMENTS
const CURRENT_ENVIRONMENT = 'sandbox' as Environment;

// Sandbox credentials
const SANDBOX_CONFIG = {
  merchantId: 'mbucmmsvzm5wyjjebjc6',
  publicKey: 'pk_5c30f7cbf0cd4d0c99a1c01129a0d4d3',
  apiBase: 'https://sandbox-api.openpay.mx',
};

// Production credentials (update these when you go live)
const PRODUCTION_CONFIG = {
  merchantId: 'YOUR_PRODUCTION_MERCHANT_ID', // Update from OpenPay dashboard
  publicKey: 'YOUR_PRODUCTION_PUBLIC_KEY',   // Update from OpenPay dashboard
  apiBase: 'https://api.openpay.mx',
};

// Select config based on environment
const selectedConfig = CURRENT_ENVIRONMENT === 'production' 
  ? PRODUCTION_CONFIG 
  : SANDBOX_CONFIG;

export const OPENPAY_CONFIG: OpenPayConfig = {
  environment: CURRENT_ENVIRONMENT,
  merchantId: selectedConfig.merchantId,
  publicKey: selectedConfig.publicKey,
  apiBase: selectedConfig.apiBase,
  isSandbox: CURRENT_ENVIRONMENT === 'sandbox',
};

// Helper to initialize OpenPay.js
export function initializeOpenPay() {
  const OpenPay = (window as any).OpenPay;
  if (!OpenPay) {
    console.error('OpenPay.js not loaded');
    return false;
  }

  OpenPay.setId(OPENPAY_CONFIG.merchantId);
  OpenPay.setApiKey(OPENPAY_CONFIG.publicKey);
  OpenPay.setSandboxMode(OPENPAY_CONFIG.isSandbox);
  
  console.log(`OpenPay initialized in ${OPENPAY_CONFIG.environment} mode`);
  return true;
}

// Helper to load OpenPay scripts
export function loadOpenPayScripts(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.OpenPay) {
      initializeOpenPay();
      return resolve();
    }

    const script1 = document.createElement('script');
    script1.src = 'https://js.openpay.mx/openpay.v1.min.js';
    const script2 = document.createElement('script');
    script2.src = 'https://js.openpay.mx/openpay-data.v1.min.js';

    script1.onload = () => {
      script2.onload = () => {
        initializeOpenPay();
        resolve();
      };
      script2.onerror = reject;
      document.body.appendChild(script2);
    };
    script1.onerror = reject;
    document.body.appendChild(script1);
  });
}
