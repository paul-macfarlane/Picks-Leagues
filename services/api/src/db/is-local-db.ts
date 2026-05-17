// WHY: drives the client/migrate driver split. Local Docker Postgres 17 uses
// the node-postgres driver; everything else (Neon dev/preview/prod) uses the
// Neon WebSocket pooled driver. Keyed on the connection host so a developer
// only ever changes DATABASE_URL — never code — to switch targets.
const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "postgres", // docker-compose service name (in-network connections)
]);

export function isLocalDatabaseUrl(connectionString: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(connectionString).hostname);
  } catch {
    // Unparseable connection string: fail safe toward the production (Neon)
    // driver rather than silently using the local one.
    return false;
  }
}
