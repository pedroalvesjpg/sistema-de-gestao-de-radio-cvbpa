"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ComboboxProps<T> = {
  items: T[];
  value: number | null;
  onChange: (id: number) => void;
  getKey: (item: T) => number;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderSelected?: (item: T) => ReactNode;
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  id?: string;
};

export function Combobox<T>({
  items,
  value,
  onChange,
  getKey,
  getSearchText,
  renderItem,
  renderSelected,
  placeholder,
  searchPlaceholder = "Buscar…",
  emptyLabel = "Nada encontrado.",
  disabled,
  id,
}: ComboboxProps<T>) {
  const reactId = useId();
  const triggerId = id ?? reactId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => items.find((i) => getKey(i) === value) ?? null,
    [items, value, getKey],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => getSearchText(i).toLowerCase().includes(q));
  }, [items, query, getSearchText]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className="truncate text-left">
          {selected ? (
            (renderSelected ?? renderItem)(selected)
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown
          className="ml-2 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <div className="relative border-b border-border p-2">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9"
            />
          </div>
          <ul
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {emptyLabel}
              </li>
            ) : (
              filtered.map((item) => {
                const key = getKey(item);
                const active = key === value;
                return (
                  <li key={key} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(key);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        active && "bg-accent/60",
                      )}
                    >
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          active ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {renderItem(item)}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
