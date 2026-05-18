import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "./theme-provider";

const STORAGE_KEY = "picksleagues-ui-theme";

function ThemeConsumer(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("system")}>Set System</button>
    </div>
  );
}

function renderWithProvider(defaultTheme?: "system" | "light" | "dark"): void {
  render(
    <ThemeProvider defaultTheme={defaultTheme}>
      <ThemeConsumer />
    </ThemeProvider>,
  );
}

let mockDarkScheme = false;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  mockDarkScheme = false;

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches:
        query === "(prefers-color-scheme: dark)" ? mockDarkScheme : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

describe("ThemeProvider", () => {
  describe("default theme", () => {
    it("defaults to system when nothing in localStorage", () => {
      renderWithProvider();
      expect(screen.getByTestId("theme").textContent).toBe("system");
    });

    it("reads an existing persisted value from localStorage on mount", () => {
      localStorage.setItem(STORAGE_KEY, "dark");
      renderWithProvider();
      expect(screen.getByTestId("theme").textContent).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("setTheme", () => {
    it("setTheme('dark') adds the dark class to documentElement and persists", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByText("Set Dark"));

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
      expect(screen.getByTestId("theme").textContent).toBe("dark");
    });

    it("setTheme('light') removes the dark class from documentElement", async () => {
      const user = userEvent.setup();
      localStorage.setItem(STORAGE_KEY, "dark");
      renderWithProvider();

      await user.click(screen.getByText("Set Light"));

      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
      expect(screen.getByTestId("theme").textContent).toBe("light");
    });
  });

  describe("system theme resolution", () => {
    it("setTheme('system') resolves dark when prefers-color-scheme is dark", async () => {
      mockDarkScheme = true;
      const user = userEvent.setup();
      renderWithProvider("light");

      await user.click(screen.getByText("Set System"));

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(screen.getByTestId("theme").textContent).toBe("system");
    });

    it("setTheme('system') resolves light when prefers-color-scheme is light", async () => {
      mockDarkScheme = false;
      const user = userEvent.setup();
      renderWithProvider("dark");

      await user.click(screen.getByText("Set System"));

      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(screen.getByTestId("theme").textContent).toBe("system");
    });
  });
});
