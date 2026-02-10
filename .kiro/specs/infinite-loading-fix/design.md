# Design Document: Infinite Loading Fix

## Overview

This design addresses the infinite loading issue affecting the Users, Products, and Company pages. The root cause is circular dependencies in custom hooks where dependency arrays include state values that change as a result of the hook's execution, creating infinite re-render loops.

The solution involves:
1. Removing circular dependencies from hook dependency arrays
2. Implementing proper fetch tracking to prevent duplicate requests
3. Using refs to track fetched state without triggering re-renders
4. Ensuring proper initialization logic that respects cached data

## Architecture

### Current Architecture Issues

**useUsers Hook:**
```typescript
// PROBLEM: users is in dependency array
const fetchUsers = useCallback(async (forceRefresh = false) => {
  if (users.length > 0 && !forceRefresh) return users;
  // ... fetch logic
}, [company?.id, users, supabase, setUsers, setLoading, setError]);

// This effect re-runs when fetchUsers changes (which happens when users changes)
useEffect(() => {
  if (company?.id && users.length === 0 && !loading.users) {
    fetchUsers();
  }
}, [company?.id, users.length, loading.users, fetchUsers]);
```

**useProducts Hook:**
```typescript
// PROBLEM: products is in dependency array
const fetchProducts = useCallback(async (forceRefresh = false) => {
  if (!forceRefresh && fetchedCompanyId.current === companyId) {
    return products;
  }
  // ... fetch logic
}, [company?.id, products, setError, setLoading, setProducts, supabase, t]);
```

### Proposed Architecture

The fix involves three key changes:

1. **Remove state values from useCallback dependencies** - Only include stable values
2. **Use refs for tracking** - Track fetch state without triggering re-renders
3. **Simplify useEffect logic** - Only depend on company ID changes

## Components and Interfaces

### Modified useUsers Hook

```typescript
export function useUsers() {
  const supabase = createClient();
  const { company } = useAuth();
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  
  const {
    users,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  // Remove users, setUsers, setLoading, setError from dependencies
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    const companyId = company?.id;
    if (!companyId) return;

    // Check if we've already fetched for this company
    if (!forceRefresh && hasFetchedRef.current && currentCompanyIdRef.current === companyId) {
      return;
    }

    try {
      setLoading('users', true);
      setError('users', null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      hasFetchedRef.current = true;
      currentCompanyIdRef.current = companyId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setError('users', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading('users', false);
    }
  }, [company?.id, supabase]); // Only stable dependencies

  // Reset tracking when company changes
  useEffect(() => {
    if (company?.id !== currentCompanyIdRef.current) {
      hasFetchedRef.current = false;
      currentCompanyIdRef.current = null;
    }
  }, [company?.id]);

  // Simple effect - only fetch once per company
  useEffect(() => {
    if (company?.id && !hasFetchedRef.current) {
      fetchUsers();
    }
  }, [company?.id, fetchUsers]);

  // ... rest of the hook
}
```

### Modified useProducts Hook

```typescript
export function useProducts() {
  const supabase = useMemo(() => createClient(), []);
  const { company } = useAuth();
  const { t } = useTranslationNamespace('hooks.products');
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);

  const {
    products,
    setProducts,
    addProduct,
    updateProduct,
    removeProduct,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  // Remove products, setProducts, setLoading, setError from dependencies
  const fetchProducts = useCallback(
    async (forceRefresh = false) => {
      const companyId = company?.id;
      if (!companyId) return;

      // Check if we've already fetched for this company
      if (!forceRefresh && hasFetchedRef.current && currentCompanyIdRef.current === companyId) {
        return;
      }

      try {
        setLoading("products", true);
        setError("products", null);

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setProducts(data || []);
        hasFetchedRef.current = true;
        currentCompanyIdRef.current = companyId;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.loadFailed');
        setError("products", errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading("products", false);
      }
    },
    [company?.id, supabase, t] // Only stable dependencies
  );

  // Reset tracking when company changes
  useEffect(() => {
    if (company?.id !== currentCompanyIdRef.current) {
      hasFetchedRef.current = false;
      currentCompanyIdRef.current = null;
    }
  }, [company?.id]);

  // Simple effect - only fetch once per company
  useEffect(() => {
    if (company?.id && !hasFetchedRef.current) {
      fetchProducts();
    }
  }, [company?.id, fetchProducts]);

  // ... rest of the hook
}
```

### Company Page Improvements

The Company page doesn't need major changes since it relies on AuthContext. However, we should ensure proper loading state handling:

```typescript
export default function CompanyPage() {
  const { company, loading } = useAuth();
  
  // Show loading only while auth is initializing
  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show empty state if no company after loading completes
  if (!company) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-50">No company found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Render company data
  return (
    // ... existing company page content
  );
}
```

## Data Models

No changes to data models are required. The fix is purely in the hook logic and component rendering.

## Error Handling

### Fetch Errors

- Errors are caught in try-catch blocks
- Error messages are stored in Zustand store
- Toast notifications inform users of failures
- Loading state is always cleared in finally blocks

### Missing Company Context

- Hooks return early if `company?.id` is undefined
- Pages show appropriate loading or empty states
- No fetch operations are attempted without valid company ID

## Testing Strategy

### Unit Tests (Optional)

1. **Test useUsers hook:**
   - Verify fetchUsers is called only once on mount
   - Verify fetchUsers is called again when company changes
   - Verify forceRefresh bypasses cache
   - Verify loading states transition correctly

2. **Test useProducts hook:**
   - Same tests as useUsers
   - Verify ref tracking prevents duplicate fetches

### Integration Tests (Optional)

1. **Test Users Page:**
   - Navigate to page and verify single fetch
   - Verify data displays after fetch completes
   - Navigate away and back, verify cached data is used

2. **Test Products Page:**
   - Same tests as Users Page

3. **Test Company Page:**
   - Verify loading state during auth initialization
   - Verify company data displays after auth completes

### Manual Testing

1. Clear browser cache and localStorage
2. Login and navigate to Users page
3. Verify loading spinner appears briefly then data loads
4. Navigate to Products page
5. Verify same behavior
6. Navigate to Company page
7. Verify company info displays without infinite loading
8. Reload page and verify cached data displays immediately
9. Switch companies (if applicable) and verify fresh data fetches

## Performance Considerations

### Caching Strategy

- Data is cached in Zustand store with localStorage persistence
- Cached data is displayed immediately on subsequent visits
- Fresh data can be fetched using the `refetch()` function with `forceRefresh=true`

### Fetch Optimization

- Refs prevent duplicate fetches for the same company
- Company ID changes trigger cache invalidation
- Loading states prevent concurrent fetch requests

### Memory Management

- Refs are lightweight and don't cause re-renders
- Zustand store is persisted but can be cleared on sign out
- No memory leaks from infinite loops

## Migration Notes

### Breaking Changes

None. This is a bug fix that maintains the same API surface.

### Deployment Steps

1. Deploy updated hooks (useUsers, useProducts)
2. No database migrations required
3. No environment variable changes required
4. Users may need to clear localStorage if they experience issues (unlikely)

## Future Improvements

1. **Implement React Query or SWR** - These libraries handle caching, refetching, and loading states automatically
2. **Add optimistic updates** - Update UI immediately before server confirmation
3. **Implement real-time subscriptions** - Use Supabase real-time to sync data across tabs
4. **Add request deduplication** - Prevent multiple components from triggering the same fetch
5. **Implement stale-while-revalidate** - Show cached data while fetching fresh data in background
