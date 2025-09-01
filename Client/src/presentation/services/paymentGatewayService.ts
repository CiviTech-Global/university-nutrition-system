// Payment Gateway Service - Handles payment processing for the University Nutrition System

export interface PaymentGateway {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  description: string;
  descriptionEn: string;
  fee: number;
  isActive: boolean;
  processingTime: number; // in milliseconds
  successRate: number; // percentage
}

export interface PaymentRequest {
  gatewayId: string;
  amount: number;
  userId: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  referenceNumber: string;
  message: string;
  messageEn: string;
  fee: number;
  finalAmount: number;
  gatewayResponse?: any;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  amount: number;
  fee: number;
  gatewayId: string;
  createdAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

class PaymentGatewayService {
  private static instance: PaymentGatewayService;
  private gateways: PaymentGateway[] = [];

  private constructor() {
    this.initializeGateways();
  }

  public static getInstance(): PaymentGatewayService {
    if (!PaymentGatewayService.instance) {
      PaymentGatewayService.instance = new PaymentGatewayService();
    }
    return PaymentGatewayService.instance;
  }

  private initializeGateways(): void {
    this.gateways = [
      {
        id: "mellat",
        name: "بانک ملت",
        nameEn: "Mellat Bank",
        logo: "/api/placeholder/40/40",
        description: "درگاه پرداخت امن بانک ملت با پشتیبانی ۲۴ ساعته",
        descriptionEn: "Secure Mellat Bank payment gateway with 24/7 support",
        fee: 0,
        isActive: true,
        processingTime: 2000, // 2 seconds
        successRate: 95,
      },
      {
        id: "parsian",
        name: "بانک پارسیان",
        nameEn: "Parsian Bank",
        logo: "/api/placeholder/40/40",
        description: "درگاه پرداخت بانک پارسیان با امنیت بالا",
        descriptionEn: "High-security Parsian Bank payment gateway",
        fee: 500,
        isActive: true,
        processingTime: 3000, // 3 seconds
        successRate: 92,
      },
      {
        id: "zarinpal",
        name: "زرین‌پال",
        nameEn: "ZarinPal",
        logo: "/api/placeholder/40/40",
        description: "درگاه پرداخت آنلاین زرین‌پال - سریع و مطمئن",
        descriptionEn: "ZarinPal online payment gateway - Fast and reliable",
        fee: 1000,
        isActive: true,
        processingTime: 1500, // 1.5 seconds
        successRate: 98,
      },
      {
        id: "saman",
        name: "بانک سامان",
        nameEn: "Saman Bank",
        logo: "/api/placeholder/40/40",
        description: "درگاه پرداخت بانک سامان با تکنولوژی روز",
        descriptionEn: "Saman Bank payment gateway with modern technology",
        fee: 0,
        isActive: true,
        processingTime: 2500, // 2.5 seconds
        successRate: 94,
      },
      {
        id: "melli",
        name: "بانک ملی",
        nameEn: "Melli Bank",
        logo: "/api/placeholder/40/40",
        description: "درگاه پرداخت بانک ملی ایران",
        descriptionEn: "Bank Melli Iran payment gateway",
        fee: 750,
        isActive: true,
        processingTime: 3500, // 3.5 seconds
        successRate: 90,
      },
    ];
  }

  // Get all available payment gateways
  public getAvailableGateways(): PaymentGateway[] {
    return this.gateways.filter(gateway => gateway.isActive);
  }

  // Get a specific gateway by ID
  public getGateway(gatewayId: string): PaymentGateway | null {
    return this.gateways.find(gateway => gateway.id === gatewayId) || null;
  }

  // Process payment through selected gateway
  public async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const gateway = this.getGateway(paymentRequest.gatewayId);
    
    if (!gateway) {
      return {
        success: false,
        transactionId: "",
        referenceNumber: "",
        message: "درگاه پرداخت یافت نشد",
        messageEn: "Payment gateway not found",
        fee: 0,
        finalAmount: paymentRequest.amount,
      };
    }

    if (!gateway.isActive) {
      return {
        success: false,
        transactionId: "",
        referenceNumber: "",
        message: "درگاه پرداخت در دسترس نیست",
        messageEn: "Payment gateway is not available",
        fee: 0,
        finalAmount: paymentRequest.amount,
      };
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId();
    
    // Store payment status
    this.storePaymentStatus({
      transactionId,
      status: 'processing',
      amount: paymentRequest.amount,
      fee: gateway.fee,
      gatewayId: gateway.id,
      createdAt: new Date().toISOString(),
    });

    try {
      // Simulate payment processing
      await this.simulateGatewayProcessing(gateway);
      
      // Generate reference number
      const referenceNumber = this.generateReferenceNumber();
      const finalAmount = paymentRequest.amount + gateway.fee;

      // Update payment status to success
      this.updatePaymentStatus(transactionId, {
        status: 'success',
        completedAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        referenceNumber,
        message: "پرداخت با موفقیت انجام شد",
        messageEn: "Payment completed successfully",
        fee: gateway.fee,
        finalAmount,
        gatewayResponse: {
          gatewayId: gateway.id,
          gatewayName: gateway.name,
          processingTime: gateway.processingTime,
        },
      };

    } catch (error: any) {
      // Update payment status to failed
      this.updatePaymentStatus(transactionId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorCode: error.code || 'GATEWAY_ERROR',
        errorMessage: error.message || 'Unknown error',
      });

      return {
        success: false,
        transactionId,
        referenceNumber: "",
        message: this.getErrorMessage(error.code),
        messageEn: this.getErrorMessageEn(error.code),
        fee: gateway.fee,
        finalAmount: paymentRequest.amount + gateway.fee,
      };
    }
  }

  // Simulate payment gateway processing
  private async simulateGatewayProcessing(gateway: PaymentGateway): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure based on gateway success rate
        const random = Math.random() * 100;
        
        if (random <= gateway.successRate) {
          resolve();
        } else {
          // Simulate various error types
          const errorTypes = [
            { code: 'INSUFFICIENT_FUNDS', message: 'موجودی کافی نیست' },
            { code: 'CARD_BLOCKED', message: 'کارت مسدود است' },
            { code: 'GATEWAY_TIMEOUT', message: 'اتصال به درگاه قطع شد' },
            { code: 'INVALID_TRANSACTION', message: 'تراکنش نامعتبر است' },
            { code: 'DAILY_LIMIT_EXCEEDED', message: 'حد مجاز روزانه تجاوز شده' },
          ];
          
          const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          reject(randomError);
        }
      }, gateway.processingTime);
    });
  }

  // Get payment status
  public getPaymentStatus(transactionId: string): PaymentStatus | null {
    try {
      const stored = localStorage.getItem(`payment_status_${transactionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error reading payment status:", error);
      return null;
    }
  }

  // Store payment status
  private storePaymentStatus(status: PaymentStatus): void {
    try {
      localStorage.setItem(`payment_status_${status.transactionId}`, JSON.stringify(status));
    } catch (error) {
      console.error("Error storing payment status:", error);
    }
  }

  // Update payment status
  private updatePaymentStatus(transactionId: string, updates: Partial<PaymentStatus>): void {
    const existing = this.getPaymentStatus(transactionId);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.storePaymentStatus(updated);
    }
  }

  // Generate transaction ID
  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `TXN_${timestamp}_${random.toUpperCase()}`;
  }

  // Generate reference number
  private generateReferenceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().substr(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    
    return `${year}${month}${day}${random}`;
  }

  // Get localized error messages
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'INSUFFICIENT_FUNDS': 'موجودی حساب کافی نیست',
      'CARD_BLOCKED': 'کارت شما مسدود شده است',
      'GATEWAY_TIMEOUT': 'اتصال به درگاه پرداخت قطع شد',
      'INVALID_TRANSACTION': 'اطلاعات تراکنش نامعتبر است',
      'DAILY_LIMIT_EXCEEDED': 'حد مجاز پرداخت روزانه تجاوز شده است',
      'GATEWAY_ERROR': 'خطای درگاه پرداخت',
      'NETWORK_ERROR': 'خطای شبکه',
      'UNKNOWN_ERROR': 'خطای نامشخص',
    };
    
    return errorMessages[errorCode] || 'خطا در پردازش پرداخت';
  }

  private getErrorMessageEn(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'INSUFFICIENT_FUNDS': 'Insufficient account balance',
      'CARD_BLOCKED': 'Your card has been blocked',
      'GATEWAY_TIMEOUT': 'Connection to payment gateway timed out',
      'INVALID_TRANSACTION': 'Invalid transaction information',
      'DAILY_LIMIT_EXCEEDED': 'Daily payment limit exceeded',
      'GATEWAY_ERROR': 'Payment gateway error',
      'NETWORK_ERROR': 'Network error',
      'UNKNOWN_ERROR': 'Unknown error',
    };
    
    return errorMessages[errorCode] || 'Payment processing error';
  }

  // Validate payment request
  public validatePaymentRequest(request: PaymentRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Amount validation
    if (!request.amount || request.amount <= 0) {
      errors.push('مبلغ باید بزرگتر از صفر باشد');
    }

    if (request.amount < 10000) {
      errors.push('حداقل مبلغ قابل پرداخت ۱۰٬۰۰۰ تومان است');
    }

    if (request.amount > 200000) {
      errors.push('حداکثر مبلغ قابل پرداخت ۲۰۰٬۰۰۰ تومان است');
    }

    // Gateway validation
    if (!request.gatewayId) {
      errors.push('درگاه پرداخت انتخاب نشده است');
    } else {
      const gateway = this.getGateway(request.gatewayId);
      if (!gateway) {
        errors.push('درگاه پرداخت انتخاب شده معتبر نیست');
      } else if (!gateway.isActive) {
        errors.push('درگاه پرداخت انتخاب شده در دسترس نیست');
      }
    }

    // User ID validation
    if (!request.userId) {
      errors.push('شناسه کاربر نامعتبر است');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get gateway recommendations based on amount and user preferences
  public getRecommendedGateways(amount: number, preferLowFee: boolean = true): PaymentGateway[] {
    let availableGateways = this.getAvailableGateways();

    // Filter gateways suitable for the amount
    availableGateways = availableGateways.filter(gateway => {
      const totalAmount = amount + gateway.fee;
      return totalAmount >= 10000 && totalAmount <= 200000;
    });

    // Sort by preference
    if (preferLowFee) {
      // Sort by fee first, then by success rate
      availableGateways.sort((a, b) => {
        if (a.fee !== b.fee) {
          return a.fee - b.fee;
        }
        return b.successRate - a.successRate;
      });
    } else {
      // Sort by success rate first, then by processing time
      availableGateways.sort((a, b) => {
        if (a.successRate !== b.successRate) {
          return b.successRate - a.successRate;
        }
        return a.processingTime - b.processingTime;
      });
    }

    return availableGateways;
  }

  // Get payment statistics
  public getPaymentStatistics(): {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    successRate: number;
    averageProcessingTime: number;
  } {
    try {
      // This would typically come from a database
      // For demo purposes, return mock data
      return {
        totalTransactions: 1250,
        successfulTransactions: 1187,
        failedTransactions: 63,
        successRate: 94.96,
        averageProcessingTime: 2.3,
      };
    } catch (error) {
      console.error("Error getting payment statistics:", error);
      return {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        successRate: 0,
        averageProcessingTime: 0,
      };
    }
  }

  // Cleanup old payment statuses (older than 30 days)
  public cleanupOldPaymentStatuses(): void {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('payment_status_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const status = JSON.parse(stored);
            const createdAt = new Date(status.createdAt);
            if (createdAt < thirtyDaysAgo) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error cleaning up old payment statuses:", error);
    }
  }
}

export default PaymentGatewayService;