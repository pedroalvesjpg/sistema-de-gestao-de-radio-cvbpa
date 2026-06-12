"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Input>;

export function PasswordInput({ className, ...props }: Props) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={shown ? "text" : "password"}
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        tabIndex={-1}
        aria-label={shown ? "Esconder senha" : "Mostrar senha"}
        className="absolute right-2 top-1/2 grid -translate-y-1/2 place-items-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
