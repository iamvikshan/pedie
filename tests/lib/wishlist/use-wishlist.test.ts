import { beforeEach, describe, expect, mock, test } from 'bun:test'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockUseContext = mock(() => ({
  productIds: new Set(['prod-1', 'prod-2']),
  isWishlisted: (id: string) => new Set(['prod-1', 'prod-2']).has(id),
  toggleWishlist: mock(() => Promise.resolve()),
  removeFromWishlist: mock(() => Promise.resolve()),
  loading: false,
}))

mock.module('@components/wishlist/wishlistProvider', () => ({
  useWishlistContext: mockUseContext,
}))

// Import AFTER mocking
const { useWishlist } = await import('@lib/wishlist/useWishlist')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('useWishlist hook', () => {
  beforeEach(() => {
    mockUseContext.mockClear()
  })

  test('returns isWishlisted function from context', () => {
    const result = useWishlist()
    expect(result.isWishlisted('prod-1')).toBe(true)
    expect(result.isWishlisted('prod-999')).toBe(false)
  })

  test('returns wishlistCount from context productIds', () => {
    const result = useWishlist()
    expect(result.wishlistCount).toBe(2)
  })

  test('returns loading state from context', () => {
    const result = useWishlist()
    expect(result.loading).toBe(false)
  })

  test('returns toggleWishlist from context', () => {
    const result = useWishlist()
    expect(typeof result.toggleWishlist).toBe('function')
  })

  test('returns removeFromWishlist from context', () => {
    const result = useWishlist()
    expect(typeof result.removeFromWishlist).toBe('function')
  })

  test('reflects empty state when context has no items', () => {
    mockUseContext.mockReturnValue({
      productIds: new Set(),
      isWishlisted: () => false,
      toggleWishlist: mock(() => Promise.resolve()),
      removeFromWishlist: mock(() => Promise.resolve()),
      loading: false,
    })

    const result = useWishlist()
    expect(result.wishlistCount).toBe(0)
    expect(result.isWishlisted('prod-1')).toBe(false)
  })

  test('reflects loading state from context', () => {
    mockUseContext.mockReturnValue({
      productIds: new Set(),
      isWishlisted: () => false,
      toggleWishlist: mock(() => Promise.resolve()),
      removeFromWishlist: mock(() => Promise.resolve()),
      loading: true,
    })

    const result = useWishlist()
    expect(result.loading).toBe(true)
  })
})
