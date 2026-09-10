// Fetches all Bonus Hunts for the "oscolderst" bonushunt.gg account via the
// official Developer API (https://bonushunt.gg/api) and writes a static JSON
// file the website reads at runtime. Runs on a schedule via
// .github/workflows/update-bonus-hunts.yml.
//
// Requires a BONUSHUNT_API_KEY environment variable (a bonushunt.gg API key,
// generated at bonushunt.gg -> Integrations -> API, sent as a repository
// secret by the workflow).
//
// Run manually with: BONUSHUNT_API_KEY=bnt_xxx node scripts/update-bonus-hunts.mjs

const USERNAME = "oscolderst";
const API_KEY = process.env.BONUSHUNT_API_KEY;
const API_BASE = "https://bonushunt.gg/api/public/hunts";
const PAGE_LIMIT = 100;
const OUT_FILE = new URL("../bonus-hunts-data.json", import.meta.url);

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

async function fetchAllHunts() {
  if (!API_KEY) {
    throw new Error(
      "Missing BONUSHUNT_API_KEY environment variable. Generate a key at " +
        "bonushunt.gg -> Integrations -> API and add it as a repository secret."
    );
  }

  const hunts = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(API_BASE);
    url.searchParams.set("limit", String(PAGE_LIMIT));
    url.searchParams.set("offset", String(offset));

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`bonushunt.gg API request failed: ${res.status} ${res.statusText} ${body}`);
    }
    const data = await res.json();
    hunts.push(...(data.hunts || []));
    hasMore = Boolean(data.pagination && data.pagination.hasMore);
    offset += PAGE_LIMIT;
    // Safety valve so a bug in pagination can't loop forever.
    if (hunts.length > 2000) break;
  }

  return hunts;
}

function summarizeHunt(hunt) {
  const bonuses = (hunt.bonuses || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const bonusCount = bonuses.length;
  const totalWinnings = bonuses.reduce((sum, b) => sum + (b.payout || 0), 0);
  const startCost = hunt.startCost || 0;
  const profitLoss = totalWinnings - startCost;
  const profitLossPercentage = startCost ? (profitLoss / startCost) * 100 : 0;
  const averagePayoutRequired = bonusCount ? startCost / bonusCount : 0;
  const currentAverage = bonusCount ? totalWinnings / bonusCount : 0;
  const totalBetSize = bonuses.reduce((sum, b) => sum + (b.betSize || 0), 0);
  const averageBetSize = bonusCount ? totalBetSize / bonusCount : 0;
  const cumulativeMultiplier = bonuses.reduce((sum, b) => sum + (b.multiplier || 0), 0);
  const currentAverageMultiplier = bonusCount ? cumulativeMultiplier / bonusCount : 0;
  const averageRequiredMultiplier = averageBetSize ? averagePayoutRequired / averageBetSize : 0;

  let highestWin = null;
  let highestMulti = null;
  let lowestMulti = null;
  for (const b of bonuses) {
    if (!highestWin || (b.payout || 0) > (highestWin.payout || 0)) highestWin = b;
    if (!highestMulti || (b.multiplier || 0) > (highestMulti.multiplier || 0)) highestMulti = b;
    if (!lowestMulti || (b.multiplier || 0) < (lowestMulti.multiplier || 0)) lowestMulti = b;
  }

  const pickSlot = (b) =>
    b && {
      slotName: b.slotName,
      provider: b.provider,
      slotImage: b.slotImage,
      payout: round2(b.payout || 0),
      multiplier: round2(b.multiplier || 0),
      betSize: round2(b.betSize || 0),
    };

  return {
    id: hunt.id,
    title: hunt.title,
    casino: hunt.casino,
    currency: hunt.currency || "EUR",
    createdAt: hunt.createdAt,
    updatedAt: hunt.updatedAt,
    isOpening: Boolean(hunt.isOpening),
    startCost: round2(startCost),
    bonusCount,
    totalWinnings: round2(totalWinnings),
    profitLoss: round2(profitLoss),
    profitLossPercentage: round2(profitLossPercentage),
    averagePayoutRequired: round2(averagePayoutRequired),
    currentAverage: round2(currentAverage),
    averageBetSize: round2(averageBetSize),
    cumulativeMultiplier: round2(cumulativeMultiplier),
    currentAverageMultiplier: round2(currentAverageMultiplier),
    averageRequiredMultiplier: round2(averageRequiredMultiplier),
    highestWin: pickSlot(highestWin),
    highestMulti: pickSlot(highestMulti),
    lowestMulti: pickSlot(lowestMulti),
    bonuses: bonuses.map((b) => ({
      slotName: b.slotName,
      provider: b.provider,
      slotImage: b.slotImage,
      betSize: round2(b.betSize || 0),
      multiplier: round2(b.multiplier || 0),
      payout: round2(b.payout || 0),
    })),
  };
}

async function main() {
  const rawHunts = await fetchAllHunts();
  // Newest first.
  rawHunts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const hunts = rawHunts.map(summarizeHunt);

  const payload = {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    hunts,
  };

  const fs = await import("node:fs/promises");
  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`Wrote ${hunts.length} hunts to ${OUT_FILE.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
