export interface LeetCodeProblem {
  titleSlug: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD'
  questionFrontendId: string
}

export interface FavoriteList {
  idHash: string
}
