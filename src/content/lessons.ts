import { career, coach, slug, type Lesson, type TrackId } from './schema';
import { quickTransfer } from './quick-transfer';

interface Seed {
  track: TrackId;
  topic: string;
  explanation: string;
  example: string;
  mistake: string;
  rule: string;
  scenario: string;
  answer: string;
  diagram: string[];
}
const seeds: Seed[] = [];
function add(
  track: TrackId,
  topic: string,
  explanation: string,
  example: string,
  mistake: string,
  rule: string,
  scenario: string,
  answer: string,
  diagram: string[],
) {
  seeds.push({ track, topic, explanation, example, mistake, rule, scenario, answer, diagram });
}
add(
  'dsa',
  'Arrays and strings',
  'Contiguous storage makes indexed access constant-time, but inserting near the beginning shifts later elements. Separate the cost of finding a position from modifying the sequence. Strings may be immutable: repeatedly appending to a string can allocate and copy the entire prefix. Java char and JavaScript string indices refer to UTF-16 code units, not necessarily user-perceived characters.',
  'For [4,-1,2], the best nonempty interval ending at the second position is [4,-1] with sum 3. At the third position, extending it gives 5 versus starting fresh with 2. Retaining only that ending-state and the global best avoids enumerating every interval.',
  'Initializing a maximum-subarray answer to zero incorrectly permits an empty answer when all values are negative. Returning a view versus a copy also changes mutation behavior.',
  'Define the unit of indexing, mutation contract, and whether empty selections are legal before choosing a loop.',
  'For [-5,-2,-7], what is the maximum nonempty contiguous sum?',
  '-2',
  ['Input sequence', 'State at index i', 'State at i+1', 'Global result'],
);
add(
  'dsa',
  'Hash maps',
  'A hash map indexes keys by a hash and resolves collisions using an implementation-specific strategy. Expected constant-time lookup is not a worst-case guarantee. Key equality must agree with hashing: equal keys require equal hashes. Java mutable object keys become dangerous when fields used by equals/hashCode change after insertion.',
  'To count [a,b,a], process a→1, b→1, then a→2. For a target-pair search, ask whether the complement appeared earlier before recording the current position. This ordering prevents one element from matching itself.',
  'Using a map for an ordered result requires knowing whether insertion order is preserved. Java HashMap does not promise it; LinkedHashMap does.',
  'Write the meaning of one map entry and the moment it becomes valid. Test collisions semantically through equal keys and duplicate values.',
  'A map begins empty. Reading getOrDefault("x",3) without inserting leaves its size at what value?',
  '0',
  ['Key', 'Hash / bucket', 'Equality check', 'Stored value'],
);
add(
  'dsa',
  'Prefix sums',
  'A prefix array stores cumulative totals at boundaries rather than at elements. Define P[0]=0 and P[i+1]=P[i]+a[i]. Then the inclusive range [l,r] has sum P[r+1]-P[l]. This turns repeated range queries into constant-time reads after linear preprocessing, but updating one element invalidates all later prefixes.',
  'For [2,-1,4], P=[0,2,1,5]. The range [1,2] sums to P[3]-P[1]=3. To count target-sum intervals, retain frequencies of earlier prefixes: an earlier prefix equal to current-target identifies a valid interval.',
  'Inserting the current prefix before querying frequencies counts a zero-length interval for target zero. Negative values also invalidate the usual positive-sum shrinking-window shortcut.',
  'Treat prefixes as boundaries. Query before inserting the current boundary when counting nonempty intervals.',
  'For [2,-1,4], what is the inclusive sum from index 1 to 2?',
  '3',
  ['P[0]=0', 'Read value', 'P[i+1]=P[i]+value', 'Subtract boundaries'],
);
add(
  'dsa',
  'Two pointers',
  'Two boundaries can eliminate candidates efficiently when a monotonic relationship proves discarded candidates cannot be answers. On a sorted array, if the smallest-plus-largest sum is too small, keeping the smallest while reducing the largest cannot help. This proof, not the existence of two variables, is the pattern.',
  'In [1,2,4,7] seeking 9, endpoints sum to 8, so discard 1. Now 2+7=9. A palindrome check uses symmetric boundaries for a different invariant: all already-compared outer pairs match.',
  'Moving both boundaries after an inequality can skip a valid answer. Duplicate handling depends on whether the result is indices, value pairs, or unique triples.',
  'For each boundary move, explain why every candidate you discard is impossible or already represented.',
  'In sorted [1,2,4,7], 1+7 is below 9. Which endpoint must move: left or right?',
  'left',
  ['Sorted candidates', 'Compare boundary pair', 'Discard impossible side', 'Repeat'],
);
add(
  'dsa',
  'Sliding window',
  'A window maintains an aggregate over one contiguous interval while each boundary moves only forward. This yields linear work if adding/removing one item is constant-time. Validity must be maintainable: a positive-sum threshold is monotone under expansion, while arbitrary negative values can destroy that reasoning.',
  'For unique characters in abba, the second b forces the left boundary beyond the first b. On the final a, an old occurrence lies outside the window; moving left backward would incorrectly produce length 3. Use max(currentLeft,lastIndex+1).',
  'Confusing at-most and exactly constraints causes off-by-one errors. For multiplicities, a set alone loses counts needed when the leftmost duplicate exits.',
  'State what makes the current interval valid and which boundary movement restores validity after each extension.',
  'What is the longest no-repeat substring length in abba?',
  '2',
  ['Extend right', 'Update counts', 'Restore invariant', 'Measure window'],
);
add(
  'dsa',
  'Stacks and queues',
  'A stack resolves the most recent unfinished work; a queue processes the earliest discovered work. Both are abstractions, not a mandate to use a specific class. Array shift in JavaScript may move all remaining elements; a head index avoids repeated copying. A monotonic stack retains unresolved candidates in value order.',
  'For temperatures [70,72,71], index 0 waits until index 1 arrives, then is resolved with distance 1. Indices 1 and 2 remain unresolved. Every index is pushed once and popped at most once, so the nested while loop is amortized linear.',
  'Equal values are not strictly greater. For bracket nesting, matching counts is insufficient: ([)] has balanced counts but invalid order.',
  'Count total pushes and pops across the whole run instead of multiplying loop bounds mechanically.',
  'For [70,72,71], how many days does the first day wait for a warmer day?',
  '1',
  ['Pending work', 'Push candidate', 'Resolve recent candidate', 'Pop once'],
);
add(
  'dsa',
  'Linked lists',
  'A node links to another node rather than occupying a contiguous logical position. Inserting after a known node can be constant-time, but finding that node remains linear. Ownership and aliasing matter: reversing links mutates every shared view of the chain unless you copy nodes.',
  'To reverse A→B→C, preserve next=B before setting A.next=null; then advance to B. A cycle detector moves one pointer by one and another by two. If they meet, resetting one to the head and moving equally locates the cycle entry.',
  'Overwriting next before saving it loses the rest of the chain. Testing only fast!=null is insufficient when the next dereference also uses fast.next.',
  'Draw pointer states before and after each assignment, including the null boundary and any shared references.',
  'In a one-node acyclic list, how many next-link hops reach null?',
  '1',
  ['Save next', 'Reverse current link', 'Advance previous', 'Advance current'],
);
add(
  'dsa',
  'Trees and BSTs',
  'Tree recursion summarizes subtrees. Choose exactly what each recursive call returns: height, validity, best path, or a combination. A BST adds an ordering invariant, not a balance guarantee. An ascending insertion sequence can produce a chain and turn logarithmic expectations into linear depth.',
  'For root 2 with children 1 and 3, inorder traversal emits [1,2,3]. Height in nodes is 2, while the diameter in edges is 2. A balance check can return -1 for an invalid subtree to avoid recalculating heights at every ancestor.',
  'Checking a BST only against immediate children misses an out-of-range grandchild. Propagate bounds from all ancestors and decide whether duplicates are allowed.',
  'Write the subtree contract and choose node-count versus edge-count units explicitly.',
  'A root with two leaf children has maximum depth in nodes equal to what?',
  '2',
  ['Left summary', 'Current node', 'Right summary', 'Combined summary'],
);
add(
  'dsa',
  'Heaps',
  'A binary heap maintains an extremum at the root with a partial order, not a fully sorted array. Push and root removal cost logarithmic time; peeking costs constant time. A size-k min-heap is useful when retaining the k largest values: its smallest retained item is the current cutoff.',
  'Streaming [3,1,5,2] with k=2 retains [3], then [1,3], then discards 1 after adding 5, then discards 2. The root is 3, the second largest value. For merging sorted streams, heap entries also need stream identity and position.',
  'Iterating a heap does not produce sorted order. Negating values to emulate a max-heap requires care with fixed-width minimum integers and tie-breaking metadata.',
  'Define whether the heap root is the next answer or merely the boundary of retained candidates.',
  'What is the second largest value in [3,1,5,2]?',
  '3',
  ['Incoming value', 'Bounded min-heap', 'Discard smallest if oversized', 'Root is cutoff'],
);
add(
  'dsa',
  'Graph BFS and DFS',
  'Graph traversal needs an explicit visited policy because cycles and converging edges can revisit vertices. BFS discovers shortest edge-count paths in unweighted graphs by layers. DFS is useful for reachability, cycle states, and finishing order, but its first found route need not be shortest.',
  'With edges 0→1, 0→2, 1→3, 2→3, BFS sets distances [0,1,1,2]. Mark 3 when it is enqueued so the second parent does not enqueue it again. Disconnected graph properties require starting another traversal at every unvisited component.',
  'An adjacency matrix uses O(V²) space even for sparse graphs. Recursive DFS can overflow the call stack on a long chain; use an explicit stack for untrusted depth.',
  'Choose mark-on-discovery and record exactly which invariant permits skipping an already visited vertex.',
  'In the example, what is the shortest edge-count distance from 0 to 3?',
  '2',
  ['Source distance 0', 'Frontier distance d', 'Unseen neighbors d+1', 'Next frontier'],
);
add(
  'dsa',
  'Dijkstra',
  'For nonnegative weighted edges, finalize the unsettled vertex with smallest tentative distance. No route through a farther unsettled vertex can improve it, because adding nonnegative weight cannot reduce distance. A binary heap supports sparse graphs; a simple array scan is reasonable for small dense graphs.',
  'Edges 0→1 cost 2, 0→2 cost 7, and 1→2 cost 1 yield distances [0,2,3]. A heap may still contain a stale entry (7,2); skip it because the current best is already 3.',
  'Negative edges invalidate the finalization proof. Marking a vertex visited when first inserted also incorrectly prevents later improvements.',
  'Tentative discovery and final settlement are different events. Guard stale priority-queue entries.',
  'Using the example edges, what is the distance from 0 to 2?',
  '3',
  [
    'Tentative distances',
    'Least unsettled distance',
    'Relax outgoing edges',
    'Ignore stale entries',
  ],
);
add(
  'dsa',
  'Topological sort',
  'A directed acyclic graph admits an ordering in which every edge points forward. Kahn’s algorithm repeatedly removes zero-indegree vertices; DFS can instead reverse finishing order while detecting gray-state back edges. Neither method creates a valid order for a cyclic graph.',
  'With 0→2 and 1→2, both 0 and 1 are initially ready. A priority queue gives the lexicographically smallest order [0,1,2]. If only a plain FIFO queue is used, a valid but different order may result.',
  'Returning a partial list without checking its length conceals a cycle. A directed graph may have a cycle in a disconnected component.',
  'Only schedule tasks whose prerequisites are all satisfied, and verify every task was scheduled.',
  'Can the directed cycle 0→1→0 have a topological order? Answer yes/no.',
  'no',
  ['Compute indegrees', 'Choose ready vertex', 'Remove outgoing dependencies', 'Verify count'],
);
add(
  'dsa',
  'Union-find',
  'Disjoint-set union answers whether items belong to the same evolving undirected component. Path compression shortens future searches; union by rank or size prevents tall trees. Together they yield near-constant amortized operations, expressed with inverse Ackermann α(n). It does not directly support deleting arbitrary edges.',
  'Start with four components. Union(0,1) reduces the count to three; union(1,2) reduces it to two. Union(0,2) changes nothing because both already share a representative.',
  'Decrementing the count for every edge undercounts when edges are redundant. Representative IDs are implementation details, not stable domain labels.',
  'Update component metadata only when two distinct representatives actually merge.',
  'With four vertices and edges (0,1),(1,2),(0,2), how many components remain?',
  '2',
  [
    'Find representative A',
    'Find representative B',
    'Merge only if different',
    'Compress future paths',
  ],
);
add(
  'dsa',
  'Tries',
  'A trie shares common prefixes among keys. Each edge consumes a symbol; a terminal marker distinguishes a complete word from a prefix. Prefix-count metadata can answer how many inserted words share a prefix without enumerating descendants. Complexity depends on total characters rather than number of whole strings alone.',
  'Insert car, cart, and cat. The node for ca has count 3; car has count 2 and a terminal marker. The empty prefix corresponds to the root and matches every inserted word.',
  'Using a normal object for arbitrary symbol keys can collide with inherited properties. Separate metadata from children and use Map or a prototype-free dictionary.',
  'Distinguish path existence, whole-word membership, and how many words pass through a node.',
  'How many of car, cart, cat begin with car?',
  '2',
  ['Root', 'Shared prefix ca', 'Branch r / t', 'Terminal markers'],
);
add(
  'dsa',
  'Recursion and backtracking',
  'Backtracking explores choices while maintaining a partial candidate. Choose, recurse, and undo is an ownership discipline: each sibling branch must see the same starting state. Pruning requires proof that an incomplete candidate cannot lead to a valid completion.',
  'For subsets of [1,2], advancing the candidate start index produces [],[1],[1,2],[2] once each. For a grid word search, mark cells only along the active path and unmark on return; another starting path may legitimately reuse them.',
  'Appending the same mutable path object to output stores aliases; copy it at a leaf. Reusable candidates with zero or negative values can prevent a sum search from terminating.',
  'State the decreasing measure that guarantees termination and restore every branch-local mutation.',
  'How many subsets does a distinct three-element set have?',
  '8',
  ['Choose', 'Update partial state', 'Explore smaller subproblem', 'Undo'],
);
add(
  'dsa',
  'Dynamic programming 1D',
  'Dynamic programming caches a well-defined subproblem so repeated dependencies are evaluated once. Write the state in a sentence, then derive transitions and base cases. Rolling memory is safe only when overwritten values will never be needed again.',
  'Ways to climb n using 1 or 2 steps satisfy ways(n)=ways(n-1)+ways(n-2). ways(0)=1 represents the empty construction. For nonadjacent rewards, the states are best with previous taken and best with previous skipped, updated simultaneously.',
  'Copying a recurrence without interpreting its base case often causes off-by-one errors. Memoization does not make an exponential number of distinct states polynomial.',
  'Count distinct states times transition work, and separately count the memory actually retained.',
  'How many ways climb 3 steps using steps of 1 or 2?',
  '3',
  ['State i-2', 'State i-1', 'Transition', 'State i'],
);
add(
  'dsa',
  'Dynamic programming 2D',
  'Two-dimensional states often describe two prefixes, two resources, or a grid position. Fill order must respect dependencies. A longest common subsequence state L[i][j] means the best common subsequence of the first i and first j characters, not necessarily contiguous.',
  'For abc and ac, a match extends the diagonal; a mismatch chooses max(top,left). The result is 2. Edit distance adds insertion, deletion, and replacement predecessors and initializes empty-prefix distances to their lengths.',
  'Substring and subsequence are different contracts. Reusing the current row where the previous diagonal was needed silently changes the recurrence.',
  'Draw dependency arrows before optimizing a table into rolling rows.',
  'What is the longest common subsequence length of abc and ac?',
  '2',
  ['Previous row', 'Previous diagonal', 'Current left cell', 'Current cell'],
);
add(
  'dsa',
  'Dynamic programming knapsack',
  'A zero-one knapsack state can mean best value using processed items within capacity c. Each item may be used once. With one row, iterate capacities backward so the current item reads only states from before that item. For unbounded knapsack, forward iteration deliberately allows reuse.',
  'One item of weight 2 and value 3 with capacity 4 yields 3 in zero-one knapsack. A forward loop updates dp[2]=3 then dp[4]=dp[2]+3=6, accidentally selecting it twice.',
  'A capacity-based O(nC) algorithm is pseudo-polynomial: numeric capacity may be exponentially large in its bit representation. Weight-zero items need an explicit policy.',
  'Derive loop direction from which version of the state a transition is allowed to read.',
  'For one weight-2 value-3 item and capacity 4, what is the zero-one optimum?',
  '3',
  ['Previous item states', 'Capacity scans backward', 'Take once or skip', 'Updated states'],
);
add(
  'dsa',
  'Dynamic programming LIS',
  'For strictly increasing subsequences, keep tails[len-1] as the smallest ending value achievable for that length. Replacing a tail with a smaller value preserves the length and improves future extension opportunities. Binary search finds the first tail >= the incoming value.',
  'Processing [3,1,2] gives tails [3], then [1], then [1,2], so the answer is 2. The tails array itself is not guaranteed to be an actual subsequence after arbitrary replacements; reconstruction needs predecessor metadata.',
  'Using upper_bound instead of lower_bound changes strict increase into nondecreasing behavior when values repeat.',
  'State whether equality extends a sequence before selecting the binary-search boundary.',
  'What is the strictly increasing subsequence length of [2,2,2]?',
  '1',
  ['Incoming value', 'First tail >= value', 'Replace or append', 'Length of tails'],
);
add(
  'dsa',
  'Dynamic programming interval',
  'Interval DP combines shorter contiguous ranges. A useful approach is to decide the final split or final action for [l,r], so both remaining subproblems are smaller intervals. Fill by increasing length rather than by arbitrary row order.',
  'Matrices 10×30, 30×5, 5×60 cost 10*30*5 + 10*5*60 = 4500 when the first two are multiplied first. The other parenthesization costs 27000. Matrix multiplication is associative in result but not in computational cost.',
  'The dimension array has one more entry than the matrix count. Confusing matrix endpoints with dimension endpoints corrupts the multiplication term.',
  'Define inclusive/exclusive interval endpoints and prove every dependency has smaller length.',
  'What is the optimal scalar multiplication cost for dimensions [10,30,5,60]?',
  '4500',
  ['Short intervals', 'Choose final split k', 'Combine left + right + merge', 'Longer interval'],
);
add(
  'dsa',
  'Dynamic programming bitmask',
  'When the set of already used items matters and n is small, encode membership with n bits. A state (mask,last) identifies both the visited subset and the final position. There are n*2^n such states; adding a transition to every unused item costs another factor n.',
  'For three cities, mask 101 means cities 0 and 2 were visited. Adding city 1 gives 111. A tour must also pay the final edge back to city 0; visiting all cities alone is only a path.',
  'JavaScript bitwise operators use 32-bit signed integers. This technique is intended for small n, and shifting beyond its supported width is invalid.',
  'Check feasibility with actual state counts before allocating an exponential table.',
  'How many subsets are represented by four bits?',
  '16',
  ['Visited mask', 'Final position', 'Add an unused bit', 'Full-set states'],
);
add(
  'dsa',
  'Greedy',
  'A greedy method makes an irreversible local choice. Correctness needs an exchange argument, a stays-ahead argument, or another invariant showing that choice can belong to an optimum. A convincing example is not proof.',
  'To select the maximum number of nonoverlapping intervals, choose the one ending earliest. Replacing an optimum’s first interval with the earlier-ending one cannot reduce room for later intervals. Choosing the shortest interval or earliest start lacks that guarantee.',
  'Coin change with denominations [1,3,4] and amount 6 defeats largest-first: 4+1+1 uses three coins while 3+3 uses two.',
  'Try to build a counterexample before trusting a local rule. If it survives, write why exchanging the choice cannot hurt.',
  'For coins [1,3,4] and amount 6, what is the fewest coin count?',
  '2',
  ['Candidate local choice', 'Exchange with optimum', 'No worse remainder', 'Repeat safely'],
);
add(
  'dsa',
  'Binary search patterns',
  'Binary search finds a boundary in a monotone predicate, not just a value in a sorted list. Half-open intervals make insertion positions natural: maintain [left,right), where all excluded left positions fail and all excluded right positions satisfy the predicate.',
  'For [1,2,2,4] and predicate value>=2, the first true index is 1. Searching an answer space also works: a capacity feasibility check may become monotone as capacity increases.',
  'Mixing inclusive updates with half-open termination can skip answers or loop forever. The midpoint must cause strict interval shrinkage.',
  'Specify first true or last false, interval convention, and loop invariant before writing updates.',
  'What is the first index with value >=2 in [1,2,2,4]?',
  '1',
  ['False prefix', 'Unknown interval', 'Predicate at midpoint', 'True suffix'],
);
add(
  'dsa',
  'Intervals',
  'Intervals require an endpoint convention. Closed [a,b] intervals overlap when one starts exactly where another ends; half-open [a,b) intervals do not. Sorting by start turns merging into comparing the next interval with only the final merged interval.',
  'Closed [1,2] and [2,4] merge to [1,4]. But meeting slots [1,2) and [2,4) can use the same room. For event sweeps, tie ordering must reflect the endpoint convention.',
  'Updating an output interval that aliases an input array violates a nonmutation contract. Copy interval pairs before merging.',
  'Decide endpoint semantics and tie-breaking before choosing < versus <=.',
  'Do closed intervals [1,2] and [2,4] overlap? Answer yes/no.',
  'yes',
  ['Sort starts', 'Compare next start with end', 'Extend overlap', 'Emit separate interval'],
);
add(
  'dsa',
  'Bit manipulation',
  'Bit operations expose compact set and parity representations, but the language’s integer model matters. Java int and JavaScript bitwise operations are 32-bit; Python integers are arbitrary precision and negative values behave like an unbounded sign extension.',
  'For n=12 (1100₂), n-1=11 (1011₂), so n&(n-1)=8 (1000₂): the lowest set bit was cleared. Repeating counts set bits rather than iterating every possible position.',
  'Right shift may preserve a sign bit. JavaScript >>> converts to unsigned 32-bit form, but shifting by 32 wraps the count modulo 32.',
  'State signedness and width, especially at the highest bit and for negative inputs.',
  'How many set bits are in binary 1011?',
  '3',
  ['Unsigned value', 'Clear lowest set bit', 'Increment count', 'Repeat to zero'],
);
add(
  'dsa',
  'Math',
  'Mathematical identities can replace brute force when their domains are explicit. Euclid’s algorithm preserves gcd through (a,b)→(b,a mod b). Exponentiation by squaring halves the remaining exponent after incorporating its low bit.',
  'gcd(54,24) becomes gcd(24,6), then gcd(6,0)=6. For 2^10, squaring bases yields 2,4,16,256; only exponent bits set in 10₂=1010₂ contribute to the result.',
  'Modulo signs differ across languages for negative operands. Floating-point numbers cannot exactly represent all large integers; JavaScript’s safe integer ceiling is 2^53-1.',
  'Define zero, negative, overflow, and precision cases before applying a familiar formula.',
  'What is gcd(54,24)?',
  '6',
  ['Normalize signs', 'Remainder step', 'Strictly smaller divisor', 'Stop at zero'],
);
add(
  'dsa',
  'Pattern recognition and Big O',
  'Recognize evidence, not keywords: contiguous ranges suggest maintaining a window or prefix aggregate; nonnegative weighted shortest paths suggest a priority frontier; repeated overlapping choices suggest a state table. Constraints eliminate options: n=20 may allow subsets; n=200000 usually cannot tolerate all pairs.',
  'A million elements makes n² roughly 10^12 pair operations, while n log₂ n is about 20 million comparisons. An O(n) algorithm with a million large objects may still exceed memory. Amortized analysis counts total work across an operation sequence.',
  'Nested loops are not automatically quadratic when both pointers only advance n times. Expected, amortized, and worst-case bounds answer different questions.',
  'Cheat sheet: binary search O(log n), scan O(n), comparison sort O(n log n), all pairs O(n²), subsets O(2^n), permutations O(n!). Include output size in lower bounds.',
  'A monotonic stack pushes and pops each of n items once. Is total work linear or quadratic?',
  'linear',
  ['Constraints', 'Candidate state/invariant', 'Cost model', 'Proof + edge cases'],
);
add(
  'syntax',
  'Java collections',
  'List, Set, and Map describe contracts rather than specific performance. ArrayList has indexed access and amortized append; LinkedList has nodes but still linear indexed lookup. HashMap gives expected constant lookup; TreeMap orders keys with logarithmic updates.',
  'For ArrayList<Integer> xs=[1,2,3], xs.remove(1) chooses the index overload and leaves [1,3]. xs.remove(Integer.valueOf(1)) removes by value and leaves [3]. List.of creates an unmodifiable collection.',
  'Arrays.asList is a fixed-size view backed by the original array, not a normal growable ArrayList. Unmodifiable wrappers may still reflect changes to the wrapped collection.',
  'Choose semantics first: ordering, null policy, mutation, equality, and concurrency; then evaluate complexity.',
  'Does List.of(1,2).add(3) succeed? Answer yes/no.',
  'no',
  ['Interface contract', 'Implementation', 'Mutation policy', 'Observed behavior'],
);
add(
  'syntax',
  'Java strings',
  'String is immutable and equals compares contents; == compares reference identity. StringBuilder is appropriate for repeated construction. A char is a UTF-16 code unit, so emoji may occupy two chars and combining characters may occupy several code points.',
  'Two new String("lab") objects have equal contents but different identities. Sorting strings uses lexicographic code-unit order unless a locale-aware Collator is chosen.',
  'String interning can make == appear correct in small literal examples, hiding a real identity bug. Converting bytes without specifying a charset creates environmental dependence.',
  'Use content equality for values and explicitly choose character, code point, or grapheme semantics.',
  'Are two separately allocated new String("lab") values equal with equals? Answer yes/no.',
  'yes',
  ['Bytes + charset', 'UTF-16 contents', 'Content comparison', 'Immutable result'],
);
add(
  'syntax',
  'Java streams and lambdas',
  'A stream pipeline combines a source, lazy intermediate operations, and a terminal operation. map transforms, filter selects, flatMap flattens, and reduce aggregates. Streams are single-use. Lambdas capture effectively final local bindings; captured objects may still mutate.',
  'A pipeline with map that prints values prints nothing until a terminal operation consumes it. Prefer side-effect-free transformations and collectors with explicit merge policies for duplicate keys.',
  'Parallel streams do not make unsynchronized mutation safe. A shared ArrayList::add sink races, and blocking work can saturate a common thread pool.',
  'Ask when work executes, whether order matters, and whether the reduction is associative before parallelizing.',
  'Does constructing a stream with only map execute that map immediately? Answer yes/no.',
  'no',
  ['Source', 'Lazy transformations', 'Terminal operation', 'Materialized result'],
);
add(
  'syntax',
  'Java generics and exceptions',
  'Generics enforce compile-time relationships but most type parameters are erased at runtime. Producer extends, consumer super (PECS) explains wildcard direction. Checked exceptions must be caught or declared; unchecked exceptions often represent violated programming assumptions.',
  'List<? extends Number> yields Number values, but adding Integer is unsafe because the captured list might hold Double. List<? super Integer> accepts Integer, but reads only as Object. A finally return can override a pending return or exception.',
  'A raw type discards static checks and moves failures to runtime. Catching Exception and returning a success-shaped default hides failure and corrupts caller assumptions.',
  'Preserve type information and propagate actionable failure; use finally for cleanup, not control-flow replacement.',
  'Can List<? extends Number> safely accept add(1)? Answer yes/no.',
  'no',
  ['Compile-time type', 'Captured wildcard', 'Allowed operations', 'Explicit error boundary'],
);
add(
  'syntax',
  'Java concurrency and IO',
  'Visibility, atomicity, and mutual exclusion are separate properties. volatile establishes visibility/order for a variable, not atomic compound increments. AtomicInteger provides atomic updates; locks protect multi-variable invariants. Try-with-resources closes AutoCloseable resources reliably.',
  'Two threads can both read a volatile count=0, compute 1, and write 1: one increment is lost. AtomicInteger.incrementAndGet avoids that single-variable race. Resources declared A then B close B then A.',
  'Holding a lock during blocking IO can serialize an entire service. Ignoring interrupts prevents cooperative cancellation and graceful shutdown.',
  'Match the coordination boundary to the invariant and close resources in the ownership scope that opened them.',
  'Resources A then B are declared in try-with-resources. Which closes first?',
  'B',
  ['Shared invariant', 'Visibility / atomicity choice', 'Work scope', 'Close / cancel'],
);
add(
  'syntax',
  'Python comprehensions',
  'Comprehensions express mapping/filtering compactly; generators defer work and avoid materializing everything. Dictionaries retain insertion order, while sets do not promise a stable presentation order. Default argument expressions run once at definition time.',
  'def f(x,items=[]): items.append(x); return len(items) gives 1 then 2 across separate calls. Use items=None and allocate inside to isolate calls. A Counter counts all items in one pass instead of repeating list.count.',
  'A nested comprehension may hide a quadratic cross-product. Late-bound closures in loops refer to the binding at call time unless captured intentionally.',
  'Distinguish eager construction, deferred iteration, and shared mutable state before shortening code.',
  'A mutable default list receives one item in each of two calls. What is its length after the second call?',
  '2',
  ['Iterable', 'Filter', 'Transformation', 'List or lazy generator'],
);
add(
  'syntax',
  'JavaScript and TypeScript',
  'JavaScript runtime behavior remains unchanged by TypeScript annotations. Types disappear during compilation, so data imported from files or network boundaries needs runtime validation. let and const have block scope; var is function-scoped. const prevents rebinding, not object mutation.',
  'Three closures made with var i in one loop all observe i=3 when called later. With let, each iteration has a distinct binding. A Set preserves insertion order, enabling stable deduplication.',
  'A type assertion does not validate JSON. Number arithmetic loses integer precision above 2^53-1; mixing BigInt and Number throws.',
  'Use types for internal guarantees and guards for external data. Keep closure lifetime and mutation explicit.',
  'Three deferred closures from for(var i=0;i<3;i++) all read which final value?',
  '3',
  ['Source types', 'Erased annotations', 'Runtime bindings', 'Boundary validation'],
);
add(
  'syntax',
  'Regex and file handling',
  'Regex parsing and string-literal parsing are separate layers. Anchors enforce a whole-input contract; a partial match may accept garbage. Keep IO streaming and encoding explicit, and use structured parsers instead of regex for nested syntax such as arbitrary YAML.',
  'The Java source string "\\\\d+" gives the regex engine \\d+. Parsing KEY=VALUE with ^([A-Z_]+)=(.*)$ permits an empty value and additional equals signs in the value, but rejects lowercase keys.',
  'Nested unbounded quantifiers can cause catastrophic backtracking. Avoid evaluating hostile patterns without limits, and do not construct a regex from user text without escaping.',
  'Specify the grammar, full-match requirement, encoding, and input size limit before writing a pattern.',
  'Does ^[0-9]+$ match 12x? Answer yes/no.',
  'no',
  ['Input text', 'Literal escaping', 'Regex grammar', 'Full match or reject'],
);
add(
  'syntax',
  'SQL idioms',
  'SQL uses three-valued logic: comparisons involving NULL usually produce UNKNOWN, which WHERE does not keep. IS NULL tests missingness. COUNT(*) counts rows, COUNT(column) counts non-null values. Result order is unspecified without ORDER BY.',
  "SELECT CASE WHEN NULL=NULL THEN 'yes' ELSE 'no' END returns no. A left join followed by WHERE right.id IS NOT NULL effectively removes unmatched rows, changing outer-join intent.",
  'NOT IN with a NULL in its subquery can turn all comparisons unknown. Prefer NOT EXISTS for a null-safe anti-join when that matches the intended semantics.',
  'Treat NULL, duplicate rows, and deterministic ordering as part of every query contract.',
  'Does NULL = NULL evaluate to true in SQL? Answer yes/no.',
  'no',
  ['Rows', 'TRUE / FALSE / UNKNOWN', 'WHERE keeps TRUE', 'Explicit ORDER BY'],
);
add(
  'syntax',
  'Bash idioms',
  'Shell words undergo multiple expansions; quotes control splitting and globbing. "$x" preserves one argument, while unquoted $x may expand into several. Exit status drives control flow. set -euo pipefail is useful but errexit has contextual exceptions, so critical operations still need explicit checks.',
  'With x="a b", printf "%s\\n" "$x" prints one line. Command substitution removes trailing newlines. A pipeline normally reports its last command’s status; pipefail includes earlier failures.',
  'Parsing filenames through whitespace breaks on spaces and newlines. Prefer arrays, quoted expansions, and null-delimited find/read pipelines.',
  'Count arguments after expansion rather than reading command text visually.',
  'With x="a b", how many arguments does "$x" expand to?',
  '1',
  ['Shell source', 'Parameter expansion', 'Quote-aware splitting', 'Command arguments'],
);
add(
  'devops',
  'Linux and shell',
  'Processes have IDs, parentage, file descriptors, environment, working directory, and exit status. stdin/stdout/stderr are separate streams. Permissions apply to user/group/other; directory execute controls traversal. Signals request behavior, with SIGTERM allowing cleanup and SIGKILL preventing it.',
  'Redirecting stdout with >out.txt leaves stderr visible unless explicitly redirected. In cmd 2>&1 >out.txt, stderr points to the old stdout; order matters. Diagnose a service with process status, listening sockets, logs, and exit codes rather than immediately restarting it.',
  'A successful command may produce no output; empty output is not a universal success signal. Running as root can conceal permission mistakes.',
  'Preserve exit statuses and inspect the process/resource layer actually implicated by the symptom.',
  'Does redirecting only stdout also redirect stderr? Answer yes/no.',
  'no',
  ['Command', 'stdin fd0', 'stdout fd1', 'stderr fd2'],
);
add(
  'devops',
  'Git workflows',
  'Commits form a directed acyclic history of snapshots. Rebase replays commits on a new parent and changes their IDs; merge preserves branch history. Revert creates a new inverse commit without rewriting published history. Bisect narrows a known good/bad regression range using a repeatable test.',
  'During a rebase conflict: edit the file, git add the resolved file, then git rebase --continue. To back out, git rebase --abort restores the pre-rebase state. For a shared bad commit, git revert is usually safer than reset plus force-push.',
  'A bisect test that fails because old dependencies cannot install does not reliably classify the code regression. Skip untestable revisions rather than labeling them bad.',
  'Choose history rewriting only when ownership and collaboration policy permit it; keep a reproducible good/bad oracle.',
  'Does git revert create a new commit rather than rewriting the old one? Answer yes/no.',
  'yes',
  ['Known good', 'Candidate commit', 'Reproducible test', 'Narrow regression range'],
);
add(
  'devops',
  'Dockerfiles and Compose',
  'Images are layered filesystem/runtime configuration; containers are running instances with isolated processes. Build-cache invalidation follows preceding layers. Multi-stage builds separate build tools from runtime artifacts. Compose describes local service relationships, not a production orchestration guarantee.',
  'Copy package manifests, install locked dependencies, then copy source. A source-only change can reuse the dependency layer. A db healthcheck plus service_healthy dependency gates startup readiness; simple start order does not.',
  'Secrets placed in build arguments or copied layers can remain in image history. Running non-root is one control, not a complete security boundary.',
  'Make builds reproducible, separate runtime from tooling, and distinguish startup from healthy service behavior.',
  'If source is copied before dependency installation, can a source change invalidate that dependency layer? Answer yes/no.',
  'yes',
  ['Base image', 'Stable dependency layer', 'Changing source layer', 'Non-root runtime'],
);
add(
  'devops',
  'CI CD pipelines',
  'A pipeline is a dependency graph executed in clean environments. Reproducible checks pin toolchains and use lockfile-aware installs. Deployment adds environment protection, scoped credentials, artifact identity, and rollback. Avoid rebuilding a different artifact after tests and calling it the tested release.',
  'A Node test job checks out source, sets up Node, runs npm ci, then npm test. Permissions contents:read is enough for reading source; a Pages deploy needs its own narrower write scopes.',
  'Untrusted pull-request code must not gain deployment credentials. Caches improve performance but are not trusted artifacts or substitutes for a lockfile.',
  'Promote the tested artifact and match each job’s permissions to its actual responsibilities.',
  'Should npm ci normally precede npm test on a clean runner? Answer yes/no.',
  'yes',
  ['Checkout', 'Pinned toolchain', 'Locked install + checks', 'Tested artifact'],
);
add(
  'devops',
  'Kubernetes core objects',
  'A Pod is the scheduling unit; a Deployment reconciles replica state; a Service selects endpoints by labels. The API is declarative: controllers continuously attempt to make observed state match desired state. A successful apply confirms acceptance, not application readiness.',
  'A Deployment selector app=web must match its pod-template label. A Service port 80 may forward to container targetPort 8080. Readiness removes unready endpoints; liveness may restart a container; startup probes protect slow initialization.',
  'ReadWriteOnce volume access refers to a node, not necessarily a single pod. Requests influence scheduling; memory limits can cause OOM termination.',
  'Debug desired spec, controller events, pod state, endpoints, and application health as separate layers.',
  'Does containerPort alone expose a Pod through a Service? Answer yes/no.',
  'no',
  ['Desired resource', 'Controller reconciliation', 'Pod labels / readiness', 'Service endpoints'],
);
add(
  'devops',
  'Terraform basics',
  'Terraform compares configuration, state, and provider-observed infrastructure to create a plan. State maps resource addresses to real objects and can contain sensitive data. Remote locking coordinates writers; it is not a replacement for review or access control.',
  'A typed variable with validation rejects instance_count<1 before provisioning. plan previews proposed actions and may refresh remote state; apply performs mutations. Renaming a resource address without a moved block can appear as destroy/create.',
  'A successful validate checks configuration structure, not whether credentials, quotas, or provider-side constraints will allow apply. Never commit state containing secrets.',
  'Review replacement/destruction actions and protect state with encryption, access control, and coordinated writes.',
  'Does terraform plan normally apply its proposed changes? Answer yes/no.',
  'no',
  ['Configuration + state', 'Provider refresh', 'Reviewed plan', 'Apply + updated state'],
);
add(
  'devops',
  'Networking fundamentals',
  'DNS maps names to records; IP routing chooses packet paths; TCP establishes a reliable byte stream; TLS authenticates/encrypts it; HTTP defines application messages. Success at one layer does not prove the next works. Timeouts and refusals suggest different failure modes.',
  'A hostname resolving correctly does not prove port 443 is reachable. A TCP connection succeeding does not prove the certificate matches the hostname. An HTTP 503 can mean the application is reachable but has no healthy upstream.',
  'Retries at every layer can multiply load during an outage. Bound retry budgets, use exponential backoff with jitter, and distinguish safe/idempotent operations.',
  'Test the failing layer directly and preserve the original error rather than replacing every failure with a generic connection problem.',
  'Does successful DNS resolution prove a TCP service is reachable? Answer yes/no.',
  'no',
  ['DNS', 'Routing + TCP', 'TLS', 'HTTP application'],
);
add(
  'devops',
  'Monitoring and incident response',
  'Metrics summarize trends, logs preserve events, and traces connect work across services. An SLI measures user-facing behavior; an SLO sets the target; an error budget quantifies tolerable failures. During an incident, establish impact and coordination, mitigate, verify recovery, then investigate systemic causes.',
  'A 99.9% availability target across 30 days permits 43.2 minutes of unavailability under a time-based definition. Request-based SLIs may produce a different budget. A rollback should be guided by user-facing signals, not only CPU.',
  'Unbounded user-ID labels cause metric-cardinality explosions. A postmortem blaming one person misses the conditions that allowed an error to become an outage.',
  'Make telemetry actionable, cap cardinality, and distinguish mitigation from root-cause remediation.',
  'At 99.9% over 30 days, how many minutes is the time-based error budget?',
  '43.2',
  ['Detect user impact', 'Coordinate + timeline', 'Mitigate', 'Verify + learn'],
);
add(
  'ai',
  'Regression and gradient descent',
  'Linear regression predicts a numeric target with weighted features. For mean squared loss L=mean((wx-y)^2), dL/dw=2*mean((wx-y)x). Gradient descent moves opposite the gradient. Learning rate and feature scaling determine stability; a lower training loss is not proof of better generalization.',
  'With x=[1,2], y=[2,4], w=0, the gradient is -10. Learning rate 0.1 produces w=1 after one step. Finite-difference checks compare analytic gradients with small numerical perturbations.',
  'Some loss definitions include 1/2, changing the gradient factor. Mixing sum and mean makes the effective learning rate depend on batch size.',
  'Write the exact objective before differentiating, and test gradients on a tiny hand-computable dataset.',
  'A gradient -10 with learning rate 0.1 moves w=0 to what value?',
  '1',
  ['Predictions', 'Residual loss', 'Gradient', 'Parameter update'],
);
add(
  'ai',
  'Logistic regression',
  'Logistic regression maps a linear score through sigmoid to a probability-like value. Binary cross-entropy is a natural objective, while classification requires a threshold chosen for costs and calibration. A score’s probability interpretation depends on training distribution and calibration.',
  'sigmoid(0)=0.5. For a large negative x, exp(-x) can overflow; use exp(x)/(1+exp(x)) on the negative branch. Compute log-loss through stable logit formulations rather than taking log of rounded zero.',
  'A threshold of 0.5 is not universally optimal, especially under asymmetric false-positive/false-negative costs or changed prevalence.',
  'Separate numerical stability, calibration, and the policy that turns scores into decisions.',
  'What is sigmoid(0)?',
  '0.5',
  ['Linear score', 'Stable sigmoid', 'Calibrated assessment', 'Decision threshold'],
);
add(
  'ai',
  'Train validation test',
  'Training data fits parameters; validation data selects models and settings; the final test set estimates performance after those choices. Cross-validation rotates validation folds within development data. Split by entity or time when random rows would leak future or related observations.',
  'If multiple records belong to one patient, keep that patient in a single split. Fit scalers and vocabulary only on training folds, then transform validation data using those fitted values. Stratification balances labels but does not prevent group leakage.',
  'Repeatedly tuning against the test set turns it into validation data. A preprocessing step run before splitting can leak information even without using labels.',
  'Align split boundaries with the real prediction moment and the independent unit of generalization.',
  'Should a scaler be fitted on the combined train and test data? Answer yes/no.',
  'no',
  ['Training fit', 'Validation selection', 'Freeze decisions', 'Final test'],
);
add(
  'ai',
  'Regularization and bias variance',
  'High bias means the model or features cannot express the needed relationship; high variance means fit depends too strongly on the sample. Regularization constrains complexity, trading training fit for stability. Learning curves help distinguish lack of capacity from lack of representative data.',
  'An L2 penalty lambda*sum(w²) discourages large coefficients. Standardizing features is important because the same coefficient magnitude means different effects at different scales. Intercepts are often excluded from the penalty.',
  'More data does not automatically fix a biased hypothesis class or shifted labels. Very strong regularization can underfit both training and validation.',
  'Compare training and validation curves before changing model size, data volume, or penalty strength.',
  'Does stronger regularization always improve validation performance? Answer yes/no.',
  'no',
  ['Model capacity', 'Training fit', 'Validation gap', 'Regularization tradeoff'],
);
add(
  'ai',
  'Classification metrics',
  'Precision=TP/(TP+FP) asks how many positive predictions were right. Recall=TP/(TP+FN) asks how many actual positives were found. F1 is their harmonic mean. ROC AUC measures ranking across positive-negative pairs; PR curves often reveal more in heavily imbalanced settings.',
  'For TP=3, FP=1, FN=2, precision=.75 and recall=.6; F1=2/3. A model predicting all negatives can have 99% accuracy when positives are 1%, yet zero recall.',
  'AUC is undefined for a test set with only one class. Aggregate metrics can hide poor behavior in a critical subgroup. Always report denominator and zero-division conventions.',
  'Choose metrics from error costs and prevalence, then inspect slices and threshold-dependent behavior.',
  'For TP=3 and FP=1, what is precision?',
  '0.75',
  ['Confusion counts', 'Metric denominators', 'Threshold / ranking', 'Critical slices'],
);
add(
  'ai',
  'Tokenization',
  'Tokenization maps text into discrete model inputs. Word splitting, subword vocabularies, Unicode normalization, and special tokens all affect behavior. The embedding model’s tokenizer must match its trained vocabulary and context window. Token count is not character or word count.',
  'A simple ASCII tokenizer maps "RAG: 2 chunks" to [rag,2,chunks]. A production subword tokenizer may split an unfamiliar identifier into many pieces, changing context usage and retrieval chunk sizes.',
  'Character limits do not guarantee a token budget. Naive case folding may erase distinctions meaningful to code, identifiers, or multilingual text.',
  'Document normalization and count tokens with the actual target tokenizer for context budgeting.',
  'Does one word always correspond to one model token? Answer yes/no.',
  'no',
  ['Text normalization', 'Vocabulary segmentation', 'Token IDs', 'Context budget'],
);
add(
  'ai',
  'Embeddings and vector search',
  'Embeddings represent items as numeric vectors whose geometry reflects a training objective. Cosine similarity compares direction; dot product also includes magnitude unless vectors are normalized. Exact search scores every vector; approximate indexes trade some recall for speed and memory.',
  'Vectors [1,0] and [0,1] have cosine 0; [1,2] and [2,4] have cosine 1. A zero vector has no direction, so an application must define its handling. Evaluate approximate search against exact nearest neighbors on representative queries.',
  'High similarity is not factual entailment. Changing embedding models usually requires re-embedding the corpus because spaces are not generally compatible.',
  'Version the embedding model and index together, and measure retrieval quality rather than trusting geometry alone.',
  'What is cosine similarity between [1,0] and [0,1]?',
  '0',
  ['Text', 'Versioned embedding', 'Vector index', 'Ranked candidates'],
);
add(
  'ai',
  'RAG and grounding',
  'Retrieval-augmented generation retrieves source material and places it in a model’s context. Grounding requires answers to be supported by that material; retrieval alone does not guarantee this. Chunk boundaries, overlap, metadata, access control, and query rewriting all affect what evidence is available.',
  'With five tokens, chunk size 3 and overlap 1 produce [0,1,2] then [2,3,4]. Extra overlap improves boundary continuity but duplicates context and storage. Preserve document IDs, offsets, dates, and citation links for attribution.',
  'A valid citation ID does not prove the cited text supports a claim. Retrieved documents can contain untrusted instructions; treat them as data rather than authority over the application.',
  'Evaluate retrieval coverage, citation validity, and semantic support separately; abstain when evidence is insufficient.',
  'How many chunks cover five tokens with size 3 and overlap 1 when redundant trailing chunks are avoided?',
  '2',
  ['Query', 'Retrieve permitted evidence', 'Assemble attributed context', 'Answer or abstain'],
);
add(
  'ai',
  'Retrieval evaluation',
  'Build a query set with relevance judgments and a defined unit: document, passage, or answer-bearing span. Precision@k measures result usefulness; recall@k measures relevant-set coverage; reciprocal rank measures how soon the first relevant result appears. Evaluation conventions must handle duplicates and unjudged results.',
  'If retrieved top two are [x,a] and relevant=[a,b], precision@2=.5, recall@2=.5, and reciprocal rank=.5. A retriever may have excellent recall but return chunks too long to fit the context budget.',
  'Evaluating only on queries used to tune chunking or retrieval thresholds overestimates generalization. Relevance judgments may be incomplete or ambiguous.',
  'Keep held-out queries and critical slices; measure downstream answer support in addition to retrieval ranking.',
  'If the first relevant result is rank 4, what is reciprocal rank?',
  '0.25',
  ['Held-out queries', 'Relevance judgments', 'Ranked retrieval', 'Metrics + failure slices'],
);
add(
  'ai',
  'Prompt engineering and agents',
  'Prompts should separate task, trusted instructions, untrusted inputs, required output, and uncertainty policy. Few-shot examples clarify structure but can bias outputs. Tool-using agents introduce actions: validate arguments, constrain permissions, impose budgets, and require confirmation for consequential side effects.',
  'A retrieval prompt can require a citation per factual claim and an explicit insufficient-evidence response. A tool call schema can restrict an operation to read-only search with bounded result count. Neither guarantees correctness without validation and evaluation.',
  'Prompt instructions alone are not a security boundary. Tool results and retrieved pages can contain prompt injection, and repeated retries can multiply cost or actions.',
  'Give the system least privilege, a bounded action loop, explicit stop conditions, and tests for refusal and malformed output.',
  'Is a prompt saying "never do harm" a sufficient tool authorization boundary? Answer yes/no.',
  'no',
  ['Trusted task', 'Untrusted context', 'Validated tool call', 'Observe / stop'],
);
add(
  'ai',
  'LLM evaluation harnesses',
  'An evaluation harness fixes inputs, expected behaviors, scoring rules, and model/config versions. Use deterministic checks where possible and calibrated human judgments for subjective properties. Track latency, refusal appropriateness, grounding, and safety alongside task success.',
  'A candidate can improve average score while regressing an important case from .8 to .2. Gate aggregate improvement and per-slice regressions. Record prompt version, retrieval index, decoding settings, and test-set provenance so results are reproducible.',
  'An LLM judge can share the same blind spots as the model being judged. Hidden test leakage and repeated optimization against the benchmark invalidate confidence.',
  'Use versioned held-out cases, uncertainty estimates, and human review of the highest-impact failures.',
  'Can a better mean score hide a severe regression on one important case? Answer yes/no.',
  'yes',
  ['Versioned cases', 'Candidate system', 'Independent scoring', 'Regression gate'],
);
add(
  'ai',
  'Transformer basics',
  'Attention computes content-dependent weighted combinations of value vectors. Queries and keys determine scores, often scaled by sqrt(key dimension), then normalized with softmax. Positional information matters because attention alone does not encode sequence order. Causal masking prevents reading future tokens during autoregressive prediction.',
  'Softmax([1000,1000]) is [.5,.5]. Subtracting the maximum before exponentiation preserves probabilities and prevents overflow. A full dense attention matrix has quadratic pairwise score storage in sequence length, although optimized kernels reduce materialization.',
  'Attention weights are not a complete explanation of a model’s reasoning. Increasing context length affects memory and computation even if parameter count is unchanged.',
  'Separate parameter memory, activation/context costs, and inference KV-cache growth when estimating hardware needs.',
  'What is either softmax weight for equal scores [1000,1000]?',
  '0.5',
  ['Token + position', 'Queries / keys / values', 'Masked attention', 'Contextual representations'],
);
add(
  'sql',
  'Joins and aggregation',
  'A join matches rows; it may multiply them when several matches exist. Grouping then aggregates the resulting rows, so accidental many-to-many joins inflate totals. LEFT JOIN preserves unmatched left rows by adding NULLs for the right side.',
  'A department with no employees produces one null-extended row. COUNT(*) would count it as 1; COUNT(employee.id) returns 0. Filters on the right table often belong in ON if unmatched departments must survive.',
  'Selecting ungrouped columns can be rejected or produce implementation-specific values. Sum orders before joining to another one-to-many table when necessary.',
  'Predict row cardinality after every join before applying aggregation.',
  'For an empty department after a left join, what does COUNT(employee.id) return?',
  '0',
  ['Left rows', 'Join matches', 'Grouped rows', 'Aggregates'],
);
add(
  'sql',
  'Window functions',
  'Window functions compute across related rows without collapsing them. PARTITION BY defines independent groups; ORDER BY defines sequence; the frame defines which ordered rows contribute. ROW_NUMBER, RANK, and DENSE_RANK handle ties differently.',
  'Salaries [100,100,80] have dense ranks [1,1,2] and ranks [1,1,3]. A running total with ROWS UNBOUNDED PRECEDING uses each physical row; default RANGE semantics may include peers together.',
  'A window ORDER BY does not guarantee final result order. Add an outer ORDER BY, and include deterministic tie-breakers for ROW_NUMBER.',
  'Specify partition, order, frame, and tie policy independently.',
  'What is the dense rank of 80 after salaries 100,100,80 descending?',
  '2',
  ['Partition', 'Order + ties', 'Frame', 'Per-row value'],
);
add(
  'sql',
  'CTEs and subqueries',
  'A common table expression names a query stage; a correlated subquery depends on the current outer row. CTEs improve readability but do not universally force materialization or improve performance. Optimizers may inline, reorder, or cache parts depending on semantics and engine version.',
  'To choose each customer’s newest order, assign ROW_NUMBER partitioned by customer and ordered by date descending then id descending, then select rn=1 in an outer query. A GROUP BY customer with bare amount does not express that contract.',
  'NOT IN behaves unexpectedly when its subquery contains NULL. NOT EXISTS expresses "there is no matching row" without that specific trap.',
  'Choose a formulation whose row identity is unambiguous, then inspect its actual plan.',
  'Does a CTE always force materialization in every database? Answer yes/no.',
  'no',
  ['Source query', 'Named transformation', 'Outer selection', 'Plan inspection'],
);
add(
  'sql',
  'Recursive queries',
  'A recursive CTE has an anchor and a recursive step joined with UNION ALL or UNION. It can traverse hierarchies, generate sequences, and expand reachable states. Correctness requires a termination condition; cyclic input may need an explicit visited path or depth guard.',
  'An organization query anchors on a manager at depth 0, then joins employees whose manager_id equals each frontier member and returns depth+1. Ordering output by depth and name does not itself control traversal execution order.',
  'UNION removes duplicate whole rows; adding depth means a cycle can keep producing distinct rows forever. UNION alone is not always cycle detection.',
  'Define the frontier state, termination rule, and whether duplicate paths or only unique vertices matter.',
  'If the anchor is depth 0, what depth is its direct report?',
  '1',
  ['Anchor rows', 'Recursive join', 'Next frontier', 'Termination / cycle guard'],
);
add(
  'sql',
  'Indexes and query plans',
  'An index trades storage and write maintenance for faster access paths. Composite indexes are ordered lexicographically by leading columns. A query plan reveals whether the engine scans, searches, sorts, or uses a covering index; cost depends on selectivity and data distribution.',
  'An index (customer,ordered_on,id) can support one customer’s ordered history. It is less useful for an unrestricted filter only on ordered_on because the leading customer dimension is unconstrained.',
  'An index is not always faster for small tables or low-selectivity queries. Wrapping an indexed column in a function may prevent a normal index lookup unless an expression index matches.',
  'Compare plans and timings with representative cardinalities and include write overhead.',
  'Does adding an index guarantee every query becomes faster? Answer yes/no.',
  'no',
  ['Predicate + ordering', 'Candidate indexes', 'EXPLAIN plan', 'Measured workload'],
);
add(
  'sql',
  'Transactions and isolation',
  'A transaction groups operations into a commit/rollback boundary. Isolation determines which concurrent effects are visible and which anomalies are prevented. Serializable behavior corresponds to some serial execution, but conflicts may require retries. Database implementations differ; SQLite’s locking model is not a general simulation of distributed MVCC.',
  'Two doctors both read that someone else is on call, then each marks themselves off in separate rows. Under snapshot isolation, both writes may commit and violate the cross-row invariant: write skew.',
  'Wrapping code in a transaction does not automatically make a check-then-act invariant safe. Retry the whole transaction after a serialization conflict, not just the last statement.',
  'Identify the invariant’s read/write set and choose constraints, locking, or serializable isolation accordingly.',
  'Can snapshot isolation permit write skew? Answer yes/no.',
  'yes',
  ['Begin', 'Read invariant', 'Coordinated writes', 'Commit or retry'],
);
add(
  'sql',
  'Normalization',
  'Normalization organizes dependencies to reduce insertion, update, and deletion anomalies. A customer’s address belongs to the customer identity rather than being duplicated in every order unless an intentional historical snapshot is required. Foreign keys express relationships and can enforce referential integrity.',
  'If ten orders repeat a current customer address, changing only nine creates disagreement. Splitting customers and orders avoids that anomaly. A shipping-address snapshot on an order is different: it records historical fact and should not change with the current profile.',
  'Denormalization is not inherently wrong; it creates a consistency obligation. Document rebuild, synchronization, and staleness rules for read models.',
  'Model functional dependencies and temporal meaning before applying a normal-form checklist.',
  'Should an old order’s shipping-address snapshot always change when a customer moves? Answer yes/no.',
  'no',
  ['Entity identity', 'Functional dependencies', 'Normalized truth', 'Intentional read model'],
);
add(
  'systems',
  'Scaling and capacity',
  'Capacity planning turns product requirements into workload assumptions: request rates, peak factors, payload sizes, retention, replication, and latency percentiles. Horizontal scaling needs state partitioning or shared coordination; stateless request handlers simplify adding instances but do not remove downstream bottlenecks.',
  'Ten million requests/day is about 115.7 average RPS. At decimal 2 KB per response, payload alone is 20 GB/day. A 10× peak multiplier gives roughly 1157 peak RPS before retries, cache misses, or replication traffic.',
  'Averages conceal bursts and tail latency. More workers can overload a fixed-capacity database and worsen latency instead of improving throughput.',
  'Write assumptions with units, estimate bottlenecks, and validate under peak and failure load.',
  'At 10 million requests/day and decimal 2 KB each, how many GB/day of payload?',
  '20',
  ['Workload assumptions', 'Rate + size estimates', 'Bottleneck budget', 'Load test'],
);
add(
  'systems',
  'Caching',
  'A cache stores derived/reusable results to reduce latency or source load. Cache-aside reads fetch on miss and populate the cache. TTL bounds some staleness, while invalidation and write policies determine how updates become visible. Stampedes occur when many callers rebuild the same missing value.',
  'If a hot key expires at once, single-flight/coalescing lets one caller rebuild while others wait or receive bounded stale data. TTL jitter spreads expirations, but does not fix one exceptionally hot key by itself.',
  'A write followed by invalidation can race with an old in-flight read that repopulates stale data. Versioning or carefully chosen update policies may be required.',
  'State the allowed staleness budget and failure policy before choosing eviction or invalidation.',
  'Does TTL alone prevent all stale-write races? Answer yes/no.',
  'no',
  ['Lookup', 'Hit / bounded stale', 'Coalesced miss', 'Versioned source'],
);
add(
  'systems',
  'Queues and backpressure',
  'A queue decouples producers from consumers but does not create infinite capacity. Arrival rate above service rate grows backlog and latency. At-least-once delivery requires idempotent consumers; retries need bounded backoff and dead-letter handling for persistent failures.',
  'A worker can charge a payment and crash before acknowledging. Redelivery must reuse an idempotency key at the side-effect boundary. A visibility timeout acts like a lease; long jobs may need safe renewal.',
  'Exactly-once claims often hide a narrower transactional scope. An in-memory dedup set does not survive restarts or coordinate multiple workers.',
  'Bound backlog, define overload behavior, and make repeated delivery safe before adding retries.',
  'Can a crash after a side effect but before acknowledgement cause redelivery? Answer yes/no.',
  'yes',
  ['Producer budget', 'Bounded queue', 'Idempotent worker', 'Ack / retry / DLQ'],
);
add(
  'systems',
  'Sharding',
  'Sharding partitions data across independent storage groups. A good key balances load while keeping common operations local. Hash partitioning distributes ordinary keys; range partitioning supports ordered scans but can concentrate traffic. Rebalancing and cross-shard transactions become explicit operational costs.',
  'Tenant ID keeps one tenant’s data together, but a huge tenant can dominate a shard. Adding a bucket dimension splits that tenant at the cost of scatter/gather queries. Consistent hashing limits remapping when membership changes, but does not solve hot-key skew.',
  'Uniform key counts do not imply uniform load: one key may receive most requests. A shard router and migration protocol need versioning and rollback.',
  'Evaluate bytes, requests, and tenant skew separately, then design a resharding path before it is urgent.',
  'Does consistent hashing alone split one extremely hot key across shards? Answer yes/no.',
  'no',
  ['Partition key', 'Shard routing', 'Local data', 'Migration + skew controls'],
);
add(
  'systems',
  'Consistency and CAP',
  'Consistency guarantees describe what clients may observe. Linearizability makes operations appear atomic in real-time order; eventual consistency promises convergence under suitable conditions. During a network partition, a system cannot guarantee both linearizable behavior and availability for every request.',
  'A profile update followed by a lagging-replica read may show old data. Session-sticky primary reads, version tokens, or waiting for replication can implement read-your-writes, with different latency and availability costs.',
  'CAP is not a menu to pick any two properties in all conditions. Strong consistency also differs from durability, and an available stale answer may violate a business invariant.',
  'Specify guarantees per operation and explain behavior during partitions, not just in the healthy case.',
  'Can a lagging read replica violate read-your-writes? Answer yes/no.',
  'yes',
  ['Client operation', 'Replica coordination', 'Partition policy', 'Observable guarantee'],
);
add(
  'systems',
  'Rate limiters',
  'A rate limiter bounds admitted work. A token bucket refills at a rate up to a capacity, allowing controlled bursts. Fixed windows are simple but permit boundary bursts; sliding logs are precise but expensive. Distributed enforcement needs an atomic coordination strategy or an explicit approximation.',
  'A capacity-10 bucket refilling 2 tokens/second permits ten immediate requests when full, then roughly two per second sustained. Responses can use 429 and Retry-After. Fail-open favors availability; fail-closed favors abuse protection.',
  'Separate local counters on every server multiply the global allowance. Retrying rejected requests without jitter can synchronize clients into new bursts.',
  'Define key scope, burst capacity, sustained rate, atomicity, and outage policy.',
  'A full capacity-10 bucket allows how many immediate one-token requests?',
  '10',
  ['Identity key', 'Atomic token check', 'Admit / 429', 'Timed refill'],
);
add(
  'systems',
  'URL shortener',
  'A shortener stores a durable mapping from a compact key to a destination and serves redirects on a high-read path. Key generation can use random IDs with collision checks or allocated sequences with encoding. Expiry, abuse handling, and destination validation are product requirements, not afterthoughts.',
  'A random key insert must enforce uniqueness atomically and retry a collision. Cache popular mappings, but preserve a way to invalidate disabled malicious links. Choose 301 versus 302 with browser/intermediary caching behavior in mind.',
  'Generating a key and checking existence in separate nontransactional steps races. Unbounded redirects can become an abuse tool even without a complex backend.',
  'Separate allocation correctness, redirect latency, and abuse controls; estimate keyspace and collision risk.',
  'Must random key generation still handle collisions? Answer yes/no.',
  'yes',
  ['Allocate unique key', 'Durable mapping', 'Hot-key cache', 'Redirect + abuse policy'],
);
add(
  'systems',
  'Feed and chat',
  'Feeds combine ranking, fanout, pagination, and freshness. Fanout-on-write makes reads cheap but magnifies celebrity writes; fanout-on-read does the reverse. Chat adds durable message identity, acknowledgements, ordering scope, reconnect history, and duplicate handling.',
  'A hybrid feed precomputes ordinary authors and merges celebrity posts at read time. Cursor pagination based on a stable ordering key avoids the shifting offsets caused by newly inserted posts. Chat can promise ordering per conversation without promising one global order.',
  'A WebSocket connection is not durable delivery. A message received twice after reconnect needs a stable ID, and an acknowledgement must have a documented persistence meaning.',
  'Choose ordering/freshness guarantees and durable boundaries before selecting a transport.',
  'Does a WebSocket alone guarantee durable exactly-once messaging? Answer yes/no.',
  'no',
  ['Durable event ID', 'Fanout / delivery', 'Client acknowledgement', 'Reconnect + dedup'],
);

export const lessons: Lesson[] = seeds.map((seed) => {
  const id = `lesson-${slug(seed.topic)}`;
  return {
    id,
    title: seed.topic,
    topic: seed.topic,
    track: seed.track,
    minutes: 7,
    body: `## The mental model\n${seed.explanation}\n\n## Worked example\n${seed.example}\n\n## Common mistakes\n${seed.mistake}\n\n## A rule worth keeping\n${seed.rule}\n\n## Put it to work\nBefore opening the related exercise, predict one tiny case on paper, name a boundary where your reasoning could fail, and write the invariant or guarantee you intend to preserve. After testing, compare the observed result with your prediction. Explain a mismatch rather than merely changing the answer.\n\n### Self-check\n- [ ] I can explain the worked example without rereading it.\n- [ ] I can construct a boundary case and explain its expected behavior.\n- [ ] I can name a cost, limitation, or tradeoff of this technique.\n- [ ] I can distinguish a practice result from a production guarantee.`,
    diagram: seed.diagram,
    cards: [
      { front: `Explain ${seed.topic} in your own words.`, back: seed.explanation },
      { front: seed.scenario, back: seed.answer },
      { front: `What is a common trap in ${seed.topic}?`, back: seed.mistake },
      { front: `What decision rule should you retain for ${seed.topic}?`, back: seed.rule },
      { front: `Walk through a concrete example of ${seed.topic}.`, back: seed.example },
    ],
    quick: {
      scenario: seed.scenario,
      prediction: seed.answer,
      explanation: seed.example,
      challenge:
        quickTransfer[id]?.challenge ??
        `State the rule that explains your observation, then apply it: ${seed.scenario}`,
      answer: quickTransfer[id]?.answer ?? seed.answer,
    },
    coach: coach(seed.topic, id, []),
    career: career(seed.topic, seed.track),
    related: [],
    prerequisites: [],
  };
});
