import { createFileRoute } from "@tanstack/react-router";

function IndexComponent() {
  return (
    <main>
      <h1>Hello Picks Leagues</h1>
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: IndexComponent,
});
