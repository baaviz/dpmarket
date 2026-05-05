// ---------------------------------------------------------------------------
// MyFatoorah API Types
// ---------------------------------------------------------------------------

/** SendPayment request body */
export interface SendPaymentRequest {
  NotificationOption: 'LNK' | 'SMS' | 'EML' | 'ALL';
  CustomerName: string;
  DisplayCurrencyIso?: string;
  MobileCountryCode?: string;
  CustomerMobile?: string;
  CustomerEmail?: string;
  InvoiceValue: number;
  CallBackUrl: string;
  ErrorUrl: string;
  Language: 'ar' | 'en';
  CustomerReference?: string;
  UserDefinedField?: string;
  InvoiceItems?: Array<{
    ItemName: string;
    Quantity: number;
    UnitPrice: number;
  }>;
}

/** SendPayment response */
export interface SendPaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    InvoiceId: number;
    InvoiceURL: string;
    CustomerReference: string;
    UserDefinedField: string;
  } | null;
}

/** GetPaymentStatus request */
export interface GetPaymentStatusRequest {
  Key: string;
  KeyType: 'InvoiceId' | 'PaymentId';
}

/** GetPaymentStatus response */
export interface GetPaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: PaymentStatusData | null;
}

export interface PaymentStatusData {
  InvoiceId: number;
  InvoiceStatus: 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Cancelled';
  InvoiceReference: string;
  CustomerReference: string;
  CreatedDate: string;
  ExpiryDate: string;
  InvoiceValue: number;
  Comments: string | null;
  CustomerName: string;
  CustomerMobile: string;
  CustomerEmail: string;
  UserDefinedField: string;
  InvoiceDisplayValue: string;
  DueDeposit: number;
  DepositStatus: string;
  InvoiceItems: Array<{
    ItemName: string;
    Quantity: number;
    UnitPrice: number;
  }>;
  InvoiceTransactions: Array<{
    TransactionDate: string;
    PaymentGateway: string;
    ReferenceId: string;
    TrackId: string;
    TransactionId: string;
    PaymentId: string;
    AuthorizationId: string;
    TransactionStatus: 'Succss' | 'Failed' | 'Pending';
    TransationValue: string;
    CustomerServiceCharge: string;
    DueValue: string;
    PaidCurrency: string;
    PaidCurrencyValue: string;
    IpAddress: string;
    Country: string;
    Currency: string;
    Error: string | null;
    CardNumber: string;
  }>;
}

/** Webhook event payload from MyFatoorah */
export interface MyFatoorahWebhookPayload {
  Event: string;
  Data: {
    InvoiceId: number;
    InvoiceReference: string;
    InvoiceStatus: string;
    CustomerReference: string;
    UserDefinedField: string;
    [key: string]: unknown;
  };
}
