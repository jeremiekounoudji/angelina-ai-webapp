import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export class TokenService {
  private supabase = createClient();

  /**
   * Consume tokens for a company
   * @param companyId - The company ID
   * @param tokensToConsume - Number of tokens to consume
   * @returns Promise<boolean> - true if successful, false if not enough tokens
   */
  async consumeTokens(companyId: string, tokensToConsume: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('update_token_usage', {
        company_uuid: companyId,
        tokens_consumed: tokensToConsume
      });

      if (error) {
        console.error('Error consuming tokens:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error consuming tokens:', error);
      return false;
    }
  }

  /**
   * Get current token usage for a company
   * @param companyId - The company ID
   * @returns Promise with usage data or null
   */
  async getTokenUsage(companyId: string) {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data, error } = await this.supabase
        .from('token_usage')
        .select('*')
        .eq('company_id', companyId)
        .eq('usage_month', currentMonth)
        .eq('usage_year', currentYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching token usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching token usage:', error);
      return null;
    }
  }

  /**
   * Check if company has enough tokens
   * @param companyId - The company ID
   * @param tokensNeeded - Number of tokens needed
   * @returns Promise<boolean> - true if enough tokens available
   */
  async hasEnoughTokens(companyId: string, tokensNeeded: number): Promise<boolean> {
    const usage = await this.getTokenUsage(companyId);
    if (!usage) return false;
    
    return usage.tokens_remaining >= tokensNeeded;
  }

  /**
   * Estimate tokens needed for a text (rough estimation)
   * @param text - The text to estimate
   * @returns number - Estimated tokens needed
   */
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a simplified estimation, actual tokenization may vary
    return Math.ceil(text.length / 4);
  }

  /**
   * Purchase additional tokens
   * @param companyId - The company ID
   * @param tokenAmount - Number of tokens to purchase
   * @param paymentData - Payment information
   * @returns Promise<boolean> - true if successful
   */
  async purchaseTokens(
    companyId: string, 
    tokenAmount: number, 
    paymentData: {
      amount: number;
      currency?: string;
      transactionId?: string;
    }
  ): Promise<boolean> {
    try {
      // Record the purchase
      const { error: purchaseError } = await this.supabase
        .from('token_purchases')
        .insert({
          company_id: companyId,
          tokens_purchased: tokenAmount,
          amount_paid: paymentData.amount,
          currency: paymentData.currency || 'USD',
          transaction_id: paymentData.transactionId,
          payment_status: 'completed'
        });

      if (purchaseError) {
        console.error('Error recording token purchase:', purchaseError);
        return false;
      }

      // Update current usage with purchased tokens
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { error: updateError } = await this.supabase
        .from('token_usage')
        .update({
          tokens_purchased: this.supabase.sql`tokens_purchased + ${tokenAmount}`,
          tokens_remaining: this.supabase.sql`tokens_remaining + ${tokenAmount}`
        })
        .eq('company_id', companyId)
        .eq('usage_month', currentMonth)
        .eq('usage_year', currentYear);

      if (updateError) {
        console.error('Error updating token usage:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const tokenService = new TokenService();