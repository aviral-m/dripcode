interface DrawButtonProps {
  disabled: boolean
  loading: boolean
  onClick: () => void
}

function DrawButton({ disabled, loading, onClick }: DrawButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-lg bg-lc-orange py-3 text-black font-semibold text-lg
                 hover:bg-lc-orange-hover disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400
                 transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? 'Drawing...' : 'Draw'}
    </button>
  )
}

export default DrawButton
