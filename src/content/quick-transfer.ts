export const quickTransfer: Record<string, { challenge: string; answer: string }> = {
  'lesson-arrays-and-strings': {
    challenge:
      'Apply the nonempty-interval rule to [-8,-3,-9]. What is the maximum contiguous sum?',
    answer: '-3',
  },
  'lesson-hash-maps': {
    challenge:
      'A map contains x→2. getOrDefault("missing",9) is read without insertion. What is the map size afterward?',
    answer: '1',
  },
  'lesson-prefix-sums': {
    challenge: 'For [5,-2,6], what is the inclusive sum from index 1 to 2?',
    answer: '4',
  },
  'lesson-two-pointers': {
    challenge:
      'In sorted [2,3,8,10], the endpoint sum 12 exceeds target 11. Which endpoint moves: left or right?',
    answer: 'right',
  },
  'lesson-sliding-window': {
    challenge: 'What is the longest no-repeat substring length of "dvdf"?',
    answer: '3',
  },
  'lesson-stacks-and-queues': {
    challenge: 'For [60,60,65], how many days does the first day wait for a strictly warmer day?',
    answer: '2',
  },
  'lesson-linked-lists': {
    challenge:
      'An acyclic chain has three nodes. How many next-link hops from its head reach null?',
    answer: '3',
  },
  'lesson-trees-and-bsts': {
    challenge: 'A chain-shaped tree has four nodes. What is its maximum depth in nodes?',
    answer: '4',
  },
  'lesson-heaps': {
    challenge: 'Counting duplicates, what is the second largest value in [5,5,2]?',
    answer: '5',
  },
  'lesson-graph-bfs-and-dfs': {
    challenge:
      'An unweighted graph has edges 0→1, 1→2, and 0→2. What is the shortest edge-count distance from 0 to 2?',
    answer: '1',
  },
  'lesson-dijkstra': {
    challenge:
      'Edges 0→1 cost 4, 0→2 cost 9, and 1→2 cost 2. What is the shortest distance from 0 to 2?',
    answer: '6',
  },
  'lesson-topological-sort': {
    challenge:
      'Edges 0→2 and 1→2 are the only dependencies. Is [1,0,2] a valid order? Answer yes/no.',
    answer: 'yes',
  },
  'lesson-union-find': {
    challenge: 'Five vertices receive edges (0,1),(1,2),(3,4),(0,2). How many components remain?',
    answer: '2',
  },
  'lesson-tries': {
    challenge: 'How many of ["app","apple","ape","bat"] begin with "app"?',
    answer: '2',
  },
  'lesson-recursion-and-backtracking': {
    challenge: 'How many subsets does a distinct four-element set have?',
    answer: '16',
  },
  'lesson-dynamic-programming-1d': {
    challenge: 'How many ways climb 4 steps with moves of 1 or 2?',
    answer: '5',
  },
  'lesson-dynamic-programming-2d': {
    challenge: 'What is the longest common subsequence length of "axby" and "ab"?',
    answer: '2',
  },
  'lesson-dynamic-programming-knapsack': {
    challenge: 'One item has weight 3 and value 7. With capacity 6, what is the zero-one optimum?',
    answer: '7',
  },
  'lesson-dynamic-programming-lis': {
    challenge: 'What is the strictly increasing subsequence length of [3,1,2,2,4]?',
    answer: '3',
  },
  'lesson-dynamic-programming-interval': {
    challenge:
      'Two matrices have dimensions 2×3 and 3×4. How many scalar multiplications combine them?',
    answer: '24',
  },
  'lesson-dynamic-programming-bitmask': {
    challenge: 'How many different subsets can six bits represent?',
    answer: '64',
  },
  'lesson-greedy': {
    challenge: 'With reusable coins [1,3,4], what is the fewest coin count for amount 8?',
    answer: '2',
  },
  'lesson-binary-search-patterns': {
    challenge: 'What is the first index with value >=3 in [1,2,2,4]?',
    answer: '3',
  },
  'lesson-intervals': {
    challenge: 'Do half-open intervals [1,2) and [2,4) overlap? Answer yes/no.',
    answer: 'no',
  },
  'lesson-bit-manipulation': { challenge: 'How many set bits are in binary 100100?', answer: '2' },
  'lesson-math': { challenge: 'What is gcd(48,18)?', answer: '6' },
  'lesson-classification-metrics': {
    challenge: 'With TP=2, FP=3, and FN=1, what is precision?',
    answer: '0.4',
  },
  'lesson-embeddings-and-vector-search': {
    challenge: 'What is cosine similarity between nonzero vectors [1,1] and [2,2]?',
    answer: '1',
  },
  'lesson-retrieval-evaluation': {
    challenge: 'If the first relevant result is at rank 5, what is reciprocal rank?',
    answer: '0.2',
  },
  'lesson-rate-limiters': {
    challenge:
      'A full capacity-4 token bucket receives six immediate one-token requests with no refill. How many can it admit?',
    answer: '4',
  },
};
