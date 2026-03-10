import { SubscriptionPlan } from '@/types/database'

export function calculateYearlyPrice(plan: SubscriptionPlan): number {
  const monthlyPrice = plan.price_monthly
  const yearlyPrice = monthlyPrice * 12
  const discount = (yearlyPrice * plan.yearly_discount_percent) / 100
  return yearlyPrice - discount
}

export function calculateMonthlySavings(plan: SubscriptionPlan): number {
  const monthlyPrice = plan.price_monthly
  const yearlyPrice = calculateYearlyPrice(plan)
  const yearlyMonthlyEquivalent = yearlyPrice / 12
  return monthlyPrice - yearlyMonthlyEquivalent
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  // Handle FCFA specially since it's not a standard ISO currency code
  if (currency === 'FCFA') {
    return `${price.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} FCFA`
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function getDiscountLabel(discountPercent: number): string {
  if (discountPercent === 0) return ''
  return `Save ${discountPercent}%`
}