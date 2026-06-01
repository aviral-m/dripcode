interface SettingsProps {
  batchSize: number
  onBatchSizeChange: (size: number) => void
}

function Settings({ batchSize, onBatchSizeChange }: SettingsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onBatchSizeChange(Math.max(1, batchSize - 1))}
        disabled={batchSize <= 1}
        className="flex h-8 w-8 items-center justify-center leading-none rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-lg hover:bg-lc-orange hover:text-black hover:border-lc-orange disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--foreground)] disabled:hover:border-[var(--border)] transition-colors cursor-pointer"
      >
        -
      </button>
      <span className="w-8 text-center text-sm font-medium text-[var(--foreground)]">
        {batchSize}
      </span>
      <button
        onClick={() => onBatchSizeChange(Math.min(10, batchSize + 1))}
        disabled={batchSize >= 10}
        className="flex h-8 w-8 items-center justify-center leading-none rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-lg hover:bg-lc-orange hover:text-black hover:border-lc-orange disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--foreground)] disabled:hover:border-[var(--border)] transition-colors cursor-pointer"
      >
        +
      </button>
    </div>
  )
}

export default Settings
