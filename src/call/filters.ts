import type { Endpoint } from "../scan/types";

/**
 * Filters endpoints by a case-insensitive substring over method, path, or operation.
 */
export const filterEndpoints = (endpoints: Endpoint[], query: string): Endpoint[] => {
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? endpoints.filter((endpoint) => {
        const haystack = [
          endpoint.method,
          endpoint.path,
          endpoint.operation ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
    : endpoints;

  return [...filtered].sort((a, b) => {
    if (a.path === b.path) {
      return a.method.localeCompare(b.method);
    }
    return a.path.localeCompare(b.path);
  });
};
