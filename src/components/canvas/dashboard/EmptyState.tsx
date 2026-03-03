interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-neutral-900/20 py-24 text-center">
      {icon}
      <h3 className="text-xl font-semibold text-neutral-300">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-500">{subtitle}</p>
    </div>
  );
}
