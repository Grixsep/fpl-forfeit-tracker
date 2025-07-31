// app/api/fpl/route.js
import { NextResponse } from "next/server";

// FPL API endpoints
const FPL_BASE_URL = "https://fantasy.premierleague.com/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "league-standings":
        return await getLeagueStandings();
      case "current-gameweek":
        return await getCurrentGameweek();
      case "period-scores":
        return await getPeriodScores();
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("FPL API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FPL data" },
      { status: 500 },
    );
  }
}

async function getCurrentGameweek() {
  const response = await fetch(`${FPL_BASE_URL}/bootstrap-static/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  const data = await response.json();

  const currentGW = data.events.find((event) => event.is_current);
  return NextResponse.json({ gameweek: currentGW?.id || 1 });
}

async function getLeagueStandings() {
  const leagueId = process.env.FPL_LEAGUE_ID;

  if (!leagueId) {
    return NextResponse.json(
      { error: "League ID not configured" },
      { status: 500 },
    );
  }

  // Get current gameweek
  const gwResponse = await fetch(`${FPL_BASE_URL}/bootstrap-static/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  const gwData = await gwResponse.json();
  const currentGW = gwData.events.find((event) => event.is_current)?.id || 1;

  // Get league standings
  const standingsResponse = await fetch(
    `${FPL_BASE_URL}/leagues-classic/${leagueId}/standings/`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
  );
  const standingsData = await standingsResponse.json();

  return NextResponse.json({
    currentGameweek: currentGW,
    standings: standingsData.standings.results,
    leagueName: standingsData.league.name,
  });
}

async function getPeriodScores() {
  const leagueId = process.env.FPL_LEAGUE_ID;

  if (!leagueId) {
    return NextResponse.json(
      { error: "League ID not configured" },
      { status: 500 },
    );
  }

  // Get current gameweek
  const gwResponse = await fetch(`${FPL_BASE_URL}/bootstrap-static/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  const gwData = await gwResponse.json();
  const currentGW = gwData.events.find((event) => event.is_current)?.id || 1;

  // Calculate current period
  const currentPeriod = getCurrentPeriod(currentGW);

  // Get league standings
  const standingsResponse = await fetch(
    `${FPL_BASE_URL}/leagues-classic/${leagueId}/standings/`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
  );

  if (!standingsResponse.ok) {
    throw new Error(
      `Failed to fetch league standings: ${standingsResponse.status}`,
    );
  }

  const standingsData = await standingsResponse.json();

  // For each team, we need to get their gameweek history
  const teamsWithPeriodScores = await Promise.all(
    standingsData.standings.results.map(async (team) => {
      try {
        // Get team history
        const historyResponse = await fetch(
          `${FPL_BASE_URL}/entry/${team.entry}/history/`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          },
        );

        if (!historyResponse.ok) {
          console.error(`Failed to fetch history for team ${team.entry}`);
          return null;
        }

        const historyData = await historyResponse.json();

        // Calculate period scores
        const periodScore = calculatePeriodScore(
          historyData.current,
          currentPeriod.start,
          currentPeriod.end,
          currentGW,
        );

        const lastPeriodScore =
          currentPeriod.start > 1
            ? calculatePeriodScore(
                historyData.current,
                currentPeriod.start - 4,
                currentPeriod.start - 1,
                currentGW,
              )
            : 0;

        return {
          id: team.entry,
          name: team.entry_name,
          playerName: team.player_name,
          totalScore: team.total,
          currentPeriodScore: periodScore,
          lastPeriodScore: lastPeriodScore,
        };
      } catch (error) {
        console.error(`Error processing team ${team.entry}:`, error);
        return null;
      }
    }),
  );

  // Filter out any null results
  const validTeams = teamsWithPeriodScores.filter((team) => team !== null);

  // Sort by period score (lowest first for forfeit)
  const currentPeriodSorted = [...validTeams].sort(
    (a, b) => a.currentPeriodScore - b.currentPeriodScore,
  );

  const lastPeriodSorted =
    currentPeriod.start > 1
      ? [...validTeams].sort((a, b) => a.lastPeriodScore - b.lastPeriodScore)
      : [];

  return NextResponse.json({
    currentGameweek: currentGW,
    currentPeriod: currentPeriod,
    currentPeriodLeaderboard: currentPeriodSorted,
    lastPeriodLeaderboard: lastPeriodSorted,
    lastLoser: lastPeriodSorted[0]?.playerName || null,
    leagueName: standingsData.league.name,
  });
}

function getCurrentPeriod(gameweek) {
  if (gameweek <= 4) return { start: 1, end: 4 };
  if (gameweek <= 8) return { start: 5, end: 8 };
  if (gameweek <= 12) return { start: 9, end: 12 };
  if (gameweek <= 16) return { start: 13, end: 16 };
  if (gameweek <= 20) return { start: 17, end: 20 };
  if (gameweek <= 24) return { start: 21, end: 24 };
  if (gameweek <= 28) return { start: 25, end: 28 };
  if (gameweek <= 32) return { start: 29, end: 32 };
  return { start: 33, end: 38 };
}

function calculatePeriodScore(gameweekHistory, startGW, endGW, currentGW) {
  let periodScore = 0;

  for (let gw = startGW; gw <= Math.min(endGW, currentGW); gw++) {
    const gwData = gameweekHistory.find((week) => week.event === gw);
    if (gwData) {
      periodScore += gwData.points;
    }
  }

  return periodScore;
}
