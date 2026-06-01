import type { LeetCodeProblem } from "../../shared/types";

type Difficulty = "Easy" | "Medium" | "Hard";

function normalizeDifficulty(d: LeetCodeProblem["difficulty"]): Difficulty {
  return (d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()) as Difficulty;
}

const difficultyColors: Record<Difficulty, string> = {
  Easy: "text-lc-easy bg-lc-easy/10",
  Medium:
    "text-lc-medium bg-lc-medium/10",
  Hard: "text-lc-hard bg-lc-hard/10",
};

interface ProblemCardProps {
  problem: LeetCodeProblem;
}

function ProblemCard({ problem }: ProblemCardProps) {
  const url = `https://leetcode.com/problems/${problem.titleSlug}/`;
  const normalizedDifficulty = normalizeDifficulty(problem.difficulty);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--surface)] transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm text-[var(--muted)] shrink-0">
          {problem.questionFrontendId}.
        </span>
        <span className="text-sm font-medium truncate">{problem.title}</span>
      </div>
      <span
        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${difficultyColors[normalizedDifficulty]}`}
      >
        {normalizedDifficulty}
      </span>
    </a>
  );
}

export default ProblemCard;
