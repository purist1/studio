import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-8 w-8 text-primary", className)}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 2.5a47.5 47.5 0 1 0 0 95 47.5 47.5 0 0 0 0-95zm0 85a37.5 37.5 0 1 1 0-75 37.5 37.5 0 0 1 0 75z"
      />
      <path
        d="M50 32.5c-9.66 0-17.5 7.84-17.5 17.5S40.34 67.5 50 67.5s17.5-7.84 17.5-17.5S59.66 32.5 50 32.5zm0 25a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
      />
    </svg>
  );
}
