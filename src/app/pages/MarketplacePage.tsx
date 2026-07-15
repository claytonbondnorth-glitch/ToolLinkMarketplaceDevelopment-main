import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Grid3X3, List, MapPin, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, BRANDS } from '../data/mockData';
import { AppListing } from '../context/AppContext';
import ListingCard from '../components/ListingCard';

const CONDITIONS = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'For Parts'];
const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'views', label: 'Most Popular' },
];
const MAIN_CATEGORY_ORDER = ['Trade Tools & Equipment', 'Civil & Construction Equipment', 'Automotive & Workshop'] as const;

interface Filters {
  query: string;
  mainCategory: string;
  selectedSubcategoryIds: string[];
  brand: string;
  condition: string;
  state: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

function ListCard({ listing }: { listing: AppListing }) {
  const { navigate, toggleSave, savedIds, users } = useApp();
  const isSaved = savedIds.has(listing.id);
  const seller = users.find((u) => u.id === listing.sellerId);

  return (
    <div
      className="bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => navigate('listing', { listingId: listing.id })}
    >
      <div className="flex">
        <div className="w-40 sm:w-48 flex-shrink-0 bg-muted overflow-hidden" style={{ height: '140px' }}>
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">{listing.title}</h3>
            <button
              onClick={(e) => { e.stopPropagation(); toggleSave(listing.id); }}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1.5 mb-2">
            <span className="text-lg font-bold text-primary">${listing.price.toLocaleString()}</span>
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{listing.condition}</span>
            {listing.featured && <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Featured</span>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{listing.description.slice(0, 120)}...</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="bg-muted px-2 py-0.5 rounded-full">{listing.brand}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location}</span>
            {seller && <span>{seller.name}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const {
    listings,
    navParams,
    navigate,
    currentUser,
    openAuth,
  } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(() => {
    if (navParams.mainCategory) return navParams.mainCategory;
    const selected = CATEGORIES.find((category) => category.id === navParams.categoryId);
    return selected?.group ?? MAIN_CATEGORY_ORDER[0];
  });
  const [filters, setFilters] = useState<Filters>({
    query: '',
    mainCategory: (() => {
      if (navParams.mainCategory) return navParams.mainCategory;
      if (!navParams.categoryId) return '';
      const selected = CATEGORIES.find((category) => category.id === navParams.categoryId);
      return selected?.group ?? '';
    })(),
    selectedSubcategoryIds: navParams.categoryId ? [navParams.categoryId] : [],
    brand: '',
    condition: '',
    state: '',
    minPrice: '',
    maxPrice: '',
    sort: 'recent',
  });

  const preserveScrollPosition = useCallback((scrollY: number) => {
    requestAnimationFrame(() => {
      if (window.scrollY !== scrollY) {
        window.scrollTo({ top: scrollY, behavior: 'auto' });
      }
    });
  }, []);

  const updateFilters = useCallback((updater: (prev: Filters) => Filters) => {
    const scrollY = window.scrollY;
    setFilters((prev) => updater(prev));
    preserveScrollPosition(scrollY);
  }, [preserveScrollPosition]);

  const set = useCallback((field: keyof Filters) => (value: string) => {
    updateFilters((prev) => ({ ...prev, [field]: value }));
  }, [updateFilters]);

  const [searchDraft, setSearchDraft] = useState('');
  const [priceDraft, setPriceDraft] = useState({ minPrice: '', maxPrice: '' });
  const [appliedPriceRange, setAppliedPriceRange] = useState({ minPrice: '', maxPrice: '' });

  const applySearchQuery = useCallback((nextQuery = searchDraft) => {
    updateFilters((prev) => {
      if (prev.query === nextQuery) return prev;
      return { ...prev, query: nextQuery };
    });
  }, [searchDraft, updateFilters]);

  const applyPriceRange = useCallback((nextRange = priceDraft) => {
    setAppliedPriceRange((prev) => {
      if (prev.minPrice === nextRange.minPrice && prev.maxPrice === nextRange.maxPrice) return prev;
      return nextRange;
    });

    updateFilters((prev) => {
      if (prev.minPrice === nextRange.minPrice && prev.maxPrice === nextRange.maxPrice) return prev;
      return { ...prev, minPrice: nextRange.minPrice, maxPrice: nextRange.maxPrice };
    });
  }, [priceDraft, updateFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applySearchQuery(searchDraft);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchDraft, applySearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyPriceRange(priceDraft);
    }, 400);

    return () => clearTimeout(timer);
  }, [priceDraft.minPrice, priceDraft.maxPrice, applyPriceRange]);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applySearchQuery((event.target as HTMLInputElement).value);
    }
  };

  const clearSearch = () => {
    setSearchDraft('');
    applySearchQuery('');
  };

  const updatePriceDraft = (field: 'minPrice' | 'maxPrice', value: string) => {
    setPriceDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applyPriceRange();
    }
  };

  const clearPriceRange = () => {
    const empty = { minPrice: '', maxPrice: '' };
    setPriceDraft(empty);
    applyPriceRange(empty);
  };

  const activeListings = useMemo(() => listings.filter((listing) => listing.status === 'active'), [listings]);
  const categoryCounts = useMemo(() => {
    let result = activeListings;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (l) => l.title.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
      );
    }
    if (filters.brand) result = result.filter((l) => l.brand === filters.brand);
    if (filters.condition) result = result.filter((l) => l.condition === filters.condition);
    if (filters.state) result = result.filter((l) => l.state === filters.state);
    if (appliedPriceRange.minPrice) result = result.filter((l) => l.price >= Number(appliedPriceRange.minPrice));
    if (appliedPriceRange.maxPrice) result = result.filter((l) => l.price <= Number(appliedPriceRange.maxPrice));

    return result.reduce<Record<string, number>>((acc, listing) => {
      if (!listing.categoryId) return acc;
      acc[listing.categoryId] = (acc[listing.categoryId] ?? 0) + 1;
      return acc;
    }, {});
  }, [activeListings, filters.query, filters.brand, filters.condition, filters.state, appliedPriceRange.minPrice, appliedPriceRange.maxPrice]);
  const brandCounts = useMemo(
    () => activeListings.reduce<Record<string, number>>((acc, listing) => {
      const key = listing.brand?.trim();
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
    [activeListings]
  );
  const availableBrands = useMemo(() => {
    const knownBrands = BRANDS.filter((brand) => (brandCounts[brand] ?? 0) > 0);
    const dynamicBrands = Object.keys(brandCounts)
      .filter((brand) => !BRANDS.includes(brand) && (brandCounts[brand] ?? 0) > 0)
      .sort((a, b) => a.localeCompare(b));
    return [...knownBrands, ...dynamicBrands];
  }, [brandCounts]);
  const stateCounts = useMemo(
    () => activeListings.reduce<Record<string, number>>((acc, listing) => {
      const key = listing.state?.trim();
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
    [activeListings]
  );
  const filtered = useMemo(() => {
    let result = activeListings;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (l) => l.title.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
      );
    }
    if (filters.mainCategory) {
      const groupedCategoryIds = new Set(
        CATEGORIES
          .filter((category) => category.group === filters.mainCategory)
          .map((category) => category.id)
      );
      result = result.filter((l) => groupedCategoryIds.has(l.categoryId));
    }
    if (filters.selectedSubcategoryIds.length > 0) {
      result = result.filter((l) => filters.selectedSubcategoryIds.includes(l.categoryId));
    }
    if (filters.brand) result = result.filter((l) => l.brand === filters.brand);
    if (filters.condition) result = result.filter((l) => l.condition === filters.condition);
    if (filters.state) result = result.filter((l) => l.state === filters.state);
    if (appliedPriceRange.minPrice) result = result.filter((l) => l.price >= Number(appliedPriceRange.minPrice));
    if (appliedPriceRange.maxPrice) result = result.filter((l) => l.price <= Number(appliedPriceRange.maxPrice));
    switch (filters.sort) {
      case 'price-asc': return [...result].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...result].sort((a, b) => b.price - a.price);
      case 'views': return [...result].sort((a, b) => b.views - a.views);
      default: return [...result].sort((a, b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime());
    }
  }, [activeListings, filters, appliedPriceRange.minPrice, appliedPriceRange.maxPrice]);

  const activeCategory = filters.selectedSubcategoryIds.length === 1
    ? CATEGORIES.find((c) => c.id === filters.selectedSubcategoryIds[0])
    : null;
  const activeMainCategory = filters.mainCategory || activeCategory?.group || '';
  const groupedCategories = useMemo(
    () => MAIN_CATEGORY_ORDER.map((group) => ({
      group,
      items: CATEGORIES.filter((category) => category.group === group && !category.isPrimary),
    })),
    []
  );

  useEffect(() => {
    const firstSelectedSubcategoryId = filters.selectedSubcategoryIds[0];
    if (!firstSelectedSubcategoryId) return;
    const selectedGroup = CATEGORIES.find((category) => category.id === firstSelectedSubcategoryId)?.group;

    if (selectedGroup && expandedGroup !== selectedGroup) {
      setExpandedGroup(selectedGroup);
    }
  }, [filters.selectedSubcategoryIds, expandedGroup]);

  useEffect(() => {
    const nextCategoryId = navParams.categoryId ?? '';
    const nextMainCategory = navParams.mainCategory ?? (
      nextCategoryId
        ? (CATEGORIES.find((category) => category.id === nextCategoryId)?.group ?? '')
        : ''
    );
    const nextSelectedSubcategoryIds = nextCategoryId ? [nextCategoryId] : [];

    setFilters((prev) => {
      if (
        prev.mainCategory === nextMainCategory
        && prev.selectedSubcategoryIds.length === nextSelectedSubcategoryIds.length
        && prev.selectedSubcategoryIds.every((id, index) => id === nextSelectedSubcategoryIds[index])
      ) {
        return prev;
      }
      return { ...prev, mainCategory: nextMainCategory, selectedSubcategoryIds: nextSelectedSubcategoryIds };
    });

    if (nextMainCategory && expandedGroup !== nextMainCategory) {
      setExpandedGroup(nextMainCategory);
    }
  }, [navParams.categoryId, navParams.mainCategory]);

  const clearFilters = () => {
    updateFilters(() => ({ query: '', mainCategory: '', selectedSubcategoryIds: [], brand: '', condition: '', state: '', minPrice: '', maxPrice: '', sort: 'recent' }));
    setSearchDraft('');
    setPriceDraft({ minPrice: '', maxPrice: '' });
    setAppliedPriceRange({ minPrice: '', maxPrice: '' });
  };
  const activeFilterCount = [filters.selectedSubcategoryIds.length > 0 || filters.mainCategory, filters.brand, filters.condition, filters.state, filters.minPrice, filters.maxPrice].filter(Boolean).length;
  const handleSellTools = () => {
    if (currentUser) {
      navigate('create');
      return;
    }
    openAuth('register');
  };

  const handleBrowseCategories = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(true);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFilterPanel = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
          <div className="space-y-2">
            <button onClick={() => updateFilters((prev) => ({ ...prev, mainCategory: '', selectedSubcategoryIds: [] }))} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.mainCategory && filters.selectedSubcategoryIds.length === 0 ? 'bg-primary text-white font-medium' : 'text-foreground hover:bg-muted'}`}>All Categories</button>
            {groupedCategories.map(({ group, items }) => {
              const isExpanded = expandedGroup === group;
              const isMainCategorySelected = filters.mainCategory === group;

              return (
                <div key={group} className="rounded-lg border border-border/70 bg-background/70">
                  <button
                    onClick={() => {
                      setExpandedGroup((current) => (current === group ? null : group));
                      updateFilters((prev) => {
                        if (prev.mainCategory === group) {
                          return prev;
                        }
                        return { ...prev, mainCategory: group, selectedSubcategoryIds: [] };
                      });
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors rounded-lg ${isMainCategorySelected ? 'bg-primary text-white' : 'hover:bg-muted/60'}`}
                  >
                    <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${isMainCategorySelected ? 'text-white' : 'text-foreground'}`}>{group}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'} ${isMainCategorySelected ? 'text-white/80' : 'text-muted-foreground'}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-2 space-y-0.5">
                      {items.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => updateFilters((prev) => {
                            const isSelected = prev.selectedSubcategoryIds.includes(cat.id);
                            return {
                              ...prev,
                              mainCategory: group,
                              selectedSubcategoryIds: isSelected
                                ? prev.selectedSubcategoryIds.filter((id) => id !== cat.id)
                                : [...prev.selectedSubcategoryIds, cat.id],
                            };
                          })}
                          title={cat.name}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 min-h-[40px] rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${filters.selectedSubcategoryIds.includes(cat.id) ? 'bg-primary text-white font-medium' : 'text-foreground hover:bg-muted'}`}
                        >
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</span>
                          {(categoryCounts[cat.id] ?? 0) > 0 && (
                            <span className={`text-xs flex-shrink-0 ${filters.selectedSubcategoryIds.includes(cat.id) ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {(categoryCounts[cat.id] ?? 0).toLocaleString()}
                            </span>
                          )}
                        </button>
                      ))}

                      {filters.mainCategory === group && filters.selectedSubcategoryIds.length > 0 && (
                        <button
                          onClick={() => updateFilters((prev) => ({ ...prev, selectedSubcategoryIds: [] }))}
                          className="mt-2 w-full text-left px-2.5 py-2 text-xs font-semibold text-primary hover:underline"
                        >
                          Clear subcategories
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Brand</h3>
          <select value={filters.brand} disabled={availableBrands.length === 0} onChange={(e) => set('brand')(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60">
            <option value="">All Brands</option>
            {availableBrands.map((b) => <option key={b} value={b}>{`${b}${(brandCounts[b] ?? 0) > 0 ? ` (${(brandCounts[b] ?? 0).toLocaleString()})` : ''}`}</option>)}
          </select>
          {availableBrands.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Brands will appear as listings are added.</p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Price Range (AUD)</h3>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min $AUD" value={priceDraft.minPrice} onChange={(e) => updatePriceDraft('minPrice', e.target.value)} onBlur={() => applyPriceRange()} onKeyDown={handlePriceInputKeyDown} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <span className="text-muted-foreground flex-shrink-0">–</span>
            <input type="number" placeholder="Max $AUD" value={priceDraft.maxPrice} onChange={(e) => updatePriceDraft('maxPrice', e.target.value)} onBlur={() => applyPriceRange()} onKeyDown={handlePriceInputKeyDown} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Condition</h3>
          <div className="space-y-1.5">
            {CONDITIONS.map((cond) => (
              <label key={cond} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="radio" name="condition" checked={filters.condition === cond} onChange={() => set('condition')(filters.condition === cond ? '' : cond)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{cond}</span>
              </label>
            ))}
            {filters.condition && <button onClick={() => set('condition')('')} className="text-xs text-primary hover:underline mt-1">Clear</button>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">State / Territory</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {STATES.map((s) => (
              <button key={s} onClick={() => set('state')(filters.state === s ? '' : s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filters.state === s ? 'bg-primary border-primary text-white' : 'border-border text-foreground hover:border-primary hover:text-primary'}`}>
                {`${s}${(stateCounts[s] ?? 0) > 0 ? ` (${(stateCounts[s] ?? 0).toLocaleString()})` : ''}`}
              </button>
            ))}
          </div>
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="w-full py-2 text-sm text-destructive border border-destructive/30 rounded-xl hover:bg-red-50 transition-colors">
            Clear All Filters ({activeFilterCount})
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{activeCategory ? activeCategory.name : (activeMainCategory || 'All Listings')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Browse professional tools from tradies across Australia.</p>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md bg-muted rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input type="text" placeholder="Search tools, brands or keywords..." value={searchDraft} onChange={(e) => setSearchDraft(e.target.value)} onBlur={() => applySearchQuery()} onKeyDown={handleSearchKeyDown} className="flex-1 bg-transparent text-sm border-none outline-none placeholder:text-muted-foreground" />
              {searchDraft && <button onClick={clearSearch}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-border p-5 sticky top-24">
              {renderFilterPanel()}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-5 bg-white rounded-xl border border-border px-4 py-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>}
              </button>
              <div className="flex items-center gap-2 w-full justify-end sm:w-auto sm:ml-auto min-w-0">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mr-1 min-w-0">
                  <span>Sort:</span>
                  <select value={filters.sort} onChange={(e) => set('sort')(e.target.value)} className="border-none bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer max-w-[120px] sm:max-w-none truncate">
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 flex-shrink-0">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}><Grid3X3 className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.mainCategory && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{filters.mainCategory}<button onClick={() => updateFilters((prev) => ({ ...prev, mainCategory: '', selectedSubcategoryIds: [] }))}><X className="w-3 h-3" /></button></span>}
                {filters.selectedSubcategoryIds.map((subcategoryId) => (
                  <span key={subcategoryId} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    {CATEGORIES.find((c) => c.id === subcategoryId)?.name}
                    <button onClick={() => updateFilters((prev) => ({ ...prev, selectedSubcategoryIds: prev.selectedSubcategoryIds.filter((id) => id !== subcategoryId) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.brand && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{filters.brand}<button onClick={() => set('brand')('')}><X className="w-3 h-3" /></button></span>}
                {filters.condition && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{filters.condition}<button onClick={() => set('condition')('')}><X className="w-3 h-3" /></button></span>}
                {filters.state && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"><MapPin className="w-3 h-3" />{filters.state}<button onClick={() => set('state')('')}><X className="w-3 h-3" /></button></span>}
                {(filters.minPrice || filters.maxPrice) && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">${filters.minPrice || '0'} – ${filters.maxPrice || '∞'}<button onClick={clearPriceRange}><X className="w-3 h-3" /></button></span>}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
                <h3 className="font-bold text-foreground mb-2">Listings coming soon</h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-xl mx-auto">ToolLink is growing, and new listings are being added regularly. Check back soon or create a free listing.</p>
                <button onClick={handleSellTools} className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">Create a Listing</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((listing) => <ListCard key={listing.id} listing={listing} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative bg-white w-full max-w-sm ml-auto h-full overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-bold text-foreground">Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-5">
              {renderFilterPanel()}
              <button onClick={() => setSidebarOpen(false)} className="w-full mt-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
