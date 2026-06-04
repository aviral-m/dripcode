export interface LeetCodeProblem {
  titleSlug: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD'
  questionFrontendId: string
}

export interface FavoriteList {
  slug: string
  name: string
}

export interface ActiveList {
  slug: string
  name: string
  type: 'created' | 'collected'
}
