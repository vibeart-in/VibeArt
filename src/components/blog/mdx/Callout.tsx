import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { ReactNode } from "react";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: ReactNode;
}

const calloutStyles = {
  info: {
    container: "border-blue-500/50 bg-blue-500/10",
    icon: "text-blue-500",
    title: "text-blue-500",
    Icon: Info,
  },
  warning: {
    container: "border-yellow-500/50 bg-yellow-500/10",
    icon: "text-yellow-500",
    title: "text-yellow-500",
    Icon: AlertCircle,
  },
  success: {
    container: "border-green-500/50 bg-green-500/10",
    icon: "text-green-500",
    title: "text-green-500",
    Icon: CheckCircle,
  },
  error: {
    container: "border-red-500/50 bg-red-500/10",
    icon: "text-red-500",
    title: "text-red-500",
    Icon: XCircle,
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = calloutStyles[type];
  const Icon = styles.Icon;

  return (
    <aside
      className={`my-6 flex gap-3 rounded-lg border p-4 ${styles.container}`}
      role="note"
      aria-label={title || `${type} callout`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${styles.icon}`} aria-hidden="true">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        {title && <div className={`mb-1 font-semibold ${styles.title}`}>{title}</div>}
        <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
      </div>
    </aside>
  );
}
