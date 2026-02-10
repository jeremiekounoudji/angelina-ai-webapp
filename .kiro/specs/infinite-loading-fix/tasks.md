# Implementation Plan

- [x] 1. Fix useUsers hook to eliminate circular dependencies

  - Add useRef hooks to track fetch state (hasFetchedRef, currentCompanyIdRef)
  - Remove users, setUsers, setLoading, setError from fetchUsers useCallback dependencies
  - Keep only stable dependencies: company?.id and supabase
  - Add useEffect to reset tracking refs when company changes
  - Simplify main useEffect to only depend on company?.id and fetchUsers
  - Update fetch logic to check refs before fetching
  - Set refs after successful fetch
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_

- [x] 2. Fix useProducts hook to eliminate circular dependencies

  - Add hasFetchedRef to track if data has been fetched for current company
  - Update currentCompanyIdRef usage to work with new tracking pattern
  - Remove products, setProducts, setLoading, setError from fetchProducts useCallback dependencies
  - Keep only stable dependencies: company?.id, supabase, and t
  - Add useEffect to reset tracking refs when company changes
  - Simplify main useEffect to only depend on company?.id and fetchProducts
  - Update fetch logic to check refs before fetching
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_

- [x] 3. Improve Company page loading state handling


  - Add proper loading state check from AuthContext
  - Display loading spinner only while AuthContext loading is true
  - Add empty state handling when company is null after loading completes
  - Ensure company data renders immediately when available
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Test and verify fixes across all affected pages
  - Clear browser localStorage and cache
  - Test Users page: verify single fetch on first load, no infinite loading
  - Test Products page: verify single fetch on first load, no infinite loading
  - Test Company page: verify proper loading state transitions
  - Test navigation between pages: verify cached data is reused
  - Test page reload: verify cached data displays while fresh data fetches
  - Test company switching (if applicable): verify fresh data fetches for new company
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5_
