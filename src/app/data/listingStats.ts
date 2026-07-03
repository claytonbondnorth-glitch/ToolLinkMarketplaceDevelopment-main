import { supabase } from '../../lib/supabase';

export type MarketplaceStatistic = 'activeListings' | 'verifiedTrades' | 'salesThisMonth' | 'citiesCovered' | 'completedTransactions';

const DEFAULT_STAT_COUNTS: Record<MarketplaceStatistic, number> = {
  activeListings: 0,
  verifiedTrades: 0,
  salesThisMonth: 0,
  citiesCovered: 0,
  completedTransactions: 0,
};

const COMPLETED_SALE_STATUS = 'sold';
const SALE_COMPLETED_AT_COLUMN = 'sold_at';

async function countSoldListingsWithBuyer(): Promise<number> {
  const { count, error } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', COMPLETED_SALE_STATUS)
    .not('sold_to_user_id', 'is', null);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function getCurrentMonthRange() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    monthStartIso: monthStart.toISOString(),
    nextMonthStartIso: nextMonthStart.toISOString(),
  };
}

async function countCompletedSalesThisMonth(): Promise<number> {
  const { monthStartIso, nextMonthStartIso } = getCurrentMonthRange();
  const { count, error } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', COMPLETED_SALE_STATUS)
    .not('sold_to_user_id', 'is', null)
    .gte(SALE_COMPLETED_AT_COLUMN, monthStartIso)
    .lt(SALE_COMPLETED_AT_COLUMN, nextMonthStartIso);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function countCitiesCoveredFromListings(): Promise<number> {
  const { data, error } = await supabase
    .from('listings')
    .select('location, state')
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  const uniqueCoverage = new Set(
    (data ?? [])
      .map((row) => {
        const location = typeof row.location === 'string' ? row.location.trim().toLowerCase() : '';
        const state = typeof row.state === 'string' ? row.state.trim().toLowerCase() : '';
        if (!location && !state) return '';
        return `${location}|${state}`;
      })
      .filter(Boolean)
  );

  return uniqueCoverage.size;
}

export async function getMarketplaceStatisticCount(statistic: MarketplaceStatistic): Promise<number> {
  try {
    if (statistic === 'activeListings') {
      const { count, error } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return count ?? 0;
    }

    if (statistic === 'verifiedTrades' || statistic === 'completedTransactions') {
      return await countSoldListingsWithBuyer();
    }

    if (statistic === 'salesThisMonth') {
      return await countCompletedSalesThisMonth();
    }

    if (statistic === 'citiesCovered') {
      return await countCitiesCoveredFromListings();
    }

    return DEFAULT_STAT_COUNTS[statistic];
  } catch {
    return DEFAULT_STAT_COUNTS[statistic];
  }
}

export async function getActiveListingsCount(): Promise<number> {
  return getMarketplaceStatisticCount('activeListings');
}

export async function getVerifiedTradesCount(): Promise<number> {
  return getMarketplaceStatisticCount('verifiedTrades');
}

export async function getSalesThisMonthCount(): Promise<number> {
  return getMarketplaceStatisticCount('salesThisMonth');
}

export async function getCitiesCoveredCount(): Promise<number> {
  return getMarketplaceStatisticCount('citiesCovered');
}

export async function getCompletedTransactionsCount(): Promise<number> {
  return getMarketplaceStatisticCount('completedTransactions');
}
