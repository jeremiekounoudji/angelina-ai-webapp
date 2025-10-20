'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Spinner } from '@heroui/react';
import { SubscriptionPlan } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  billingInterval: 'monthly' | 'yearly';
  companyId: string;
}

const mobileProviders = [
  { key: 'mtn_benin', label: 'MTN Benin', country: 'BJ' },
  { key: 'moov_benin', label: 'Moov Benin', country: 'BJ' },
  { key: 'mtn_togo', label: 'MTN Togo', country: 'TG' },
  { key: 'moov_togo', label: 'Moov Togo', country: 'TG' },
  { key: 'mtn_ci', label: 'MTN Côte d\'Ivoire', country: 'CI' },
];

export default function PaymentModal({ isOpen, onClose, plan, billingInterval, companyId }: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();

  const calculateAmount = () => {
    if (!plan) return 0;
    const monthlyPrice = parseFloat(plan.price_monthly.toString());
    if (billingInterval === 'yearly') {
      const yearlyPrice = monthlyPrice * 12;
      const discount = (plan.yearly_discount_percent || 0) / 100;
      return yearlyPrice * (1 - discount);
    }
    return monthlyPrice;
  };

  const handlePayment = async () => {
    if (!plan || !phoneNumber || !provider) return;

    setLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/fedapay-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          companyId,
          billingInterval,
          phoneNumber,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.success) {
        setPaymentStatus('success');
        // Poll for payment status
        pollPaymentStatus(data.transaction_id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/fedapay-payment/status?transactionId=${transactionId}`);
        const data = await response.json();

        if (data.status === 'approved') {
          setPaymentStatus('success');
          setTimeout(() => {
            onClose();
            window.location.reload(); // Refresh to show updated subscription
          }, 2000);
          return;
        }

        if (data.status === 'declined' || data.status === 'failed') {
          setPaymentStatus('error');
          setErrorMessage('Payment was declined or failed');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('error');
          setErrorMessage('Payment timeout. Please check your transaction status.');
        }
      } catch (error) {
        console.error('Status check error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };

    poll();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on selected provider's country
    const selectedProvider = mobileProviders.find(p => p.key === provider);
    if (selectedProvider) {
      switch (selectedProvider.country) {
        case 'BJ': // Benin: +229 XX XX XX XX
          return digits.length > 8 ? `+229 ${digits.slice(-8, -6)} ${digits.slice(-6, -4)} ${digits.slice(-4, -2)} ${digits.slice(-2)}` : digits;
        case 'TG': // Togo: +228 XX XX XX XX
          return digits.length > 8 ? `+228 ${digits.slice(-8, -6)} ${digits.slice(-6, -4)} ${digits.slice(-4, -2)} ${digits.slice(-2)}` : digits;
        case 'CI': // Côte d'Ivoire: +225 XX XX XX XX XX
          return digits.length > 10 ? `+225 ${digits.slice(-10, -8)} ${digits.slice(-8, -6)} ${digits.slice(-6, -4)} ${digits.slice(-4, -2)} ${digits.slice(-2)}` : digits;
        default:
          return digits;
      }
    }
    return digits;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isDismissable={paymentStatus !== 'processing'}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">Complete Payment</h3>
          {plan && (
            <p className="text-sm text-gray-600">
              {plan.title} - {billingInterval === 'yearly' ? 'Yearly' : 'Monthly'} Plan
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    {calculateAmount().toLocaleString()} XOF
                  </span>
                </div>
                {billingInterval === 'yearly' && plan?.yearly_discount_percent && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {plan.yearly_discount_percent}% with yearly billing
                  </p>
                )}
              </div>

              <Select
                label="Mobile Money Provider"
                placeholder="Select your mobile money provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                isRequired
              >
                {mobileProviders.map((prov) => (
                  <SelectItem key={prov.key} value={prov.key}>
                    {prov.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Phone Number"
                placeholder="Enter your mobile money number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                isRequired
                description="Enter the phone number linked to your mobile money account"
              />

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You will receive a payment prompt on your phone. 
                  Please approve the transaction to complete your subscription.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <Spinner size="lg" color="primary" />
              <p className="mt-4 text-lg font-medium">Processing Payment...</p>
              <p className="text-sm text-gray-600 mt-2">
                Please check your phone and approve the payment request
              </p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-green-600">Payment Successful!</p>
              <p className="text-sm text-gray-600 mt-2">
                Your subscription has been activated. Redirecting...
              </p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-red-600">Payment Failed</p>
              <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {paymentStatus === 'idle' && (
            <>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handlePayment}
                isDisabled={!phoneNumber || !provider || loading}
                isLoading={loading}
              >
                Pay Now
              </Button>
            </>
          )}
          {paymentStatus === 'error' && (
            <Button color="primary" onPress={() => setPaymentStatus('idle')}>
              Try Again
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}