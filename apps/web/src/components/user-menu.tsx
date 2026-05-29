import { Link } from "@tanstack/react-router";
import { ChevronDown, Loader2, User } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/session";
import { useSignOut } from "@/lib/session";

interface UserMenuProps {
  user: SessionUser;
}

export function UserMenu({ user }: UserMenuProps): React.JSX.Element {
  const { signOut, isPending } = useSignOut();
  const displayName = user.name || user.email;
  const firstName = displayName.split(" ")[0] ?? displayName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className="min-h-[44px] gap-1"
          aria-label={`User menu for ${displayName}`}
        >
          <User className="size-4 shrink-0" aria-hidden="true" />
          <span className="max-w-[120px] truncate text-sm font-medium">
            {firstName}
          </span>
          <ChevronDown
            className="size-3 shrink-0 opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="font-semibold">{user.name || user.email}</span>
          {user.name && (
            <span className="text-muted-foreground text-xs">{user.email}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void signOut()}
          disabled={isPending}
          className="text-error focus:text-error"
        >
          {isPending ? (
            <>
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
              Signing out…
            </>
          ) : (
            "Sign out"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
