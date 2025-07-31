// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Flex,
  Grid,
  Button,
  Skeleton,
  Avatar,
  Tag,
  Icon,
} from "@once-ui-system/core";

// Types
interface Period {
  start: number;
  end: number;
}

interface Team {
  id: number;
  name: string;
  playerName: string;
  totalScore: number;
  currentPeriodScore?: number;
  lastPeriodScore?: number;
}

interface FPLData {
  currentGameweek: number;
  currentPeriod: Period;
  currentPeriodLeaderboard: Team[];
  lastPeriodLeaderboard: Team[];
  lastLoser: string | null;
  leagueName?: string;
}

// Forfeit definitions
const forfeits = [
  { weeks: "1-4", description: "Stare at wall for 30 minutes without music" },
  {
    weeks: "5-8",
    description: "Ghost Chilli, or teaspoon of Carolina Reaper sauce",
  },
  {
    weeks: "9-12",
    description:
      "Presentation on why you lost, 5 minute PowerPoint live with us",
  },
  {
    weeks: "13-16",
    description: "Ball to balls (lie down, spread legs, someone drops it)",
  },
  { weeks: "17-20", description: "Ice bucket Outside (no towel for 1 min)" },
  {
    weeks: "21-24",
    description:
      "Chug 2l of milk in 2 min (if fail then add 20 GBP to prize pool)",
  },
  {
    weeks: "25-28",
    description: "Makeup Tutorial (3 min vid, solo, serious and real makeup)",
  },
  {
    weeks: "29-32",
    description:
      "Raw egg (1 egg in a glass to be swallowed, if fail then 20 GBP)",
  },
  {
    weeks: "33-38",
    description: "Depressing Meal (Others pick from a list of food)",
  },
];

// Mock data for testing (remove this when season starts)
const MOCK_DATA: FPLData = {
  currentGameweek: 7,
  currentPeriod: { start: 5, end: 8 },
  leagueName: "Test League - Remove When Season Starts",
  currentPeriodLeaderboard: [
    {
      id: 1,
      name: "Paul's XI",
      playerName: "Paul",
      currentPeriodScore: 120,
      totalScore: 850,
    },
    {
      id: 2,
      name: "Ro's Squad",
      playerName: "Ro",
      currentPeriodScore: 140,
      totalScore: 820,
    },
    {
      id: 3,
      name: "John FC",
      playerName: "John",
      currentPeriodScore: 180,
      totalScore: 900,
    },
    {
      id: 4,
      name: "Mike United",
      playerName: "Mike",
      currentPeriodScore: 165,
      totalScore: 880,
    },
  ],
  lastPeriodLeaderboard: [
    {
      id: 1,
      name: "Paul's XI",
      playerName: "Paul",
      lastPeriodScore: 100,
      totalScore: 730,
    },
    {
      id: 2,
      name: "David's Squad",
      playerName: "David",
      lastPeriodScore: 150,
      totalScore: 680,
    },
    {
      id: 3,
      name: "John FC",
      playerName: "John",
      lastPeriodScore: 130,
      totalScore: 720,
    },
    {
      id: 4,
      name: "Mike United",
      playerName: "Mike",
      lastPeriodScore: 125,
      totalScore: 715,
    },
  ],
  lastLoser: "Paul",
};

// Utility functions
function getCurrentPeriod(gameweek: number): Period {
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

function getCurrentForfeit(period: Period) {
  const forfeitIndex = Math.floor((period.start - 1) / 4);
  return forfeits[forfeitIndex] || forfeits[0];
}

export default function Page() {
  const [data, setData] = useState<FPLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchFPLData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/fpl?action=period-scores");
      if (!response.ok) {
        throw new Error("Failed to fetch FPL data");
      }

      const fplData = await response.json();
      setData(fplData);
      setLastRefresh(new Date());
      setUseMockData(false);
    } catch (err) {
      console.error("FPL API Error:", err);
      // If it's off-season or API fails, offer to use mock data
      setError(
        "Unable to fetch live FPL data. The season may not have started yet.",
      );
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setData(MOCK_DATA);
    setLastRefresh(new Date());
    setError(null);
    setUseMockData(true);
  };

  useEffect(() => {
    fetchFPLData();
    // Only set up interval if we're not using mock data
    if (!useMockData) {
      const interval = setInterval(fetchFPLData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [useMockData]);

  if (loading && !data) {
    return (
      <Flex fillWidth paddingTop="xl" paddingX="l" direction="column" flex={1}>
        <Flex direction="column" gap="m">
          <Skeleton shape="line" width="xl" height="m" />
          <Skeleton shape="line" width="l" height="s" />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Loading FPL data...
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (error && !data) {
    return (
      <Flex fillWidth paddingTop="xl" paddingX="l" direction="column" flex={1}>
        <Flex
          direction="column"
          gap="m"
          padding="xl"
          background="warning-weak"
          radius="l"
        >
          <Icon name="AlertCircle" size="l" onBackground="warning-strong" />
          <Text variant="body-default-m" onBackground="warning-strong">
            {error}
          </Text>
          <Flex gap="s">
            <Button variant="secondary" size="s" onClick={fetchFPLData}>
              Try Again
            </Button>
            <Button variant="primary" size="s" onClick={loadMockData}>
              Use Test Data
            </Button>
          </Flex>
          <Text variant="body-default-xs" onBackground="warning-weak">
            The FPL season typically starts in August. Use test data to preview
            the tracker.
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (!data) return null;

  const currentForfeit = getCurrentForfeit(data.currentPeriod);

  return (
    <Flex fillWidth paddingTop="xl" paddingX="l" direction="column" flex={1}>
      {/* Header */}
      <Flex direction="column" marginBottom="xl">
        <Heading variant="display-strong-xl" marginBottom="s">
          FPL Forfeit Tracker
        </Heading>
        <Text
          variant="body-default-m"
          onBackground="neutral-weak"
          marginBottom="xs"
        >
          {data.leagueName ? `${data.leagueName} - ` : ""}Tracking who gets the
          forfeit every 4 gameweeks
        </Text>
        {lastRefresh && (
          <Flex gap="xs">
            <Icon name="RefreshCw" size="xs" onBackground="neutral-weak" />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {useMockData && " (Test Data)"}
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Mock Data Warning */}
      {useMockData && (
        <Flex
          padding="m"
          background="warning-weak"
          radius="m"
          marginBottom="m"
          gap="s"
        >
          <Icon name="Info" size="s" onBackground="warning-strong" />
          <Text variant="body-default-xs" onBackground="warning-strong">
            Using test data. Live data will be available when the FPL season
            starts.
          </Text>
        </Flex>
      )}

      {/* Refresh Button */}
      <Flex marginBottom="m">
        <Button
          variant="tertiary"
          size="s"
          onClick={fetchFPLData}
          disabled={loading}
          prefixIcon={loading ? "LoaderCircle" : "RefreshCw"}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </Flex>

      {/* Current Period Info */}
      <Flex
        direction="column"
        gap="m"
        padding="l"
        background="surface"
        border="neutral-medium"
        radius="l"
        marginBottom="l"
      >
        <Flex>
          <Flex gap="s">
            <Icon name="Calendar" size="m" onBackground="accent-strong" />
            <Heading variant="heading-strong-l">
              Current Period: Gameweeks {data.currentPeriod.start}-
              {data.currentPeriod.end}
            </Heading>
          </Flex>
          <Tag size="s" variant="accent">
            GW {data.currentGameweek}
          </Tag>
        </Flex>
        <Flex padding="m" background="warning-weak" radius="m">
          <Text variant="body-default-s" onBackground="warning-strong">
            <strong>Forfeit:</strong> {currentForfeit.description}
          </Text>
        </Flex>
      </Flex>

      {/* Current Period Leaderboard */}
      <Flex
        direction="column"
        gap="m"
        padding="l"
        background="surface"
        border="neutral-medium"
        radius="l"
        marginBottom="l"
      >
        <Flex gap="s">
          <Icon name="Trophy" size="m" onBackground="warning-strong" />
          <Heading variant="heading-strong-m">
            Current Period Leaderboard
          </Heading>
        </Flex>

        <Flex direction="column" gap="s">
          {data.currentPeriodLeaderboard.map((team, index) => (
            <Flex
              key={team.id}
              padding="m"
              background={index === 0 ? "danger-weak" : "neutral-weak"}
              radius="m"
            >
              <Flex gap="m">
                <Avatar size="s" value={String(index + 1)} />
                <Flex direction="column">
                  <Text variant="body-strong-s">{team.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {team.playerName}
                  </Text>
                </Flex>
              </Flex>
              <Flex gap="l">
                <Flex direction="column">
                  <Text variant="body-strong-s">
                    {team.currentPeriodScore} pts
                  </Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Total: {team.totalScore}
                  </Text>
                </Flex>
                {index === 0 && (
                  <Tag size="s" variant="danger">
                    ⚠️ Forfeit
                  </Tag>
                )}
              </Flex>
            </Flex>
          ))}
        </Flex>

        {data.currentPeriodLeaderboard[0] && (
          <Flex padding="m" background="warning-weak" radius="m" gap="s">
            <Icon name="AlertCircle" size="s" onBackground="warning-strong" />
            <Text variant="body-default-s" onBackground="warning-strong">
              <strong>{data.currentPeriodLeaderboard[0].playerName}</strong> is
              currently in line for the forfeit with{" "}
              {data.currentPeriodLeaderboard[0].currentPeriodScore} points this
              period
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Last Period Results */}
      {data.currentPeriod.start > 1 && data.lastLoser && (
        <Flex
          direction="column"
          gap="m"
          padding="l"
          background="surface"
          border="neutral-medium"
          radius="l"
        >
          <Flex gap="s">
            <Icon name="History" size="m" onBackground="danger-strong" />
            <Heading variant="heading-strong-m">Last Period Results</Heading>
          </Flex>

          <Flex padding="m" background="danger-weak" radius="m" gap="m">
            <Tag size="s" variant="danger">
              💀 LOSER
            </Tag>
            <Text variant="body-strong-s" onBackground="danger-strong">
              {data.lastLoser}
            </Text>
            <Text variant="body-default-xs" onBackground="danger-weak">
              (Gameweeks {data.currentPeriod.start - 4}-
              {data.currentPeriod.start - 1})
            </Text>
          </Flex>

          <Flex direction="column" gap="s">
            {data.lastPeriodLeaderboard.map((team, index) => (
              <Flex
                key={team.id}
                padding="m"
                background={
                  team.playerName === data.lastLoser
                    ? "danger-weak"
                    : "neutral-weak"
                }
                radius="m"
              >
                <Flex gap="m">
                  <Avatar size="s" value={String(index + 1)} />
                  <Flex direction="column">
                    <Text variant="body-strong-s">{team.name}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {team.playerName}
                    </Text>
                  </Flex>
                </Flex>
                <Flex gap="l">
                  <Flex direction="column">
                    <Text variant="body-strong-s">
                      {team.lastPeriodScore} pts
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      Total: {team.totalScore}
                    </Text>
                  </Flex>
                  {team.playerName === data.lastLoser && (
                    <Tag size="s" variant="danger">
                      💀
                    </Tag>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}

      {/* First Period Message */}
      {data.currentPeriod.start === 1 && (
        <Flex padding="l" background="accent-weak" radius="l">
          <Text variant="body-default-m" onBackground="accent-strong">
            This is the first forfeit period. No previous results to display
            yet!
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
