// ---------------------------------------------------------------------------
// MyFatoorah Custom Errors
// ---------------------------------------------------------------------------

export class MyFatoorahError extends Error {
  public readonly statusCode: number;
  public readonly validationErrors: Array<{ Name: string; Error: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    validationErrors: Array<{ Name: string; Error: string }> = [],
  ) {
    super(message);
    this.name = 'MyFatoorahError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

export class MyFatoorahPaymentNotPaidError extends MyFatoorahError {
  public readonly invoiceStatus: string;

  constructor(invoiceStatus: string) {
    super(`Payment not paid. Status: ${invoiceStatus}`, 400);
    this.name = 'MyFatoorahPaymentNotPaidError';
    this.invoiceStatus = invoiceStatus;
  }
}

export class MyFatoorahSignatureError extends MyFatoorahError {
  constructor() {
    super('Invalid webhook signature', 401);
    this.name = 'MyFatoorahSignatureError';
  }
}
