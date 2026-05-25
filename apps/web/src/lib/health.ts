import { queryOptions } from "@tanstack/react-query";

import { apiClient } from "./api";

export const healthQueryOptions = queryOptions({
  queryKey: ["health"],
  queryFn: async () => {
    const { data, error } = await apiClient.GET("/api/health");
    if (error) {
      throw new Error("Health check failed");
    }
    return data;
  },
});
