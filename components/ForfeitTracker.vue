<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ data?.leagueName || "FPL Forfeit Tracker" }}
          </h1>
          <p class="mt-2 text-gray-600">
            Current Gameweek: {{ data?.currentGameweek || "-" }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg
              class="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p class="text-gray-600">Loading FPL data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200 p-6">
        <div class="flex items-center">
          <svg
            class="w-6 h-6 text-red-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">
              Error loading data
            </h3>
            <p class="text-red-600 mt-1">{{ error }}</p>
            <button
              @click="fetchData"
              class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Data Display -->
      <div v-else-if="data" class="space-y-8">
        <!-- Period Selector -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Select Period
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="period in data.completedPeriods"
              :key="period"
              @click="selectedPeriod = period"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all',
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              Weeks {{ period - 3 }}-{{ period }}
            </button>
          </div>
        </div>

        <!-- Forfeit Winner -->
        <div
          v-if="currentForfeitWinner"
          class="card bg-gradient-to-r from-red-50 to-pink-50 border-red-200 p-6"
        >
          <div class="text-center">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
            >
              <span class="text-2xl">💸</span>
            </div>
            <h3 class="text-xl font-bold text-red-800 mb-2">
              Forfeit Winner: {{ currentForfeitWinner.name }}
            </h3>
            <p class="text-red-600">
              Lowest in Weeks {{ selectedPeriod - 3 }}-{{ selectedPeriod }} with
              {{ currentForfeitWinner.points }} points
            </p>
            <p class="text-sm text-red-700 mt-2">
              {{ getForfeitMessage(selectedPeriod) }}
            </p>
          </div>
        </div>

        <!-- Period Leaderboard -->
        <div class="card">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">
              Weeks {{ selectedPeriod - 3 }}-{{ selectedPeriod }} Leaderboard
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Manager
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Period Points
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Points
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(manager, index) in periodLeaderboard"
                  :key="manager.id"
                  :class="[
                    'hover:bg-gray-50 transition-colors',
                    currentForfeitWinner?.id === manager.id ? 'bg-red-50' : '',
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span v-if="index === 0" class="text-2xl">🥇</span>
                    <span v-else-if="index === 1" class="text-2xl">🥈</span>
                    <span v-else-if="index === 2" class="text-2xl">🥉</span>
                    <span v-else class="text-gray-600">{{ index + 1 }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <div class="font-medium text-gray-900">
                        {{ manager.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ manager.teamName }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right font-mono text-gray-900">
                    {{ manager.periodPoints }}
                    <span
                      v-if="currentForfeitWinner?.id === manager.id"
                      class="ml-1"
                      >💸</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right font-mono text-gray-600">
                    {{ manager.currentTotal }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Current Overall Standings -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Current Overall Standings
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="manager in topManagers"
              :key="manager.id"
              class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <span class="font-medium text-gray-900">
                {{ manager.currentRank }}. {{ manager.name }}
              </span>
              <span class="font-mono text-gray-600"
                >{{ manager.currentTotal }} pts</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data, loading, error, fetchData } = useFplData();

const selectedPeriod = ref(null);

// Forfeit messages for each period
const forfeitMessages = {
  4: "Buy the first round! 🍺",
  8: "Pizza for everyone! 🍕",
  12: "Wear the shame jersey! 👕",
  16: "Do the forfeit dance! 🕺",
  20: "Sing karaoke! 🎤",
  24: "Cook dinner for the group! 🍳",
  28: "Clean everyone's cars! 🚗",
  32: "Organize the next draft! 📋",
  36: "Trophy engraving costs! 🏆",
};

// Initialize data on mount
onMounted(async () => {
  await fetchData();
  if (data.value?.completedPeriods?.length > 0) {
    selectedPeriod.value =
      data.value.completedPeriods[data.value.completedPeriods.length - 1];
  }
});

// Watch for data changes
watch(
  () => data.value,
  (newData) => {
    if (newData?.completedPeriods?.length > 0 && !selectedPeriod.value) {
      selectedPeriod.value =
        newData.completedPeriods[newData.completedPeriods.length - 1];
    }
  }
);

// Computed properties
const currentForfeitWinner = computed(() => {
  if (!data.value || !selectedPeriod.value) return null;
  return data.value.forfeitWinners[`period_${selectedPeriod.value}`];
});

const periodLeaderboard = computed(() => {
  if (!data.value || !selectedPeriod.value) return [];

  const periodKey = `period_${selectedPeriod.value}`;
  return data.value.managers
    .filter((m) => m.periodPerformance[periodKey])
    .map((manager) => ({
      ...manager,
      periodPoints: manager.periodPerformance[periodKey].points,
    }))
    .sort((a, b) => b.periodPoints - a.periodPoints);
});

const topManagers = computed(() => {
  if (!data.value) return [];
  return [...data.value.managers]
    .sort((a, b) => a.currentRank - b.currentRank)
    .slice(0, 6);
});

// Methods
const getForfeitMessage = (period) => {
  return forfeitMessages[period] || "Forfeit time! 💸";
};
</script>
