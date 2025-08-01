// app/forfeits/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Flex,
  Grid,
  Button,
  Skeleton,
  Tag,
  Icon,
  SmartLink,
} from "@once-ui-system/core";
import { Period, forfeits, getCurrentPeriod } from "@/utils/fpl";
import type { FPLData } from "@/types";

// Define a local type without the 'forfeit' property
type ForfeitHistoryItem = {
  period: Period;
  loser: string;
};

type LocalFPLData = Omit<FPLData, "forfeitHistory"> & {
  forfeitHistory?: ForfeitHistoryItem[];
};

export default function ForfeitsPage() {
  const [data, setData] = useState<LocalFPLData | null>(null);
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
  }, []);

  // Mock data for testing
  const MOCK_DATA: LocalFPLData = {
    currentGameweek: 7,
    currentPeriod: { start: 5, end: 8 },
    leagueName: "Test League",
    currentPeriodLeaderboard: [],
    lastPeriodLeaderboard: [],
    lastLoser: "Paul",
    forfeitHistory: [
      {
        period: { start: 1, end: 4 },
        loser: "David",
      },
    ],
  };

  if (loading && !data) {
    return (
      <Flex fillWidth paddingTop="xl" paddingX="l" direction="column" flex={1}>
        <Flex direction="column" gap="m">
          <Skeleton shape="line" width="xl" height="m" />
          <Skeleton shape="line" width="l" height="s" />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Loading forfeit history...
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
        </Flex>
      </Flex>
    );
  }

  if (!data) return null;

  const currentPeriod = data.currentPeriod;
  const currentForfeit = forfeits.find(
    (f) => f.weeks === `${currentPeriod.start}-${currentPeriod.end}`,
  );

  return (
    <Flex fillWidth paddingTop="xl" paddingX="l" direction="column" flex={1}>
      {/* Header */}
      <Flex direction="column" marginBottom="m">
        <Flex gap="s" marginBottom="s">
          <SmartLink href="/">
            <Icon name="ArrowLeft" size="s" /> Back to Tracker
          </SmartLink>
        </Flex>

        <Heading variant="display-strong-xl" marginBottom="s">
          Forfeit History
        </Heading>
        <Text
          variant="body-default-m"
          onBackground="neutral-weak"
          marginBottom="xs"
        >
          Complete history of forfeits and losers
        </Text>
      </Flex>

      {/* Forfeit Table */}
      <Grid columns={3} gap="s" marginBottom="l">
        <Text variant="body-strong-s">Period (GWs)</Text>
        <Text variant="body-strong-s">Forfeit</Text>
        <Text variant="body-strong-s">Loser</Text>

        {forfeits.map((forfeit, index) => {
          const periodStart = 1 + index * 4;
          const periodEnd = periodStart + 3;
          const periodKey = `${periodStart}-${periodEnd}`;
          const isCurrent = periodStart === currentPeriod.start;
          const isFuture = periodStart > currentPeriod.start;
          const isPast = periodStart < currentPeriod.start;

          // Find historical loser if available
          const historicalLoser = data.forfeitHistory?.find(
            (fh) => fh.period.start === periodStart,
          )?.loser;

          return (
            <React.Fragment key={periodKey}>
              <Flex>
                <Text variant="body-default-m">
                  {periodKey}
                  {isCurrent && (
                    <Tag size="s" variant="accent" marginLeft="s">
                      Current
                    </Tag>
                  )}
                </Text>
              </Flex>

              <Text variant="body-default-m">{forfeit.description}</Text>

              <Flex>
                {isFuture ? (
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    TBD
                  </Text>
                ) : historicalLoser ? (
                  <Tag variant={isCurrent ? "warning" : "danger"} size="s">
                    {historicalLoser}
                  </Tag>
                ) : (
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {isPast ? "Completed" : "Unknown"}
                  </Text>
                )}
              </Flex>
            </React.Fragment>
          );
        })}
      </Grid>

      {/* Current Period Info */}
      {currentForfeit && (
        <Flex
          direction="column"
          gap="m"
          padding="l"
          background="surface"
          border="neutral-medium"
          radius="l"
        >
          <Flex gap="s">
            <Icon name="Calendar" size="m" onBackground="accent-strong" />
            <Heading variant="heading-strong-m">
              Current Period: Gameweeks {currentPeriod.start}-
              {currentPeriod.end}
            </Heading>
          </Flex>

          <Text variant="body-default-m">
            <strong>Forfeit:</strong> {currentForfeit.description}
          </Text>

          <Flex gap="s">
            <Icon name="AlertCircle" size="s" onBackground="warning-strong" />
            <Text variant="body-default-s" onBackground="warning-strong">
              {data.currentPeriodLeaderboard?.[
                data.currentPeriodLeaderboard.length - 1
              ]?.playerName || "TBD"}{" "}
              is currently in line for the forfeit
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
