declare module 'khalti-checkout-web' {
  interface KhaltiCheckoutOptions {
    publicKey: string;
    productIdentity: string;
    productName: string;
    productUrl: string;
    eventHandler?: {
      onSuccess?: (payload: any) => void;
      onError?: (error: any) => void;
      onClose?: () => void;
    };
    paymentPreference?: string[];
  }

  class KhaltiCheckout {
    constructor(options: KhaltiCheckoutOptions);
    show(options: { amount: number }): void;
  }

  export default KhaltiCheckout;
}
