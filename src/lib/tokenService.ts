import { createClient } from '@/lib/supabase/client';

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
        console.error('Error consuming tokens:', error.message);
        return false;
      }

      return data === true;
    } catch {
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
        console.error('Error fetching token usage:', error.message);
        return null;
      }

      return data;
    } catch {
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
   * Purchase additional tokens — token grants must happen server-side via
   * the FedaPay webhook. This method only records the purchase row; the
   * actual token increment is handled by the webhook handler.
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
      const { error: purchaseError } = await this.supabase
        .from('token_purchases')
        .insert({
          company_id: companyId,
          tokens_purchased: tokenAmount,
          amount_paid: paymentData.amount,
          currency: paymentData.currency || 'XOF',
          transaction_id: paymentData.transactionId,
          payment_status: 'completed',
        });

      if (purchaseError) {
        console.error('Error recording token purchase:', purchaseError.message);
        return false;
      }

      // Token balance increment is handled server-side via the add_purchased_tokens RPC
      // (called by the FedaPay webhook handler — not here)
      return true;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
export const tokenService = new TokenService();