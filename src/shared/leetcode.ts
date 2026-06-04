import type { FavoriteList, LeetCodeProblem } from './types'

const LEETCODE_URL = 'https://leetcode.com'
const GRAPHQL_URL = `${LEETCODE_URL}/graphql`

async function getLeetCodeCookies(): Promise<{ csrftoken: string; session: string }> {
  const csrftoken = await chrome.cookies.get({
    url: LEETCODE_URL,
    name: 'csrftoken',
  })
  const session = await chrome.cookies.get({
    url: LEETCODE_URL,
    name: 'LEETCODE_SESSION',
  })
  if (!csrftoken || !session) {
    throw new Error('Not logged in to LeetCode')
  }
  return { csrftoken: csrftoken.value, session: session.value }
}

async function fetchGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { csrftoken } = await getLeetCodeCookies()
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrftoken': csrftoken,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`)
  }
  const data = await response.json()
  if (data.errors) {
    throw new Error(data.errors[0]?.message ?? 'GraphQL error')
  }
  return data.data
}

const CREATED_FAVORITE_LIST_QUERY = `
  query myCreatedFavoriteList {
    myCreatedFavoriteList {
      favorites {
        slug
        name
      }
    }
  }
`

const COLLECTED_FAVORITE_LIST_QUERY = `
  query myCollectedFavoriteList {
    myCollectedFavoriteList {
      favorites {
        slug
        name
      }
    }
  }
`

const FAVORITE_QUESTIONS_QUERY = `
  query favoriteQuestionList($favoriteSlug: String!) {
    favoriteQuestionList(favoriteSlug: $favoriteSlug, limit: 10000) {
      questions {
        titleSlug
        title
        difficulty
        questionFrontendId
      }
    }
  }
`

const FAVORITE_COUNT_QUERY = `
  query favoriteQuestionList($favoriteSlug: String!) {
    favoriteQuestionList(favoriteSlug: $favoriteSlug, limit: 0) {
      totalLength
    }
  }
`

interface CreatedFavoritesResponse {
  myCreatedFavoriteList: {
    favorites: FavoriteList[]
  }
}

interface CollectedFavoritesResponse {
  myCollectedFavoriteList: {
    favorites: FavoriteList[]
  }
}

interface FavoriteQuestionsResponse {
  favoriteQuestionList: {
    questions: LeetCodeProblem[]
  }
}

interface FavoriteCountResponse {
  favoriteQuestionList: {
    totalLength: number
  }
}

export async function fetchCreatedLists(): Promise<FavoriteList[]> {
  const data = await fetchGraphQL<CreatedFavoritesResponse>(CREATED_FAVORITE_LIST_QUERY)
  return data.myCreatedFavoriteList.favorites ?? []
}

export async function fetchCollectedLists(): Promise<FavoriteList[]> {
  const data = await fetchGraphQL<CollectedFavoritesResponse>(COLLECTED_FAVORITE_LIST_QUERY)
  return data.myCollectedFavoriteList.favorites ?? []
}

export async function fetchFavoriteProblems(favoriteSlug: string): Promise<LeetCodeProblem[]> {
  const data = await fetchGraphQL<FavoriteQuestionsResponse>(FAVORITE_QUESTIONS_QUERY, {
    favoriteSlug,
  })
  return data.favoriteQuestionList.questions
}

export async function fetchFavoriteCount(favoriteSlug: string): Promise<number> {
  const data = await fetchGraphQL<FavoriteCountResponse>(FAVORITE_COUNT_QUERY, {
    favoriteSlug,
  })
  return data.favoriteQuestionList.totalLength
}
