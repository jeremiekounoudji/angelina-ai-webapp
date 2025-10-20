import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Product, Company, SubscriptionPlan, Payment, TokenUsage, TokenPurchase, PlanLimits, Metrics } from '@/types/database';

interface AppState {
  // Users
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;

  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  // Companies
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;

  // Subscription Plans
  subscriptionPlans: SubscriptionPlan[];
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void;

  // Payments
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;

  // Token Usage
  tokenUsage: TokenUsage | null;
  setTokenUsage: (usage: TokenUsage | null) => void;

  // Token Purchases
  tokenPurchases: TokenPurchase[];
  setTokenPurchases: (purchases: TokenPurchase[]) => void;
  addTokenPurchase: (purchase: TokenPurchase) => void;

  // Plan Limits
  planLimits: PlanLimits | null;
  setPlanLimits: (limits: PlanLimits | null) => void;

  // Metrics
  metrics: Metrics | null;
  setMetrics: (metrics: Metrics | null) => void;

  // Loading states
  loading: {
    users: boolean;
    products: boolean;
    companies: boolean;
    subscriptionPlans: boolean;
    payments: boolean;
    tokenUsage: boolean;
    tokenPurchases: boolean;
    planLimits: boolean;
    metrics: boolean;
  };
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;

  // Error states
  errors: {
    users: string | null;
    products: string | null;
    companies: string | null;
    subscriptionPlans: string | null;
    payments: string | null;
    tokenUsage: string | null;
    tokenPurchases: string | null;
    planLimits: string | null;
    metrics: string | null;
  };
  setError: (key: keyof AppState['errors'], error: string | null) => void;

  // Clear functions
  clearUsers: () => void;
  clearProducts: () => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      users: [],
      products: [],
      companies: [],
      subscriptionPlans: [],
      payments: [],
      tokenUsage: null,
      tokenPurchases: [],
      planLimits: null,
      metrics: null,

      loading: {
        users: false,
        products: false,
        companies: false,
        subscriptionPlans: false,
        payments: false,
        tokenUsage: false,
        tokenPurchases: false,
        planLimits: false,
        metrics: false,
      },

      errors: {
        users: null,
        products: null,
        companies: null,
        subscriptionPlans: null,
        payments: null,
        tokenUsage: null,
        tokenPurchases: null,
        planLimits: null,
        metrics: null,
      },

      // Users actions
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updatedUser) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updatedUser } : user
          ),
        })),
      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),

      // Products actions
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updatedProduct) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updatedProduct } : product
          ),
        })),
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),

      // Companies actions
      setCompanies: (companies) => set({ companies }),
      updateCompany: (id, updatedCompany) =>
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === id ? { ...company, ...updatedCompany } : company
          ),
        })),

      // Subscription Plans actions
      setSubscriptionPlans: (subscriptionPlans) => set({ subscriptionPlans }),

      // Payments actions
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) =>
        set((state) => ({ payments: [...state.payments, payment] })),

      // Token Usage actions
      setTokenUsage: (tokenUsage) => set({ tokenUsage }),

      // Token Purchases actions
      setTokenPurchases: (tokenPurchases) => set({ tokenPurchases }),
      addTokenPurchase: (purchase) =>
        set((state) => ({
          tokenPurchases: [...state.tokenPurchases, purchase],
        })),

      // Plan Limits actions
      setPlanLimits: (planLimits) => set({ planLimits }),

      // Metrics actions
      setMetrics: (metrics) => set({ metrics }),

      // Loading actions
      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),

      // Error actions
      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        })),

      // Clear functions
      clearUsers: () => set({ users: [] }),
      clearProducts: () => set({ products: [] }),
      clearAll: () =>
        set({
          users: [],
          products: [],
          companies: [],
          subscriptionPlans: [],
          payments: [],
          tokenUsage: null,
          tokenPurchases: [],
          planLimits: null,
          metrics: null,
          loading: {
            users: false,
            products: false,
            companies: false,
            subscriptionPlans: false,
            payments: false,
            tokenUsage: false,
            tokenPurchases: false,
            planLimits: false,
            metrics: false,
          },
          errors: {
            users: null,
            products: null,
            companies: null,
            subscriptionPlans: null,
            payments: null,
            tokenUsage: null,
            tokenPurchases: null,
            planLimits: null,
            metrics: null,
          },
        }),
    }),
    {
      name: 'angelina-ai-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        products: state.products,
        companies: state.companies,
        subscriptionPlans: state.subscriptionPlans,
        payments: state.payments,
        tokenUsage: state.tokenUsage,
        tokenPurchases: state.tokenPurchases,
        planLimits: state.planLimits,
        metrics: state.metrics,
      }),
    }
  )
);