'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Chip, Pagination, Spinner } from '@heroui/react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Payment } from '@/types/database';
import { useTranslationNamespace } from '@/contexts/TranslationContext';

const ITEMS_PER_PAGE = 5;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string, t: any) => {
  switch (status) {
    case 'completed':
      return t('history.completed');
    case 'pending':
      return t('history.pending');
    case 'failed':
      return t('history.failed');
    default:
      return status;
  }
};

export default function PaymentHistory() {
  const { company } = useAuth();
  const { payments, loading } = useSubscriptions();
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslationNamespace('dashboard.payment');

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPayments = payments.slice(startIndex, endIndex);

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!company) return null;

  return (
    <Card className="w-full m-4 bg-background  shadow-lg shadow-secondary/20">
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">{t('history.title')}</h3>
          <p className="text-sm text-gray-50">
            {payments.length} {payments.length === 1 ? t('history.payment') : t('history.payments')} {t('history.total')}
          </p>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-50">{t('history.noPayments')}</p>
            <p className="text-sm text-gray-50 mt-1">
              {t('history.noPaymentsDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-secondary/20 rounded-lg hover:bg-tertiary/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">
                      {payment.plan?.title || t('history.unknownPlan')}
                    </h4>
                    <Chip
                      size="sm"
                      color={getStatusColor(payment.payment_status)}
                      variant="flat"
                    >
                      {getStatusLabel(payment.payment_status, t)}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-50">
                    <span>{formatAmount(payment.amount, payment.currency)}</span>
                    <span>•</span>
                    <span>{formatDate(payment.created_at)}</span>
                    {payment.provider && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{payment.provider}</span>
                      </>
                    )}
                  </div>
                  {payment.transaction_id && (
                    <p className="text-xs text-gray-50 mt-1 font-mono">
                      ID: {payment.transaction_id.split('_')[3] || payment.transaction_id}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {formatAmount(payment.amount, payment.currency)}
                  </div>
                  {payment.plan?.price_monthly && (
                    <div className="text-sm text-gray-50">
                      {payment.plan.price_monthly}/month
                    </div>
                  )}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                  showShadow
                  color="primary"
                />
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}