import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const met = RULES.map((rule) => rule.test(password));

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
      {RULES.map((rule, i) => (
        <li
          key={rule.label}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            met[i] ? "text-primary" : "text-muted-foreground"
          )}
        >
          {met[i] ? (
            <Check size={12} strokeWidth={2.5} />
          ) : (
            <Circle size={12} strokeWidth={2.5} />
          )}
          {rule.label}
        </li>
      ))}
    </ul>
  );
}