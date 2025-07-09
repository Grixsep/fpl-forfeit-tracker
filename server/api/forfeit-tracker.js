export default defineEventHandler(async (event) => {
  // CHANGE THIS TO YOUR ACTUAL LEAGUE ID
  const LEAGUE_ID = "689297"; // Replace with your league ID

  try {
    // API Base URL
    const API_BASE = "https://fantasy.premierleague.com/api";

    // Get current gameweek from bootstrap-static
    const bootstrapResponse = await $fetch(`${API_BASE}/bootstrap-static/`);

    // Find the current gameweek
    const currentGameweek =
      bootstrapResponse.events.find((event) => event.is_current)?.id || 38; // Default to 38 if season is over

    // Calculate completed periods
    const completedPeriods = [];
    for (let gw = 4; gw <= currentGameweek; gw += 4) {
      completedPeriods.push(gw);
    }

    // Get league standings
    const leagueData = await $fetch(
      `${API_BASE}/leagues-classic/${LEAGUE_ID}/standings/`
    );

    // Fetch data for each manager
    const managersData = await Promise.all(
      leagueData.standings.results.map(async (manager) => {
        const periodPerformance = {};
        let previousTotal = 0;

        // Get total points at each checkpoint
        for (const checkpoint of completedPeriods) {
          try {
            const gwData = await $fetch(
              `${API_BASE}/entry/${manager.entry}/event/${checkpoint}/picks/`
            );

            const currentTotal = gwData.entry_history.total_points;
            const periodPoints = currentTotal - previousTotal;

            periodPerformance[`period_${checkpoint}`] = {
              points: periodPoints,
              total: currentTotal,
              hits: gwData.entry_history.event_transfers_cost,
            };

            previousTotal = currentTotal;
          } catch (error) {
            console.error(
              `Error fetching data for manager ${manager.entry}:`,
              error
            );
          }
        }

        return {
          id: manager.entry,
          name: manager.player_name,
          teamName: manager.entry_name,
          currentTotal: manager.total,
          currentRank: manager.rank,
          periodPerformance,
        };
      })
    );

    // Calculate forfeit winners for each period
    const forfeitWinners = {};
    completedPeriods.forEach((period) => {
      const periodKey = `period_${period}`;
      const scores = managersData
        .filter((m) => m.periodPerformance[periodKey])
        .map((manager) => ({
          id: manager.id,
          name: manager.name,
          points: manager.periodPerformance[periodKey].points,
        }))
        .sort((a, b) => a.points - b.points);

      if (scores.length > 0) {
        forfeitWinners[periodKey] = scores[0]; // Lowest scorer
      }
    });

    return {
      success: true,
      leagueName: leagueData.league.name,
      currentGameweek,
      completedPeriods,
      managers: managersData,
      forfeitWinners,
    };
  } catch (error) {
    console.error("API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch FPL data",
      data: error.message,
    });
  }
});
