export const useFplData = () => {
  const data = useState("fplData", () => null);
  const loading = useState("fplLoading", () => false);
  const error = useState("fplError", () => null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = await $fetch("/api/forfeit-tracker");
      data.value = result;
    } catch (err) {
      error.value = err.data || err.message || "Failed to fetch data";
    } finally {
      loading.value = false;
    }
  };

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    fetchData,
  };
};
