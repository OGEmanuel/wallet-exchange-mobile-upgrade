# Data-Fetching Refactor Plan: Full Project Scope

**Last Updated:** November 2025  
**Status:** Planning Phase  
**Owner:** Engineering Team

---

## Executive Summary

This document outlines a **comprehensive, incremental strategy** to migrate the wallet-exchange-mobile app from manual `useEffect`-based data fetching to a standardized **React Query** architecture. The goal is to eliminate dead code, reduce state management boilerplate, improve caching & performance, and establish a rock-solid foundation for future data operations.

**Key Benefits:**

- ✅ **Automatic caching & background refetching** (no more manual state)
- ✅ **Reduced network calls & improved performance** (deduplication & smart invalidation)
- ✅ **Better error & loading UX** (consistent patterns across the app)
- ✅ **Testable data layer** (mock queries instead of entire useEffect chains)
- ✅ **Faster onboarding** (new devs use known patterns)

---

## Current State Analysis

### Infrastructure Already in Place

- ✅ **React Query** installed and configured (TanStack provider in app)
- ✅ **HttpClient** with interceptors, token management, and retry logic
- ✅ **SDK integration** (Zap Blockchain SDK for exchange operations)
- ✅ **Redux state** (for auth, KYC, and some UI state)
- ✅ **Error handling** (centralized HttpErrorHandler with severity levels)

### Problem Areas (Identified)

1. **Ad-hoc useEffect patterns** scattered across components
2. **Duplicate fetching logic** (same endpoint called in 3+ places)
3. **Manual state management** (setLoading, setError, setData in every component)
4. **No caching strategy** (every navigation refetches everything)
5. **Inconsistent error UI** (some errors toasted, some silent, some ignored)
6. **SDK vs REST inconsistency** (some endpoints use SDK, others use httpClient directly)
7. **No invalidation strategy** (stale data after mutations)

### Codebase Scope

- **Modules:** `exchange`, `kyc`, `market`, `buy`, `sell`, `swap`, `utilities`, `settings`
- **Hooks:** 13 custom hooks (many with embedded fetching logic)
- **Screens/Components:** 50+ screens with data fetching
- **Endpoints:** ~40+ REST + SDK methods across all modules

---

## Strategic Approach

### Phase Structure (7 Phases Over 4–6 Weeks)

```
Phase 0: Prep & Foundation (Week 1)
    ↓
Phase 1: Activity Logs (Proof of Concept)
    ↓
Phase 2: Simple Reads (Utilities, Preferences)
    ↓
Phase 3: Market Data & Lists (Medium Complexity)
    ↓
Phase 4: Portfolio & Balances (Complex State)
    ↓
Phase 5: Mutations & Optimistic Updates
    ↓
Phase 6: Integration & Testing
    ↓
Phase 7: Monitoring, Docs & Handoff
```

---

## Phase-by-Phase Breakdown

### Phase 0: Foundation & Conventions (1 Week)

**Goal:** Establish the shared infrastructure, naming conventions, and quality gates.

#### 0.1 — Create Query Key Factory

**File:** `src/core/api/query-keys.ts`

- Centralized query key builder for all endpoints
- Follows React Query conventions (scope → category → filter)
- Example:

  ```ts
  export const queryKeys = {
    activity: {
      all: ["activity"],
      lists: () => [...queryKeys.activity.all, "list"],
      list: (userId?: string) => [...queryKeys.activity.lists(), userId],
      detail: (id: string) => [...queryKeys.activity.all, "detail", id],
    },
    portfolio: {
      all: ["portfolio"],
      detail: (userId: string) => [...queryKeys.portfolio.all, userId],
    },
    // ... repeat for all endpoints
  };
  ```

**Owner:** One engineer (4–6 hours)  
**Acceptance:** Query keys cover all 8 modules; PR reviewed + merged.

---

#### 0.2 — Create Shared API Layer (`activityApi.ts` pattern)

**Files:**

- `src/modules/settings/api/activityApi.ts`
- `src/modules/exchange/api/exchangeApi.ts`
- `src/modules/market/api/marketApi.ts`
- `src/modules/utilities/api/utilitiesApi.ts`
- ... (one per module)

**Responsibilities:**

- Wrap SDK or httpClient calls
- Normalize request/response (e.g., extract `.data` from `GeneralResponseModel`)
- Handle token checks before fetch
- Throw consistent errors for React Query

**Example Template:**

```ts
// src/modules/settings/api/activityApi.ts
import { sdk } from "@/lib/zap-sdk";
import { IActivityLogsParams } from "../domain/entities/params/get-activity-logs-data-params";
import { ActivityLogModel } from "../domain/entities/models/activity-log-model";

export async function fetchActivityLogs(
  params: IActivityLogsParams
): Promise<ActivityLogModel[]> {
  if (!params.userId) throw new Error("Missing userId");
  const response = await sdk.exchangeActivities.getUserActivities({
    userId: params.userId,
    page: params.page,
    pageSize: params.pageSize,
  });
  if (!response?.data) throw new Error("No data returned");
  return response.data;
}
```

**Owner:** 2–3 engineers in parallel (6–8 hours)  
**Acceptance:** All 8 module API files created + type-safe + handles errors.

---

#### 0.3 — Create Typed Query Hooks (Template)

**Directory:** `src/hooks/queries/` (new)

**Files:**

- `useActivityLogsQuery.ts`
- `usePortfolioQuery.ts`
- `useMarketTokensQuery.ts`
- ... (one per major endpoint)

**Template:**

```ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchActivityLogs } from "@/modules/settings/api/activityApi";
import { queryKeys } from "@/core/api/query-keys";
import { ActivityLogModel } from "@/modules/settings/domain/entities/models/activity-log-model";
import { IActivityLogsParams } from "@/modules/settings/domain/entities/params/get-activity-logs-data-params";

interface UseActivityLogsQueryOptions {
  userId?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useActivityLogsQuery(
  opts: UseActivityLogsQueryOptions
): UseQueryResult<ActivityLogModel[], Error> {
  const { userId, page = 1, pageSize = 20, enabled = !!userId } = opts;
  return useQuery({
    queryKey: queryKeys.activity.list(userId),
    queryFn: () => fetchActivityLogs({ userId: userId!, page, pageSize }),
    enabled,
    staleTime: 60 * 1000, // 1 min
    gcTime: 10 * 60 * 1000, // 10 min (formerly cacheTime)
  });
}
```

**Owner:** 1 engineer (10–12 hours)  
**Acceptance:** 8+ hooks created, fully typed, consistent patterns, tests pass.

---

#### 0.4 — Setup Testing & CI Gates

**Files:**

- `.github/workflows/data-fetching.yml` (new CI job)
- `src/hooks/queries/__tests__/` (directory for test files)
- `jest.config.js` (update if needed)

**Setup:**

- Mock providers & query client for tests
- Create test utilities (render with provider, etc.)
- Add `yarn test:hooks` command to run hook tests only
- Require passing hook tests before PR merge

**Owner:** 1 engineer (4–6 hours)  
**Acceptance:** CI runs on PR, gates master branch.

---

#### 0.5 — Document Conventions & Patterns

**Files:**

- `docs/data-fetching-guide.md` (comprehensive guide)
- `docs/migration-checklist.md` (per-screen/hook guide)

**Contents:**

- Query key naming rules
- Hook naming rules (useXxxQuery, useXxxMutation)
- Error handling patterns
- Pagination patterns
- Invalidation rules (e.g., after a mutation, invalidate related queries)
- Example snippets

**Owner:** 1 engineer (2–4 hours)  
**Acceptance:** Guide covers all patterns + examples + team reviewed.

---

**Phase 0 Deliverables:**

- [ ] Query keys factory (`query-keys.ts`)
- [ ] API layer files (8 modules)
- [ ] Query hooks (8+ major endpoints)
- [ ] CI gates & testing setup
- [ ] Comprehensive documentation
- [ ] Team walkthrough (30 min)

**Phase 0 Effort:** ~40–50 hours (1 full engineer week)

---

### Phase 1: Activity Logs (Proof of Concept) — Week 1–2

**Goal:** Migrate the first feature end-to-end as a template for future migrations.

#### 1.1 — Audit Activity Logs Usage

**Deliverable:** `docs/activity-logs-audit.md`

- Search for all places activity logs are fetched/displayed
- List files, components, and current implementation
- Note any special handling (pagination, filters, infinite scroll)

**Example Output:**

```markdown
## Activity Logs Usage Audit

### Files Using Activity Logs

1. `app/dashboard/home/wallet-home/more/profile/activtylogs.tsx`

   - Current: useEffect + useState + manual loading/error
   - Pagination: Manual (page state)
   - Filters: None implemented

2. `components/screens/portfolio/PortfolioActivityTab.tsx`

   - Current: useEffect + manual fetch
   - Special: Infinite scroll (not yet implemented)

3. `hooks/usePortfolio.tsx`
   - Current: Embedded API call
   - Special: Triggered on user auth
```

**Owner:** 1 engineer (2 hours)

---

#### 1.2 — Implement Activity Logs Query + Hook

**Files:**

- `src/modules/settings/api/activityApi.ts` (if not done in Phase 0)
- `src/hooks/queries/useActivityLogsQuery.ts` (if not done in Phase 0)

**Owner:** 1 engineer (2 hours) — _reuse Phase 0 templates_

---

#### 1.3 — Migrate `activtylogs.tsx` Component

**File:** `app/dashboard/home/wallet-home/more/profile/activtylogs.tsx`

**Changes:**

- Remove old useEffect + useState
- Replace with `useActivityLogsQuery` hook
- Reuse loading/error/empty state components
- Wire pagination controls to query params
- Add feature flag for quick rollback (optional)

**Before:**

```tsx
const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  settings
    .getActivities(params)
    .then(setLogs)
    .catch(setError)
    .finally(() => setLoading(false));
}, [params]);
```

**After:**

```tsx
const {
  data: logs,
  isLoading,
  error,
  isPreviousData,
} = useActivityLogsQuery({
  userId: user?._id,
  page,
  pageSize: 20,
  enabled: !!user?._id,
});

// Query handles loading/error states automatically
```

**Owner:** 1 engineer (4–6 hours)  
**Acceptance Criteria:**

- ✅ No more manual useEffect for fetching
- ✅ Loading/error UI identical to original
- ✅ Pagination works (UI must reflect query state)
- ✅ Unit tests pass (mock query provider)
- ✅ Smoke test: load screen, verify data appears

---

#### 1.4 — Add Tests for Activity Logs

**Files:**

- `src/hooks/queries/__tests__/useActivityLogsQuery.test.ts`
- `app/dashboard/home/wallet-home/more/profile/__tests__/activtylogs.test.tsx`

**Test Coverage:**

- Query hook: success, error, pagination, disabled (enabled=false)
- Component: renders loading, renders data, renders error, pagination works

**Example:**

```ts
describe("useActivityLogsQuery", () => {
  it("should fetch activity logs when enabled", async () => {
    const { result } = renderHook(
      () => useActivityLogsQuery({ userId: "123" }),
      {
        wrapper: QueryClientProvider, // mocked
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(10); // or whatever mock returns
  });

  it("should not fetch when enabled=false", () => {
    const { result } = renderHook(() =>
      useActivityLogsQuery({ userId: "123", enabled: false })
    );
    expect(result.current.status).toBe("idle");
  });
});
```

**Owner:** 1 engineer (4–6 hours)

---

#### 1.5 — Monitor & Iterate

**Steps:**

- Deploy to staging branch
- Get team + QA review
- Track any regressions or user feedback
- Document learnings in `docs/migration-learnings.md`

**Owner:** 1 engineer (2 hours review + 2 hours iteration)

---

**Phase 1 Deliverables:**

- [ ] Activity logs fully migrated to React Query
- [ ] Comprehensive tests (>80% coverage)
- [ ] PR reviewed + merged
- [ ] Learnings documented
- [ ] Team demo (15 min)

**Phase 1 Effort:** ~20–25 hours (2–3 engineer days)

---

### Phase 2: Simple Reads (Utilities, Preferences) — Week 2

**Goal:** Repeat Phase 1 pattern for lightweight endpoints; establish production patterns.

#### Endpoints to Migrate (Priority Order)

1. **Currencies & Supported Currencies** (`utilities/fetchCurrencies`, `fetchSupportedCurrencies`)
2. **Verified Countries** (`utilities/fetchVerifiedCountries`)
3. **User Preferences** (`settings/getPreferences`)
4. **Document Types** (`kyc/getDocumentTypes`)

**Why these first?**

- No parameters (or simple params)
- Read-only (no mutations involved)
- Used by multiple screens (high ROI on fixing duplication)
- Small responses (fast testing)

#### 2.1 — Batch Audit

**Deliverable:** `docs/phase2-audit.md`

- Grep for each endpoint usage across the codebase
- Document duplication (e.g., "currencies fetched in 5 places")

**Owner:** 1 engineer (2 hours)

---

#### 2.2 — Create API Layer + Hooks (4 Endpoints)

**Files:**

- API: `src/modules/utilities/api/currenciesApi.ts`, etc.
- Hooks: `src/hooks/queries/useCurrenciesQuery.ts`, etc.

**Owner:** 1 engineer (6–8 hours)

---

#### 2.3 — Migrate 4 Components + Hooks

**Components (select one per endpoint):**

- Dashboard screen that displays currencies
- Settings screen for preferences
- KYC flow screen for document types
- Utilities consumer screen for countries

**Owner:** 2 engineers in parallel (8–12 hours)

---

#### 2.4 — Test & Deploy

**Owner:** 1 engineer (4–6 hours)

---

**Phase 2 Deliverables:**

- [ ] 4 simple endpoints fully migrated
- [ ] > 80% test coverage
- [ ] PR merged + staging tested
- [ ] Duplication eliminated (e.g., currencies now fetched 1×)

**Phase 2 Effort:** ~25–30 hours (3–4 engineer days)

---

### Phase 3: Market Data & Lists (Medium Complexity) — Week 3

**Goal:** Handle list endpoints with filters, sorting, and pagination.

#### Endpoints to Migrate

1. **Market Tokens List** (`market/getTokens` with filters + pagination)
2. **Exchange History** (`exchange/getHistory`)
3. **Portfolio Holdings** (`portfolio/getHoldings`)
4. **Watchlist** (`market/getWatchlist`)

**Complexity:**

- Support pagination (useInfiniteQuery vs useQuery)
- Handle filter/sort params
- Cache partial results
- Invalidate on mutations

#### 3.1 — Audit + Design Pagination Strategy

**Decision:**

- `useQuery` for **simple pagination** (page input)
- `useInfiniteQuery` for **infinite scroll** (load more button)

**Document:** `docs/pagination-pattern.md`

**Owner:** 1 engineer (3 hours)

---

#### 3.2 — Implement Pagination Query Hooks

**Files:**

- `src/hooks/queries/useMarketTokensQuery.ts` (paginated)
- `src/hooks/queries/usePortfolioHoldingsQuery.ts` (infinite)

**Owner:** 1 engineer (8–10 hours)

---

#### 3.3 — Migrate 4 Components

**Owner:** 2 engineers in parallel (12–16 hours)

---

#### 3.4 — Test, Optimize, Deploy

**Owner:** 1 engineer (6–8 hours)

---

**Phase 3 Deliverables:**

- [ ] 4 medium-complexity endpoints migrated
- [ ] Pagination patterns established (both useQuery & useInfiniteQuery)
- [ ] Cache strategies tuned (staleTime, gcTime per endpoint)
- [ ] <1s page transitions (measured)

**Phase 3 Effort:** ~35–45 hours (4–5 engineer days)

---

### Phase 4: Portfolio & Complex State — Week 4

**Goal:** Handle endpoints with complex dependencies and aggregated state.

#### Endpoints to Migrate

1. **Aggregated Balances** (`useAggregatedBalances` hook logic)
2. **Portfolio Overview** (depends on multiple endpoints)
3. **Exchange Rates** (real-time updates)
4. **User Profile** (with nested data)

**Complexity:**

- Combine multiple queries (useQueries)
- Dependent queries (query B depends on result of query A)
- Real-time or high-frequency updates (polling/refetch intervals)
- Parallel requests (fetch 5 endpoints at once)

#### 4.1 — Design Dependency Graph

**Document:** `docs/complex-query-dependencies.md`

Example:

```
Portfolio Overview
  ├─ User Profile (needed for userId)
  ├─ Balances (depends on userId)
  │   ├─ Token Prices (depends on token IDs from balances)
  │   └─ Exchange Rates
  └─ Transactions (depends on userId)
```

**Owner:** 1 engineer (3–4 hours)

---

#### 4.2 — Implement useQueries & useQuery Dependencies

**Files:**

- `src/hooks/queries/usePortfolioOverviewQuery.ts` (composite)
- `src/hooks/queries/useExchangeRatesQuery.ts` (polling)

**Example Pattern:**

```ts
export function usePortfolioOverviewQuery(userId?: string) {
  // Step 1: Fetch user profile
  const userQuery = useUserQuery(userId);

  // Step 2: Fetch balances (depends on userId)
  const balancesQuery = useBalancesQuery({
    userId: userQuery.data?._id,
    enabled: !!userQuery.data,
  });

  // Step 3: Fetch prices (depends on token IDs)
  const pricesQuery = usePricesQuery({
    tokenIds: balancesQuery.data?.map((b) => b.tokenId) || [],
    enabled: (balancesQuery.data?.length || 0) > 0,
  });

  // Combine results
  return useMemo(
    () => ({
      isLoading:
        userQuery.isLoading || balancesQuery.isLoading || pricesQuery.isLoading,
      error: userQuery.error || balancesQuery.error || pricesQuery.error,
      data: buildPortfolioOverview(
        userQuery.data,
        balancesQuery.data,
        pricesQuery.data
      ),
    }),
    [userQuery, balancesQuery, pricesQuery]
  );
}
```

**Owner:** 1 engineer (10–12 hours)

---

#### 4.3 — Migrate Portfolio & Balance Components

**Components:**

- Dashboard home screen
- Portfolio detail screen
- Balance breakdown screen

**Owner:** 2 engineers in parallel (12–16 hours)

---

#### 4.4 — Test, Stress-test, Monitor

**Owner:** 1 engineer (8–10 hours)

---

**Phase 4 Deliverables:**

- [ ] Complex query patterns documented + implemented
- [ ] Portfolio components fully reactive (data updates without full refetch)
- [ ] Stress tests pass (5 concurrent requests + edge cases)
- [ ] Monitoring alerts set up (errors, latency >2s)

**Phase 4 Effort:** ~50–60 hours (6–7 engineer days)

---

### Phase 5: Mutations & Optimistic Updates — Week 4–5

**Goal:** Replace manual POST/PUT/PATCH/DELETE with React Query mutations.

#### Endpoints to Migrate

1. **Update User Profile** (`PATCH /profile`)
2. **Add to Watchlist** (`POST /watchlist`)
3. **Remove from Watchlist** (`DELETE /watchlist/:id`)
4. **Update Preferences** (`PUT /preferences`)
5. **Swap Tokens** (`POST /swap`)
6. **KYC Submit** (`POST /kyc/submit`)

#### 5.1 — Design Mutation Hook Template

**Pattern:** `useMutationName` (e.g., `useUpdateProfileMutation`)

```ts
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateProfileAPI(data),
    onMutate: async (newData) => {
      // Optimistically update cache
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.detail() });
      const previousData = queryClient.getQueryData(queryKeys.profile.detail());
      queryClient.setQueryData(queryKeys.profile.detail(), newData);
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.profile.detail(),
          context.previousData
        );
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}
```

**Owner:** 1 engineer (4–6 hours to design & document)

---

#### 5.2 — Implement 6 Mutation Hooks

**Files:**

- `src/hooks/mutations/useUpdateProfileMutation.ts`
- `src/hooks/mutations/useAddToWatchlistMutation.ts`
- ... (5 more)

**Owner:** 2 engineers in parallel (12–16 hours)

---

#### 5.3 — Update Components to Use Mutations

**Examples:**

- Profile edit screen
- Watchlist toggle buttons
- Settings save button
- Swap confirmation screen
- KYC form submit

**Owner:** 2–3 engineers in parallel (16–20 hours)

---

#### 5.4 — Test Optimistic Updates & Error Rollback

**Test Coverage:**

- Success: data updates immediately
- Error: data rolls back, error shown
- Concurrent requests: handled correctly
- Network disconnect: graceful retry

**Owner:** 1 engineer (6–8 hours)

---

**Phase 5 Deliverables:**

- [ ] 6+ mutations implemented with optimistic updates
- [ ] Error rollback working in all cases
- [ ] Related query invalidation working
- [ ] <500ms perceived latency for mutations

**Phase 5 Effort:** ~50–60 hours (6–7 engineer days)

---

### Phase 6: Integration & Testing — Week 5

**Goal:** Full integration testing, edge cases, and rollback preparation.

#### 6.1 — Integration Tests

**Coverage:**

- Multi-step flows (login → fetch data → mutate → verify)
- Network scenarios (offline → online, slow connection)
- Auth edge cases (token expired mid-request, forced logout)
- Race conditions (fast clicks on buttons)

**Owner:** 1 engineer (8–10 hours)

---

#### 6.2 — Performance Optimization & Benchmarking

**Tasks:**

- Profile query execution time
- Identify slow endpoints (log > 1s)
- Optimize staleTime/gcTime settings per endpoint
- Add React Query DevTools for dev/staging

**Owner:** 1 engineer (4–6 hours)

---

#### 6.3 — Rollback & Contingency Plan

**Document:** `docs/rollback-plan.md`

- One-liner: which commit reverts queries
- Commands to revert per module
- Feature flags to disable queries per screen

**Owner:** 1 engineer (2 hours)

---

#### 6.4 — QA Smoke Test & Regression Check

**Checklist:**

- [ ] All screens load without errors
- [ ] Data is displayed correctly
- [ ] Pagination works
- [ ] Mutations update UI
- [ ] Offline mode graceful
- [ ] Auth refresh works

**Owner:** QA team (1–2 days)

---

**Phase 6 Deliverables:**

- [ ] Integration test suite (>70% coverage)
- [ ] Performance benchmarks baseline
- [ ] Rollback plan documented
- [ ] All QA checks pass

**Phase 6 Effort:** ~20–30 hours (QA included)

---

### Phase 7: Monitoring, Docs & Finalization — Week 5–6

**Goal:** Harden production, document patterns, celebrate & hand off.

#### 7.1 — Setup Observability & Alerts

**Tasks:**

- Add Sentry/Grafana alerts for query failures
- Track query latencies
- Alert if refetch rate > threshold
- Dashboard for data-fetching health

**Owner:** 1 engineer (4–6 hours)

---

#### 7.2 — Finalize Documentation

**Files to Update:**

- `docs/data-fetching-guide.md` (with real examples from app)
- `docs/migration-checklist.md` (copy/paste templates per phase)
- `docs/troubleshooting.md` (common issues + fixes)
- `docs/best-practices.md` (caching, invalidation, error handling)

**Owner:** 1 engineer (4–6 hours)

---

#### 7.3 — Team Training & Handoff

**Deliverables:**

- 1-hour video walkthrough (recorded)
- 30-min live demo
- Pair programming session (optional)
- Slack channel for questions

**Owner:** Tech lead (2 hours live + async support)

---

#### 7.4 — Celebrate & Metrics

**Metrics to Report:**

- Lines of code removed

- # of manual useEffect eliminated

- # of duplicate fetches fixed

- Test coverage increase
- Build size impact (if any)
- Page load time improvements

**Owner:** Tech lead (1 hour)

---

**Phase 7 Deliverables:**

- [ ] Production monitoring active
- [ ] Team trained & confident
- [ ] Documentation complete & searchable
- [ ] Success metrics published

**Phase 7 Effort:** ~15–20 hours

---

## Summary Timeline & Resource Plan

| Phase     | Scope                          | Effort       | Duration      | Resources    |
| --------- | ------------------------------ | ------------ | ------------- | ------------ |
| **0**     | Foundation, conventions, infra | 40–50h       | Week 1        | 1 FTE        |
| **1**     | Activity logs (POC)            | 20–25h       | Week 1–2      | 1 FTE        |
| **2**     | Simple reads (4 endpoints)     | 25–30h       | Week 2        | 2 devs       |
| **3**     | Medium lists (4 endpoints)     | 35–45h       | Week 3        | 2–3 devs     |
| **4**     | Complex state (4 endpoints)    | 50–60h       | Week 4        | 2–3 devs     |
| **5**     | Mutations (6+ endpoints)       | 50–60h       | Week 4–5      | 2–3 devs     |
| **6**     | Integration & QA               | 20–30h       | Week 5        | 1 dev + QA   |
| **7**     | Monitoring & docs              | 15–20h       | Week 5–6      | 1 dev + lead |
| **TOTAL** | ~40 endpoints, 100+ components | **255–320h** | **4–6 weeks** | **3–5 devs** |

---

## Quality Gates & Success Criteria

### Pre-Deployment

- [ ] All tests pass (unit + integration)
- [ ] No console errors/warnings
- [ ] No regressions from original implementation
- [ ] Code review approved by 2 engineers
- [ ] Feature flag in place for rollback

### Post-Deployment (Staging)

- [ ] No Sentry errors for 24 hours
- [ ] Load time improvements measured
- [ ] QA sign-off on smoke tests
- [ ] User acceptance (power users test flow)

### Post-Deployment (Production)

- [ ] Monitoring alerts configured
- [ ] On-call engineer briefed
- [ ] Rollback plan ready (<15 min)
- [ ] Metrics dashboard visible

---

## Risk Mitigation

| Risk                           | Mitigation                                          |
| ------------------------------ | --------------------------------------------------- |
| **Breaking changes mid-phase** | Feature flags + branch protection + code review     |
| **Performance regression**     | Benchmark every phase + DevTools profiling          |
| **State inconsistency**        | Comprehensive integration tests + manual QA         |
| **Token/auth failures**        | Test auth refresh in every scenario + test fixtures |
| **Concurrent request bugs**    | Stress tests + race condition scenarios             |
| **Stale data after mutations** | Query invalidation rules doc + PR checklist         |

---

## Rollback Plan

If critical issues occur:

1. **Fast rollback** (emergency): Revert to commit before Phase 0

   ```bash
   git revert <commit-hash>
   yarn build && yarn deploy
   # Time: ~10 minutes
   ```

2. **Partial rollback** (if specific module broken):

   ```bash
   # Disable query hooks for that module
   # Re-enable old useEffect/useState
   # Deploy patch
   ```

3. **Gradual rollback** (if needed):
   - Disable React Query for 50% of users (feature flag)
   - Monitor error rate
   - Escalate if needed

---

## Continuous Learning & Iteration

### Post-Mortem Template (After Each Phase)

```markdown
## Phase X Retro

### What Went Well

- [ ] ...

### What We'd Do Differently

- [ ] ...

### Blockers & Solutions

- [ ] ...

### Metrics

- Tests passing: X%
- Performance: ±Y%
- Build size: ±Z KB
```

### Monthly Check-ins

- Query performance
- Cache hit rate
- Error trends
- Team confidence/velocity

---

## File Structure (Post-Refactor)

```
src/
├── core/
│   └── api/
│       ├── query-keys.ts          (NEW)
│       ├── query-client.ts        (if created)
│       ├── http-client.ts         (existing, unchanged)
│       └── ...
├── hooks/
│   ├── queries/                    (NEW)
│   │   ├── useActivityLogsQuery.ts
│   │   ├── usePortfolioQuery.ts
│   │   ├── useMarketTokensQuery.ts
│   │   └── ...
│   ├── mutations/                  (NEW)
│   │   ├── useUpdateProfileMutation.ts
│   │   ├── useAddToWatchlistMutation.ts
│   │   └── ...
│   ├── useAggregatedBalances.tsx   (REFACTORED)
│   ├── usePortfolio.tsx            (REFACTORED)
│   └── ...
├── modules/
│   ├── settings/
│   │   ├── api/                    (NEW)
│   │   │   └── activityApi.ts
│   │   ├── domain/
│   │   └── presentation/
│   ├── exchange/
│   │   ├── api/                    (NEW)
│   │   │   └── exchangeApi.ts
│   │   └── ...
│   └── ...
└── ...

docs/
├── data-fetching-guide.md          (NEW)
├── pagination-pattern.md           (NEW)
├── complex-query-dependencies.md   (NEW)
├── migration-checklist.md          (NEW)
├── rollback-plan.md                (NEW)
├── troubleshooting.md              (NEW)
└── best-practices.md               (NEW)
```

---

## Next Steps (Immediate Actions)

**This Week:**

1. ✅ Read & approve this plan (team alignment, 30 min meeting)
2. ✅ Assign Phase 0 owners (foundation work)
3. ✅ Create project board on GitHub/Linear
4. ✅ Schedule Phase 0 kickoff (2-hour pairing session)

**By End of Phase 0:**

1. Query key factory complete
2. API layer template established
3. 8+ query hooks created
4. CI/tests configured
5. Team demo + Q&A

---

## References & Helpful Resources

- **React Query Docs:** <https://tanstack.com/query/latest>
- **Query Key Factory Blog:** <https://tkdodo.eu/blog/effective-react-query-keys>
- **Mutations & Invalidation:** <https://tanstack.com/query/latest/docs/react/guides/mutations>
- **Infinite Queries:** <https://tanstack.com/query/latest/docs/react/guides/infinite-queries>
- **Optimistic Updates:** <https://tanstack.com/query/latest/docs/react/guides/optimistic-updates>

---

## FAQ

**Q: Will this slow down development initially?**  
A: Yes, ~1–2 weeks. But then velocity improves (no more useEffect debugging, reusable patterns).

**Q: Can we run old & new code side-by-side?**  
A: Yes! Use feature flags per screen. Both hooks can coexist temporarily.

**Q: What about offline support?**  
A: React Query + local persistence layer (already exists). Queries work offline after cache is warm.

**Q: How do we handle real-time updates (WebSocket)?**  
A: Separate concern. Use `queryClient.setQueryData()` when data arrives via WS.

**Q: What if an endpoint changes mid-migration?**  
A: Centralized API layer makes it a 1-line change. No need to update all components.

**Q: Can new engineers start PRs immediately?**  
A: After Phase 0 + Phase 1 demo, yes. Clear patterns + templates ready.

---

**Document Version:** 1.0  
**Last Updated:** November 19, 2025  
**Next Review:** After Phase 1 completion  
**Owner:** Engineering Lead
