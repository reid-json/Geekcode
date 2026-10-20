import { codeProblem, type CodeSeed } from './builders';

export const dsaSeeds: CodeSeed[] = [
  {
    title: 'Pair with a target',
    topic: 'Hash maps',
    difficulty: 'Easy',
    prompt:
      'Given an integer array and a target, return the indices of the first pair found while scanning left to right whose values sum to the target. The first index must precede the second. Return [] if no pair exists.',
    js: '(nums, target) { const seen = new Map(); for (let i=0;i<nums.length;i++) { if(seen.has(target-nums[i])) return [seen.get(target-nums[i]),i]; if(!seen.has(nums[i])) seen.set(nums[i],i); } return []; }',
    py: '(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target-n in seen:\n            return [seen[target-n], i]\n        if n not in seen:\n            seen[n] = i\n    return []',
    cases: [
      [
        [[2, 7, 11, 15], 9],
        [0, 1],
      ],
      [
        [[3, 3], 6],
        [0, 1],
      ],
      [[[], 0], []],
      [[[1, 2, 3], 10], []],
      [
        [[-2, 4, 7], 2],
        [0, 1],
      ],
    ],
    cost: ['O(n)', 'O(n)'],
    insight:
      'Before processing index i, retain the earliest index of each value already seen. A complement lookup only uses earlier positions, so an element can never pair with itself.',
  },
  {
    title: 'Longest unique span',
    topic: 'Sliding window',
    prompt:
      'Return the length of the longest contiguous substring with no repeated characters. Inputs contain ASCII characters.',
    js: '(s) { const last=new Map(); let left=0,best=0; for(let r=0;r<s.length;r++){if(last.has(s[r])) left=Math.max(left,last.get(s[r])+1);last.set(s[r],r);best=Math.max(best,r-left+1);} return best; }',
    py: '(s):\n    last = {}\n    left = best = 0\n    for r, c in enumerate(s):\n        left = max(left, last.get(c, -1)+1)\n        last[c] = r\n        best = max(best, r-left+1)\n    return best',
    cases: [
      [['abcabcbb'], 3],
      [['bbbbb'], 1],
      [[''], 0],
      [['abba'], 2],
      [['pwwkew'], 3],
    ],
    cost: ['O(n)', 'O(min(n, alphabet))'],
    insight:
      'Maintain the earliest legal left boundary for the current right endpoint. On a repeated character, move left forward, never backward. Every index enters the window exactly once.',
  },
];
function add(
  title: string,
  topic: string,
  prompt: string,
  js: string,
  py: string,
  cases: CodeSeed['cases'],
  cost: [string, string],
  insight: string,
  difficulty: CodeSeed['difficulty'] = 'Medium',
) {
  dsaSeeds.push({ title, topic, prompt, js, py, cases, cost, insight, difficulty });
}

add(
  'Best contiguous sum',
  'Arrays and strings',
  'Return the maximum sum of a nonempty contiguous subarray, or 0 for an empty array.',
  '(a){if(!a.length)return 0;let cur=a[0],best=cur;for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);best=Math.max(best,cur);}return best;}',
  '(a):\n    if not a: return 0\n    cur = best = a[0]\n    for x in a[1:]:\n        cur = max(x,cur+x)\n        best = max(best,cur)\n    return best',
  [
    [[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6],
    [[[-4, -2, -9]], -2],
    [[[]], 0],
  ],
  ['O(n)', 'O(1)'],
  'The best interval ending here either extends the previous interval or starts at this item. A negative prefix cannot improve a later interval.',
  'Easy',
);
add(
  'Product except self',
  'Arrays and strings',
  'Return an array whose ith element is the product of all input elements except a[i], without division. Products fit exactly in the safe integer range.',
  '(a){let out=Array(a.length).fill(1),p=1;for(let i=0;i<a.length;i++){out[i]=p;p*=a[i];}p=1;for(let i=a.length-1;i>=0;i--){out[i]*=p;p*=a[i];}return out;}',
  '(a):\n    out = [1]*len(a)\n    p = 1\n    for i,x in enumerate(a):\n        out[i] = p\n        p *= x\n    p = 1\n    for i in range(len(a)-1,-1,-1):\n        out[i] *= p\n        p *= a[i]\n    return out',
  [
    [[[1, 2, 3, 4]], [24, 12, 8, 6]],
    [[[0, 2, 0]], [0, 0, 0]],
    [[[5]], [1]],
  ],
  ['O(n)', 'O(1) excluding output'],
  'Multiply the product strictly before each position by the product strictly after it. Two zeros are naturally handled without division.',
);
add(
  'Equilibrium index',
  'Prefix sums',
  'Return the first index with equal sums strictly to its left and right; return -1 if absent.',
  '(a){let total=a.reduce((s,x)=>s+x,0),left=0;for(let i=0;i<a.length;i++){if(left===total-left-a[i])return i;left+=a[i];}return -1;}',
  '(a):\n    total = sum(a)\n    left = 0\n    for i,x in enumerate(a):\n        if left == total-left-x: return i\n        left += x\n    return -1',
  [
    [[[1, 7, 3, 6, 5, 6]], 3],
    [[[2, 1, -1]], 0],
    [[[]], -1],
  ],
  ['O(n)', 'O(1)'],
  'At index i, subtract the current value and the running left sum from the total to recover the right sum.',
  'Easy',
);
add(
  'Rotate without mutation',
  'Arrays and strings',
  'Return the array rotated right by nonnegative k positions without modifying the input.',
  '(a,k){if(!a.length)return [];k%=a.length;return a.slice(a.length-k).concat(a.slice(0,a.length-k));}',
  '(a,k):\n    if not a: return []\n    k %= len(a)\n    return a[-k:]+a[:-k] if k else a[:]',
  [
    [
      [[1, 2, 3, 4], 1],
      [4, 1, 2, 3],
    ],
    [
      [[1, 2], 4],
      [1, 2],
    ],
    [[[], 3], []],
  ],
  ['O(n)', 'O(n)'],
  'Only k modulo n matters. Split at n-k and concatenate the suffix with the prefix.',
  'Easy',
);
add(
  'Merge closed intervals',
  'Intervals',
  'Merge overlapping closed intervals [start,end] and return them in ascending start order. Touching endpoints overlap.',
  '(a){const v=a.map(x=>[...x]).sort((x,y)=>x[0]-y[0]),out=[];for(const x of v){let last=out.at(-1);if(last&&x[0]<=last[1])last[1]=Math.max(last[1],x[1]);else out.push(x);}return out;}',
  '(a):\n    out = []\n    for s,e in sorted(a):\n        if out and s <= out[-1][1]: out[-1][1] = max(e,out[-1][1])\n        else: out.append([s,e])\n    return out',
  [
    [
      [
        [
          [1, 3],
          [2, 6],
          [8, 10],
        ],
      ],
      [
        [1, 6],
        [8, 10],
      ],
    ],
    [
      [
        [
          [1, 2],
          [2, 3],
        ],
      ],
      [[1, 3]],
    ],
    [[[]], []],
  ],
  ['O(n log n)', 'O(n)'],
  'After sorting starts, only the last merged interval can overlap the next one. Use a non-strict comparison for closed endpoints.',
);
add(
  'Duplicate within reach',
  'Hash maps',
  'Return whether two equal numbers occur at different indices at most k apart. k is nonnegative.',
  '(a,k){const seen=new Map();for(let i=0;i<a.length;i++){if(seen.has(a[i])&&i-seen.get(a[i])<=k)return true;seen.set(a[i],i);}return false;}',
  '(a,k):\n    seen = {}\n    for i,x in enumerate(a):\n        if x in seen and i-seen[x] <= k: return True\n        seen[x] = i\n    return False',
  [
    [[[1, 2, 3, 1], 3], true],
    [[[1, 2, 1], 1], false],
    [[[1, 1], 0], false],
  ],
  ['O(n)', 'O(n)'],
  'The most recent previous occurrence is always the closest. Overwrite old indices after testing.',
  'Easy',
);
add(
  'Immutable range totals',
  'Prefix sums',
  'Given an array and inclusive [left,right] queries, return each range sum. Every query is valid.',
  '(a,queries){const p=[0];for(const x of a)p.push(p.at(-1)+x);return queries.map(([l,r])=>p[r+1]-p[l]);}',
  '(a,queries):\n    p = [0]\n    for x in a: p.append(p[-1]+x)\n    return [p[r+1]-p[l] for l,r in queries]',
  [
    [
      [
        [2, -1, 4],
        [
          [0, 2],
          [1, 1],
        ],
      ],
      [5, -1],
    ],
    [[[0], [[0, 0]]], [0]],
    [[[], []], []],
  ],
  ['O(n+q)', 'O(n)'],
  'Use an initial zero prefix, so inclusive ranges are p[right+1]-p[left] with no special case at zero.',
  'Easy',
);
add(
  'Group anagrams',
  'Hash maps',
  'Group lowercase words that are anagrams. Preserve group order by first appearance and word order within each group.',
  '(words){const m=new Map();for(const w of words){const k=[...w].sort().join("");if(!m.has(k))m.set(k,[]);m.get(k).push(w);}return [...m.values()];}',
  '(words):\n    groups = {}\n    for w in words: groups.setdefault("".join(sorted(w)),[]).append(w)\n    return list(groups.values())',
  [
    [
      [['eat', 'tea', 'tan', 'ate', 'nat']],
      [
        ['eat', 'tea', 'ate'],
        ['tan', 'nat'],
      ],
    ],
    [[['', '']], [['', '']]],
    [[[]], []],
  ],
  ['O(total characters * log longest word)', 'O(total characters)'],
  'Canonical sorted letters identify an equivalence class; insertion-ordered maps preserve the required output order.',
);
add(
  'Clean palindrome',
  'Two pointers',
  'Return whether an ASCII string is a palindrome when non-alphanumeric characters and case are ignored.',
  '(s){const x=s.toLowerCase().replace(/[^a-z0-9]/g,"");let l=0,r=x.length-1;while(l<r)if(x[l++]!==x[r--])return false;return true;}',
  '(s):\n    x = "".join(c.lower() for c in s if c.isascii() and c.isalnum())\n    return x == x[::-1]',
  [
    [['A man, a plan, a canal: Panama!'], true],
    [['race a car'], false],
    [['!?'], true],
  ],
  ['O(n)', 'O(n)'],
  'Normalization and comparison are separate concerns. A production variant can skip punctuation in-place with two boundaries.',
  'Easy',
);
add(
  'Zero-sum triples',
  'Two pointers',
  'Return unique value triples summing to zero. Each triple and the overall list must be sorted ascending lexicographically.',
  '(a){a=[...a].sort((x,y)=>x-y);const out=[];for(let i=0;i<a.length-2;i++){if(i&&a[i]===a[i-1])continue;let l=i+1,r=a.length-1;while(l<r){const s=a[i]+a[l]+a[r];if(s===0){out.push([a[i],a[l],a[r]]);let x=a[l],y=a[r];while(l<r&&a[l]===x)l++;while(l<r&&a[r]===y)r--;}else if(s<0)l++;else r--;}}return out;}',
  '(a):\n    a = sorted(a)\n    out = []\n    for i in range(len(a)-2):\n        if i and a[i] == a[i-1]: continue\n        l,r = i+1,len(a)-1\n        while l<r:\n            s = a[i]+a[l]+a[r]\n            if s==0:\n                out.append([a[i],a[l],a[r]])\n                x,y = a[l],a[r]\n                while l<r and a[l]==x: l+=1\n                while l<r and a[r]==y: r-=1\n            elif s<0: l+=1\n            else: r-=1\n    return out',
  [
    [
      [[-1, 0, 1, 2, -1, -4]],
      [
        [-1, -1, 2],
        [-1, 0, 1],
      ],
    ],
    [[[0, 0, 0, 0]], [[0, 0, 0]]],
    [[[1, 2]], []],
  ],
  ['O(n²)', 'O(n) excluding output'],
  'Fix the smallest index, then use sorted monotonicity to move the remaining boundaries. Skip equal values to avoid duplicate triples.',
);
add(
  'Sorted pair indices',
  'Two pointers',
  'Given a sorted ascending array and target, return zero-based indices of a matching pair. Move the leftmost/rightmost boundaries inward; return [] if absent.',
  '(a,target){let l=0,r=a.length-1;while(l<r){const s=a[l]+a[r];if(s===target)return [l,r];if(s<target)l++;else r--;}return [];}',
  '(a,target):\n    l,r = 0,len(a)-1\n    while l<r:\n        s = a[l]+a[r]\n        if s==target: return [l,r]\n        if s<target: l+=1\n        else: r-=1\n    return []',
  [
    [
      [[1, 2, 4, 7], 9],
      [1, 3],
    ],
    [
      [[1, 1], 2],
      [0, 1],
    ],
    [[[1], 2], []],
  ],
  ['O(n)', 'O(1)'],
  'When a sum is too small, every pair using the current smallest value and a smaller right endpoint is also too small.',
);
add(
  'Compact sorted values',
  'Two pointers',
  'Return the distinct values of a sorted array in ascending order without using a set.',
  '(a){const out=[];for(const x of a)if(!out.length||out.at(-1)!==x)out.push(x);return out;}',
  '(a):\n    out = []\n    for x in a:\n        if not out or out[-1]!=x: out.append(x)\n    return out',
  [
    [[[1, 1, 2, 3, 3]], [1, 2, 3]],
    [[[0, 0]], [0]],
    [[[]], []],
  ],
  ['O(n)', 'O(n) output'],
  'Sorted equal values are adjacent, so the last emitted value is the only duplicate comparison needed.',
  'Easy',
);
add(
  'Smallest qualifying span',
  'Sliding window',
  'Given positive integers and a positive target, return the minimum contiguous subarray length with sum at least target, or 0.',
  '(a,t){let l=0,s=0,b=Infinity;for(let r=0;r<a.length;r++){s+=a[r];while(s>=t){b=Math.min(b,r-l+1);s-=a[l++];}}return b===Infinity?0:b;}',
  '(a,t):\n    l=s=0\n    best = len(a)+1\n    for r,x in enumerate(a):\n        s+=x\n        while s>=t:\n            best=min(best,r-l+1)\n            s-=a[l]\n            l+=1\n    return best if best<=len(a) else 0',
  [
    [[[2, 3, 1, 2, 4, 3], 7], 2],
    [[[1, 1], 3], 0],
    [[[8], 7], 1],
  ],
  ['O(n)', 'O(1)'],
  'Strict positivity makes removing the left item decrease the sum. This monotonicity is essential; negative values invalidate this strategy.',
);
add(
  'Window maxima',
  'Stacks and queues',
  'Return the maximum for each window of width k. k is valid when the input is nonempty; return [] for empty input.',
  '(a,k){let q=[],head=0,out=[];for(let i=0;i<a.length;i++){while(q.length>head&&q[head]<=i-k)head++;while(q.length>head&&a[q.at(-1)]<=a[i])q.pop();q.push(i);if(i>=k-1)out.push(a[q[head]]);}return out;}',
  '(a,k):\n    from collections import deque\n    q = deque()\n    out = []\n    for i,x in enumerate(a):\n        while q and q[0]<=i-k: q.popleft()\n        while q and a[q[-1]]<=x: q.pop()\n        q.append(i)\n        if i>=k-1: out.append(a[q[0]])\n    return out',
  [
    [
      [[1, 3, -1, -3, 5, 3, 6, 7], 3],
      [3, 3, 5, 5, 6, 7],
    ],
    [
      [[2, 2], 1],
      [2, 2],
    ],
    [[[], 1], []],
  ],
  ['O(n)', 'O(n) JS / O(k) Python'],
  'Maintain candidate indices with decreasing values. An older smaller value can never win against a newer larger value before it expires.',
  'Hard',
);
add(
  'Balanced delimiters',
  'Stacks and queues',
  'Return whether a string made only of ()[]{} is properly nested.',
  '(s){const stack=[],pairs={")":"(","]":"[","}":"{"};for(const c of s){if("([{".includes(c))stack.push(c);else if(stack.pop()!==pairs[c])return false;}return stack.length===0;}',
  '(s):\n    stack=[]\n    pairs={")":"(","]":"[","}":"{"}\n    for c in s:\n        if c in "([{": stack.append(c)\n        elif not stack or stack.pop()!=pairs[c]: return False\n    return not stack',
  [
    [['([]){}'], true],
    [['([)]'], false],
    [[''], true],
  ],
  ['O(n)', 'O(n)'],
  'The next closing delimiter must match the most recently opened unclosed delimiter. Matching total counts alone cannot prove nesting.',
  'Easy',
);
add(
  'Next larger value',
  'Stacks and queues',
  'For each element, return the next strictly larger value to its right, or -1.',
  '(a){const out=Array(a.length).fill(-1),s=[];for(let i=0;i<a.length;i++){while(s.length&&a[s.at(-1)]<a[i])out[s.pop()]=a[i];s.push(i);}return out;}',
  '(a):\n    out=[-1]*len(a)\n    s=[]\n    for i,x in enumerate(a):\n        while s and a[s[-1]]<x: out[s.pop()]=x\n        s.append(i)\n    return out',
  [
    [[[2, 1, 3, 2]], [3, 3, -1, -1]],
    [[[2, 2]], [-1, -1]],
    [[[]], []],
  ],
  ['O(n)', 'O(n)'],
  'Keep unresolved indices. A new larger item resolves every smaller suffix candidate once, giving amortized linear work.',
);
add(
  'Warmer day waits',
  'Stacks and queues',
  'Return how many days until a strictly warmer temperature for each day; use 0 when none exists.',
  '(a){const out=Array(a.length).fill(0),s=[];for(let i=0;i<a.length;i++){while(s.length&&a[s.at(-1)]<a[i]){let j=s.pop();out[j]=i-j;}s.push(i);}return out;}',
  '(a):\n    out=[0]*len(a)\n    s=[]\n    for i,x in enumerate(a):\n        while s and a[s[-1]]<x:\n            j=s.pop()\n            out[j]=i-j\n        s.append(i)\n    return out',
  [
    [[[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]],
    [[[30, 30]], [0, 0]],
    [[[]], []],
  ],
  ['O(n)', 'O(n)'],
  'Store positions rather than values because the output is a distance. Equal temperatures must remain unresolved.',
);
add(
  'Queue command trace',
  'Stacks and queues',
  'Process ["push",value], ["pop"], and ["peek"] commands as a FIFO queue. Return outputs for pop/peek; an empty result is null.',
  '(ops){const input=[],output=[],ans=[];for(const [op,x]of ops){if(op==="push")input.push(x);else{if(!output.length)while(input.length)output.push(input.pop());ans.push(output.length?(op==="pop"?output.pop():output.at(-1)):null);}}return ans;}',
  '(ops):\n    incoming=[]\n    outgoing=[]\n    ans=[]\n    for op,*rest in ops:\n        if op=="push": incoming.append(rest[0])\n        else:\n            if not outgoing:\n                while incoming: outgoing.append(incoming.pop())\n            ans.append((outgoing.pop() if op=="pop" else outgoing[-1]) if outgoing else None)\n    return ans',
  [
    [[[['push', 1], ['push', 2], ['peek'], ['pop'], ['pop']]], [1, 1, 2]],
    [[[['pop']]], [null]],
    [[[]], []],
  ],
  ['O(1) amortized per command', 'O(n)'],
  'Transfer from the incoming stack only when the outgoing stack empties. Each element moves between containers at most once.',
);
add(
  'Reverse a linked chain',
  'Linked lists',
  'A chain is represented by nodes [[value,nextIndex],...] and a head index (-1 for empty). Return values encountered from head in reverse order. The chain is acyclic.',
  '(nodes,head){let prev=null;while(head!==-1){prev={value:nodes[head][0],next:prev};head=nodes[head][1];}const out=[];while(prev){out.push(prev.value);prev=prev.next;}return out;}',
  '(nodes,head):\n    prev=None\n    while head!=-1:\n        prev=(nodes[head][0],prev)\n        head=nodes[head][1]\n    out=[]\n    while prev:\n        out.append(prev[0])\n        prev=prev[1]\n    return out',
  [
    [
      [
        [
          [1, 1],
          [2, 2],
          [3, -1],
        ],
        0,
      ],
      [3, 2, 1],
    ],
    [[[[7, -1]], 0], [7]],
    [[[], -1], []],
  ],
  ['O(n)', 'O(n) immutable copy'],
  'Preserve the old next link before moving forward. This immutable representation copies nodes; an in-place pointer reversal would need only constant auxiliary space.',
);
add(
  'Linked cycle entry',
  'Linked lists',
  'Given next indices for nodes and a head index, return the index where its reachable cycle begins, or -1 if it ends. -1 is the null link.',
  '(next,head){let slow=head,fast=head;while(fast!==-1&&next[fast]!==-1){slow=next[slow];fast=next[next[fast]];if(slow===fast){let p=head;while(p!==slow){p=next[p];slow=next[slow];}return p;}}return -1;}',
  '(nxt,head):\n    slow=fast=head\n    while fast!=-1 and nxt[fast]!=-1:\n        slow=nxt[slow]\n        fast=nxt[nxt[fast]]\n        if slow==fast:\n            p=head\n            while p!=slow:\n                p=nxt[p]\n                slow=nxt[slow]\n            return p\n    return -1',
  [
    [[[1, 2, 3, 1], 0], 1],
    [[[1, -1], 0], -1],
    [[[], -1], -1],
  ],
  ['O(n)', 'O(1)'],
  'A fast and slow pointer meet inside a cycle. Reset one to the head and advance both one step; their next meeting is the entry.',
);
add(
  'Nested tree depth',
  'Trees and BSTs',
  'A binary tree is null or [value,left,right]. Return its maximum node depth (empty tree = 0).',
  '(t){return t===null?0:1+Math.max(solve(t[1]),solve(t[2]));}',
  '(t):\n    return 0 if t is None else 1+max(solve(t[1]),solve(t[2]))',
  [
    [[[1, [2, null, null], [3, [4, null, null], null]]], 3],
    [[[1, null, null]], 1],
    [[null], 0],
  ],
  ['O(n)', 'O(height)'],
  'The answer for a node is one plus the larger child depth. Count nodes rather than edges consistently.',
  'Easy',
);
add(
  'Inorder traversal',
  'Trees and BSTs',
  'Return the inorder values of a binary tree represented as null or [value,left,right].',
  '(t){const out=[],s=[];let cur=t;while(cur||s.length){while(cur){s.push(cur);cur=cur[1];}cur=s.pop();out.push(cur[0]);cur=cur[2];}return out;}',
  '(t):\n    out=[]\n    stack=[]\n    while t or stack:\n        while t:\n            stack.append(t)\n            t=t[1]\n        t=stack.pop()\n        out.append(t[0])\n        t=t[2]\n    return out',
  [
    [[[2, [1, null, null], [3, null, null]]], [1, 2, 3]],
    [[[9, null, null]], [9]],
    [[null], []],
  ],
  ['O(n)', 'O(height)'],
  'An explicit stack simulates suspended recursive calls. Visit a node only after its left subtree has been exhausted.',
);
add(
  'Height-balanced tree',
  'Trees and BSTs',
  'Return whether every node in a nested binary tree has child heights differing by at most one.',
  '(t){function height(n){if(!n)return 0;let l=height(n[1]),r=height(n[2]);return l<0||r<0||Math.abs(l-r)>1?-1:1+Math.max(l,r);}return height(t)>=0;}',
  '(t):\n    def height(n):\n        if n is None: return 0\n        l,r=height(n[1]),height(n[2])\n        return -1 if l<0 or r<0 or abs(l-r)>1 else 1+max(l,r)\n    return height(t)>=0',
  [
    [[[1, [2, null, null], [3, null, null]]], true],
    [[[1, [2, [3, null, null], null], null]], false],
    [[null], true],
  ],
  ['O(n)', 'O(height)'],
  'Return a failure sentinel alongside height to avoid recomputing descendant depths for every ancestor.',
);
add(
  'Tree diameter in edges',
  'Trees and BSTs',
  'Return the maximum number of edges on a path between any two nodes of a nested binary tree.',
  '(t){let best=0;function depth(n){if(!n)return 0;let l=depth(n[1]),r=depth(n[2]);best=Math.max(best,l+r);return 1+Math.max(l,r);}depth(t);return best;}',
  '(t):\n    best=0\n    def depth(n):\n        nonlocal best\n        if n is None: return 0\n        l,r=depth(n[1]),depth(n[2])\n        best=max(best,l+r)\n        return 1+max(l,r)\n    depth(t)\n    return best',
  [
    [[[1, [2, [4, null, null], [5, null, null]], [3, null, null]]], 3],
    [[[1, null, null]], 0],
    [[null], 0],
  ],
  ['O(n)', 'O(height)'],
  'The longest path through a node joins its two deepest child paths. Its endpoints need not include the root.',
);
add(
  'BST rank selection',
  'Trees and BSTs',
  'Given a binary search tree with distinct values and one-based k, return its kth smallest value, or null when out of range.',
  '(t,k){let s=[];while(t||s.length){while(t){s.push(t);t=t[1];}t=s.pop();if(--k===0)return t[0];t=t[2];}return null;}',
  '(t,k):\n    stack=[]\n    while t or stack:\n        while t:\n            stack.append(t)\n            t=t[1]\n        t=stack.pop()\n        k-=1\n        if k==0: return t[0]\n        t=t[2]\n    return None',
  [
    [[[2, [1, null, null], [3, null, null]], 2], 2],
    [[[1, null, null], 2], null],
    [[null, 1], null],
  ],
  ['O(height+k) bounded by n', 'O(height)'],
  'Inorder traversal of a BST is sorted. Stop when the visit count reaches k rather than collecting the whole tree.',
);
add(
  'Frequent values',
  'Heaps',
  'Return the k most frequent integers, ordered by decreasing frequency then increasing value. k may exceed the number of distinct values.',
  '(a,k){const m=new Map();for(const x of a)m.set(x,(m.get(x)||0)+1);return [...m.keys()].sort((x,y)=>m.get(y)-m.get(x)||x-y).slice(0,k);}',
  '(a,k):\n    from collections import Counter\n    c=Counter(a)\n    return sorted(c,key=lambda x:(-c[x],x))[:k]',
  [
    [
      [[1, 1, 2, 2, 3], 2],
      [1, 2],
    ],
    [[[9], 4], [9]],
    [[[], 1], []],
  ],
  ['O(n+u log u)', 'O(u)'],
  'Count occurrences before ranking. Sorting all unique values is simple; a size-k heap improves selection to O(u log k) when k is small.',
);
add(
  'Kth largest stream',
  'Heaps',
  'Return the kth largest element counting duplicates, or null for invalid k. Do not mutate the input.',
  '(a,k){if(k<1||k>a.length)return null;const h=[];for(const x of a){h.push(x);let i=h.length-1;while(i>0){let p=(i-1)>>1;if(h[p]<=h[i])break;[h[p],h[i]]=[h[i],h[p]];i=p;}if(h.length>k){h[0]=h.pop();i=0;while(2*i+1<h.length){let c=2*i+1;if(c+1<h.length&&h[c+1]<h[c])c++;if(h[i]<=h[c])break;[h[i],h[c]]=[h[c],h[i]];i=c;}}}return h[0];}',
  '(a,k):\n    import heapq\n    if k<1 or k>len(a): return None\n    h=[]\n    for x in a:\n        heapq.heappush(h,x)\n        if len(h)>k: heapq.heappop(h)\n    return h[0]',
  [
    [[[3, 2, 1, 5, 6, 4], 2], 5],
    [[[2, 2, 1], 2], 2],
    [[[], 1], null],
  ],
  ['O(n log(k+1))', 'O(k)'],
  'A bounded min-heap keeps exactly the k largest items seen so far. Its root is the smallest retained item and thus the kth largest overall.',
);
add(
  'Merge sorted streams',
  'Heaps',
  'Return the sorted merge of several ascending integer arrays, preserving duplicates.',
  '(lists){const idx=lists.map(()=>0),out=[];while(true){let pick=-1;for(let i=0;i<lists.length;i++)if(idx[i]<lists[i].length&&(pick<0||lists[i][idx[i]]<lists[pick][idx[pick]]))pick=i;if(pick<0)break;out.push(lists[pick][idx[pick]++]);}return out;}',
  '(lists):\n    import heapq\n    return list(heapq.merge(*lists))',
  [
    [[[[1, 4], [2, 3], []]], [1, 2, 3, 4]],
    [[[[], []]], []],
    [[[[1], [1]]], [1, 1]],
  ],
  ['JS O(Nk); Python O(N log k)', 'O(k) excluding output'],
  'Compare the smallest unconsumed item of each stream. A heap replaces the linear scan with a logarithmic update; the two implementations illustrate the tradeoff.',
);
add(
  'Unweighted distances',
  'Graph BFS and DFS',
  'Given adjacency lists and a source, return shortest edge-count distances; unreachable vertices get -1. The source is valid.',
  '(g,s){let d=Array(g.length).fill(-1),q=[s];d[s]=0;for(let i=0;i<q.length;i++)for(const v of g[q[i]])if(d[v]<0){d[v]=d[q[i]]+1;q.push(v);}return d;}',
  '(g,s):\n    from collections import deque\n    d=[-1]*len(g)\n    d[s]=0\n    q=deque([s])\n    while q:\n        u=q.popleft()\n        for v in g[u]:\n            if d[v]<0:\n                d[v]=d[u]+1\n                q.append(v)\n    return d',
  [
    [
      [[[1, 2], [3], [3], [], []], 0],
      [0, 1, 1, 2, -1],
    ],
    [[[[]], 0], [0]],
    [
      [[[1], [0]], 1],
      [1, 0],
    ],
  ],
  ['O(V+E)', 'O(V)'],
  'Mark a vertex when enqueuing it, not when removing it. FIFO exploration guarantees the first discovered path has the fewest edges.',
);
add(
  'Nonnegative shortest paths',
  'Dijkstra',
  'Given n vertices, directed [from,to,weight] edges with nonnegative weights, and a source, return shortest distances, using -1 for unreachable vertices.',
  '(n,edges,s){const d=Array(n).fill(Infinity),used=Array(n).fill(false);d[s]=0;for(let i=0;i<n;i++){let u=-1;for(let j=0;j<n;j++)if(!used[j]&&(u<0||d[j]<d[u]))u=j;if(u<0||d[u]===Infinity)break;used[u]=true;for(const [a,b,w]of edges)if(a===u)d[b]=Math.min(d[b],d[u]+w);}return d.map(x=>x===Infinity?-1:x);}',
  '(n,edges,s):\n    import heapq\n    g=[[] for _ in range(n)]\n    for a,b,w in edges: g[a].append((b,w))\n    d=[float("inf")]*n\n    d[s]=0\n    q=[(0,s)]\n    while q:\n        dist,u=heapq.heappop(q)\n        if dist!=d[u]: continue\n        for v,w in g[u]:\n            if dist+w<d[v]:\n                d[v]=dist+w\n                heapq.heappush(q,(d[v],v))\n    return [-1 if x==float("inf") else x for x in d]',
  [
    [
      [
        4,
        [
          [0, 1, 2],
          [0, 2, 7],
          [1, 2, 1],
        ],
        0,
      ],
      [0, 2, 3, -1],
    ],
    [[1, [], 0], [0]],
    [
      [2, [[0, 1, 0]], 0],
      [0, 0],
    ],
  ],
  ['JS O(V²+VE); Python O((V+E) log V)', 'O(V+E)'],
  'Finalize the least tentative distance because nonnegative edges cannot later produce a shorter route through a farther vertex. Skip stale heap entries.',
  'Hard',
);
add(
  'Two-color constraints',
  'Graph BFS and DFS',
  'Return whether an undirected graph in adjacency-list form is bipartite, including disconnected components.',
  '(g){const c=Array(g.length).fill(-1);for(let s=0;s<g.length;s++)if(c[s]<0){c[s]=0;const q=[s];for(let i=0;i<q.length;i++)for(const v of g[q[i]]){if(c[v]<0){c[v]=c[q[i]]^1;q.push(v);}else if(c[v]===c[q[i]])return false;}}return true;}',
  '(g):\n    from collections import deque\n    c=[-1]*len(g)\n    for s in range(len(g)):\n        if c[s]>=0: continue\n        c[s]=0\n        q=deque([s])\n        while q:\n            u=q.popleft()\n            for v in g[u]:\n                if c[v]<0:\n                    c[v]=c[u]^1\n                    q.append(v)\n                elif c[v]==c[u]: return False\n    return True',
  [
    [
      [
        [
          [1, 3],
          [0, 2],
          [1, 3],
          [0, 2],
        ],
      ],
      true,
    ],
    [
      [
        [
          [1, 2],
          [0, 2],
          [0, 1],
        ],
      ],
      false,
    ],
    [[[]], true],
  ],
  ['O(V+E)', 'O(V)'],
  'Every edge requires opposite colors. Restart traversal at uncolored vertices, because one successful connected component proves nothing about the rest.',
);
add(
  'Dependency order',
  'Topological sort',
  'Given n tasks and prerequisite edges [before,after], return the lexicographically smallest valid task order, or [] if cyclic.',
  '(n,edges){const g=Array.from({length:n},()=>[]),d=Array(n).fill(0),out=[];for(const [a,b]of edges){g[a].push(b);d[b]++;}const ready=[];for(let i=0;i<n;i++)if(!d[i])ready.push(i);while(ready.length){ready.sort((a,b)=>a-b);const u=ready.shift();out.push(u);for(const v of g[u])if(--d[v]===0)ready.push(v);}return out.length===n?out:[];}',
  '(n,edges):\n    import heapq\n    g=[[] for _ in range(n)]\n    d=[0]*n\n    for a,b in edges:\n        g[a].append(b)\n        d[b]+=1\n    q=[i for i in range(n) if d[i]==0]\n    heapq.heapify(q)\n    out=[]\n    while q:\n        u=heapq.heappop(q)\n        out.append(u)\n        for v in g[u]:\n            d[v]-=1\n            if d[v]==0: heapq.heappush(q,v)\n    return out if len(out)==n else []',
  [
    [
      [
        4,
        [
          [0, 2],
          [1, 2],
          [2, 3],
        ],
      ],
      [0, 1, 2, 3],
    ],
    [
      [
        2,
        [
          [0, 1],
          [1, 0],
        ],
      ],
      [],
    ],
    [[0, []], []],
  ],
  ['JS O(V² log V+E); Python O(E+V log V)', 'O(V+E)'],
  'Only zero-indegree tasks are safe to choose. If fewer than n tasks are removed, a cycle leaves some prerequisites permanently unsatisfied.',
);
add(
  'Connected components',
  'Union-find',
  'Given n vertices and undirected edges, return the number of connected components, including isolated vertices.',
  '(n,edges){const p=Array.from({length:n},(_,i)=>i);function find(x){while(p[x]!==x){p[x]=p[p[x]];x=p[x];}return x;}let count=n;for(const [a,b]of edges){let x=find(a),y=find(b);if(x!==y){p[x]=y;count--;}}return count;}',
  '(n,edges):\n    p=list(range(n))\n    size=[1]*n\n    def find(x):\n        while p[x]!=x:\n            p[x]=p[p[x]]\n            x=p[x]\n        return x\n    count=n\n    for a,b in edges:\n        x,y=find(a),find(b)\n        if x!=y:\n            if size[x]<size[y]: x,y=y,x\n            p[y]=x\n            size[x]+=size[y]\n            count-=1\n    return count',
  [
    [
      [
        5,
        [
          [0, 1],
          [1, 2],
          [3, 4],
        ],
      ],
      2,
    ],
    [[3, []], 3],
    [[0, []], 0],
  ],
  ['JS O((V+E) log V) amortized; Python O((V+E) α(V))', 'O(V)'],
  'Each successful union reduces the component count by one. Repeated or redundant edges must not decrement it.',
);
add(
  'First redundant edge',
  'Union-find',
  'Return the first undirected edge that connects vertices already connected by earlier edges, or []. Vertices are 0..n-1.',
  '(n,edges){const p=Array.from({length:n},(_,i)=>i);function f(x){return p[x]===x?x:p[x]=f(p[x]);}for(const [a,b]of edges){let x=f(a),y=f(b);if(x===y)return [a,b];p[x]=y;}return [];}',
  '(n,edges):\n    p=list(range(n))\n    def find(x):\n        while p[x]!=x:\n            p[x]=p[p[x]]\n            x=p[x]\n        return x\n    for a,b in edges:\n        x,y=find(a),find(b)\n        if x==y: return [a,b]\n        p[x]=y\n    return []',
  [
    [
      [
        3,
        [
          [0, 1],
          [1, 2],
          [0, 2],
        ],
      ],
      [0, 2],
    ],
    [[2, [[0, 1]]], []],
    [
      [1, [[0, 0]]],
      [0, 0],
    ],
  ],
  ['O((V+E) log V) amortized', 'O(V)'],
  'An edge closes a cycle exactly when its endpoints have the same representative before the union.',
);
add(
  'Prefix dictionary',
  'Tries',
  'Given distinct words and prefix queries, return how many words begin with each prefix. Empty prefix matches every word.',
  '(words,queries){const root={count:0,next:new Map()};for(const word of words){let node=root;node.count++;for(const c of word){if(!node.next.has(c))node.next.set(c,{count:0,next:new Map()});node=node.next.get(c);node.count++;}}return queries.map(q=>{let node=root;for(const c of q){node=node.next.get(c);if(!node)return 0;}return node.count;});}',
  '(words,queries):\n    root={"count":0,"next":{}}\n    for word in words:\n        node=root\n        node["count"]+=1\n        for c in word:\n            node=node["next"].setdefault(c,{"count":0,"next":{}})\n            node["count"]+=1\n    out=[]\n    for q in queries:\n        node=root\n        for c in q:\n            node=node["next"].get(c)\n            if node is None: break\n        out.append(node["count"] if node else 0)\n    return out',
  [
    [
      [
        ['car', 'cart', 'cat', 'dog'],
        ['ca', 'car', 'z', ''],
      ],
      [3, 2, 0, 4],
    ],
    [[[], ['a']], [0]],
    [[[''], ['']], [1]],
  ],
  ['O(total inserted and queried characters)', 'O(total inserted characters)'],
  'Each prefix node stores how many inserted words pass through it. Separate child maps from metadata to prevent key collisions.',
);
add(
  'Grid word path',
  'Recursion and backtracking',
  'Return whether a word can be formed by horizontal/vertical neighboring cells, without reusing a cell. Empty word is always present.',
  '(b,w){if(!w)return true;if(!b.length)return false;const used=new Set();function dfs(r,c,i){if(i===w.length)return true;const k=r+","+c;if(r<0||c<0||r>=b.length||c>=b[0].length||used.has(k)||b[r][c]!==w[i])return false;used.add(k);const ok=dfs(r+1,c,i+1)||dfs(r-1,c,i+1)||dfs(r,c+1,i+1)||dfs(r,c-1,i+1);used.delete(k);return ok;}for(let r=0;r<b.length;r++)for(let c=0;c<b[0].length;c++)if(dfs(r,c,0))return true;return false;}',
  '(b,w):\n    if not w: return True\n    if not b: return False\n    used=set()\n    def dfs(r,c,i):\n        if i==len(w): return True\n        if r<0 or c<0 or r>=len(b) or c>=len(b[0]) or (r,c) in used or b[r][c]!=w[i]: return False\n        used.add((r,c))\n        ok=any(dfs(r+dr,c+dc,i+1) for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)])\n        used.remove((r,c))\n        return ok\n    return any(dfs(r,c,0) for r in range(len(b)) for c in range(len(b[0])))',
  [
    [
      [
        [
          ['A', 'B'],
          ['C', 'D'],
        ],
        'ABD',
      ],
      true,
    ],
    [[[['A', 'B']], 'ABA'], false],
    [[[], ''], true],
  ],
  ['O(rows*cols*4^word length)', 'O(word length)'],
  'Mark a cell only for the current candidate path and undo the mark when returning. A global visited set would incorrectly prune other starting paths.',
);
add(
  'Distinct permutations',
  'Recursion and backtracking',
  'Return every permutation of distinct integers, sorted lexicographically.',
  '(a){a=[...a].sort((x,y)=>x-y);const out=[],used=Array(a.length).fill(false),path=[];function go(){if(path.length===a.length){out.push([...path]);return;}for(let i=0;i<a.length;i++)if(!used[i]){used[i]=true;path.push(a[i]);go();path.pop();used[i]=false;}}go();return out;}',
  '(a):\n    from itertools import permutations\n    return [list(p) for p in permutations(sorted(a))]',
  [
    [
      [[1, 2]],
      [
        [1, 2],
        [2, 1],
      ],
    ],
    [[[7]], [[7]]],
    [[[]], [[]]],
  ],
  ['O(n*n!)', 'O(n) excluding output'],
  'Choose an unused item, recurse, then undo the choice. Copy the path at leaves so later mutations do not rewrite previous results.',
);
add(
  'Power set',
  'Recursion and backtracking',
  'Return every subset of distinct integers. Sort values inside each subset and sort the result lexicographically (shorter prefix first).',
  '(a){a=[...a].sort((x,y)=>x-y);const out=[];function go(i,path){out.push([...path]);for(let j=i;j<a.length;j++){path.push(a[j]);go(j+1,path);path.pop();}}go(0,[]);return out;}',
  '(a):\n    a=sorted(a)\n    out=[]\n    def go(i,path):\n        out.append(path[:])\n        for j in range(i,len(a)):\n            path.append(a[j])\n            go(j+1,path)\n            path.pop()\n    go(0,[])\n    return out',
  [
    [[[2, 1]], [[], [1], [1, 2], [2]]],
    [[[3]], [[], [3]]],
    [[[]], [[]]],
  ],
  ['O(n*2^n)', 'O(n) excluding output'],
  'Advancing the candidate start index ensures each subset is produced once, without needing a deduplication set.',
);
add(
  'Reusable combination sum',
  'Recursion and backtracking',
  'Given distinct positive candidates and a nonnegative target, return sorted combinations summing to target. Values may be reused; output is lexicographic.',
  '(a,target){a=[...a].sort((x,y)=>x-y);const out=[];function go(i,left,p){if(left===0){out.push([...p]);return;}for(let j=i;j<a.length&&a[j]<=left;j++){p.push(a[j]);go(j,left-a[j],p);p.pop();}}go(0,target,[]);return out;}',
  '(a,target):\n    a=sorted(a)\n    out=[]\n    def go(i,left,path):\n        if left==0:\n            out.append(path[:])\n            return\n        for j in range(i,len(a)):\n            if a[j]>left: break\n            path.append(a[j])\n            go(j,left-a[j],path)\n            path.pop()\n    go(0,target,[])\n    return out',
  [
    [
      [[2, 3, 6, 7], 7],
      [[2, 2, 3], [7]],
    ],
    [[[4], 3], []],
    [[[2], 0], [[]]],
  ],
  ['O(k^(target/min value)) upper bound', 'O(target/min value) excluding output'],
  'Allow reuse by recursing with the same candidate index. Positivity guarantees the remaining target strictly decreases.',
);
add(
  'Generate balanced pairs',
  'Recursion and backtracking',
  'Return all valid strings of n parenthesis pairs, in lexicographic order. n is 0..8.',
  '(n){const out=[];function go(s,l,r){if(s.length===2*n){out.push(s);return;}if(l<n)go(s+"(",l+1,r);if(r<l)go(s+")",l,r+1);}go("",0,0);return out;}',
  '(n):\n    out=[]\n    def go(s,l,r):\n        if len(s)==2*n:\n            out.append(s)\n            return\n        if l<n: go(s+"(",l+1,r)\n        if r<l: go(s+")",l,r+1)\n    go("",0,0)\n    return out',
  [
    [[2], ['(())', '()()']],
    [[1], ['()']],
    [[0], ['']],
  ],
  ['O(n*Catalan(n))', 'O(n) excluding output'],
  'Never place a closing parenthesis unless an unmatched opening one exists. Prune invalid prefixes rather than filtering all binary strings.',
);
add(
  'Staircase counts',
  'Dynamic programming 1D',
  'Count ways to climb n steps using one or two steps at a time. There is one way to climb zero steps. n <= 40.',
  '(n){let a=1,b=1;for(let i=0;i<n;i++)[a,b]=[b,a+b];return a;}',
  '(n):\n    a=b=1\n    for _ in range(n): a,b=b,a+b\n    return a',
  [
    [[4], 5],
    [[1], 1],
    [[0], 1],
  ],
  ['O(n)', 'O(1)'],
  'Partition solutions by the last move: one step or two. The empty path is one valid construction, not zero.',
  'Easy',
);
add(
  'Nonadjacent rewards',
  'Dynamic programming 1D',
  'Return the maximum sum of nonadjacent nonnegative array values; choosing none is allowed.',
  '(a){let skip=0,take=0;for(const x of a)[skip,take]=[Math.max(skip,take),skip+x];return Math.max(skip,take);}',
  '(a):\n    skip=take=0\n    for x in a: skip,take=max(skip,take),skip+x\n    return max(skip,take)',
  [
    [[[2, 7, 9, 3, 1]], 12],
    [[[5]], 5],
    [[[]], 0],
  ],
  ['O(n)', 'O(1)'],
  'Taking this item requires skipping the previous one. Update both states from the old values, not an already overwritten state.',
);
add(
  'Fewest coins',
  'Dynamic programming 1D',
  'Given positive coin denominations and nonnegative amount, return the minimum number of coins needed, or -1. Coins are reusable.',
  '(coins,amount){const dp=Array(amount+1).fill(amount+1);dp[0]=0;for(let x=1;x<=amount;x++)for(const c of coins)if(c<=x)dp[x]=Math.min(dp[x],dp[x-c]+1);return dp[amount]>amount?-1:dp[amount];}',
  '(coins,amount):\n    dp=[amount+1]*(amount+1)\n    dp[0]=0\n    for x in range(1,amount+1):\n        for c in coins:\n            if c<=x: dp[x]=min(dp[x],dp[x-c]+1)\n    return -1 if dp[amount]>amount else dp[amount]',
  [
    [[[1, 2, 5], 11], 3],
    [[[2], 3], -1],
    [[[2], 0], 0],
  ],
  ['O(amount*coin count)', 'O(amount)'],
  'Define the optimal result for every smaller amount. Greedy largest-first fails for denominations such as 1, 3, 4.',
);
add(
  'Increasing subsequence length',
  'Dynamic programming LIS',
  'Return the length of a strictly increasing subsequence of maximum length.',
  '(a){const tails=[];for(const x of a){let l=0,r=tails.length;while(l<r){let m=(l+r)>>1;if(tails[m]<x)l=m+1;else r=m;}tails[l]=x;}return tails.length;}',
  '(a):\n    from bisect import bisect_left\n    tails=[]\n    for x in a:\n        i=bisect_left(tails,x)\n        if i==len(tails): tails.append(x)\n        else: tails[i]=x\n    return len(tails)',
  [
    [[[10, 9, 2, 5, 3, 7, 101, 18]], 4],
    [[[2, 2, 2]], 1],
    [[[]], 0],
  ],
  ['O(n log n)', 'O(n)'],
  'tails[length-1] is the smallest ending value achievable at that length. It is not necessarily itself a complete subsequence.',
  'Hard',
);
add(
  'Common subsequence length',
  'Dynamic programming 2D',
  'Return the longest common subsequence length of two ASCII strings (not necessarily contiguous).',
  '(a,b){let prev=Array(b.length+1).fill(0);for(const x of a){const cur=Array(b.length+1).fill(0);for(let j=1;j<=b.length;j++)cur[j]=x===b[j-1]?prev[j-1]+1:Math.max(prev[j],cur[j-1]);prev=cur;}return prev[b.length];}',
  '(a,b):\n    prev=[0]*(len(b)+1)\n    for x in a:\n        cur=[0]*(len(b)+1)\n        for j in range(1,len(b)+1): cur[j]=prev[j-1]+1 if x==b[j-1] else max(prev[j],cur[j-1])\n        prev=cur\n    return prev[-1]',
  [
    [['abcde', 'ace'], 3],
    [['abc', 'def'], 0],
    [['', 'a'], 0],
  ],
  ['O(mn)', 'O(n)'],
  'A match extends the diagonal state; a mismatch chooses which suffix character to omit. Rolling rows preserve just the necessary previous states.',
);
add(
  'Edit distance',
  'Dynamic programming 2D',
  'Return the minimum number of single-character insertions, deletions, and replacements to turn one ASCII string into another.',
  '(a,b){let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let c=[i];for(let j=1;j<=b.length;j++)c[j]=a[i-1]===b[j-1]?p[j-1]:1+Math.min(p[j],c[j-1],p[j-1]);p=c;}return p[b.length];}',
  '(a,b):\n    p=list(range(len(b)+1))\n    for i in range(1,len(a)+1):\n        c=[i]\n        for j in range(1,len(b)+1): c.append(p[j-1] if a[i-1]==b[j-1] else 1+min(p[j],c[j-1],p[j-1]))\n        p=c\n    return p[-1]',
  [
    [['horse', 'ros'], 3],
    [['', 'abc'], 3],
    [['same', 'same'], 0],
  ],
  ['O(mn)', 'O(n)'],
  'Each operation corresponds to one predecessor: delete from the source, insert into it, or replace. Empty-prefix distances initialize the edges.',
  'Hard',
);
add(
  'Zero-one knapsack',
  'Dynamic programming knapsack',
  'Given [weight,value] items and integer capacity, maximize value while using each positive-weight item at most once.',
  '(items,cap){const dp=Array(cap+1).fill(0);for(const [w,v]of items)for(let c=cap;c>=w;c--)dp[c]=Math.max(dp[c],dp[c-w]+v);return dp[cap];}',
  '(items,cap):\n    dp=[0]*(cap+1)\n    for w,v in items:\n        for c in range(cap,w-1,-1): dp[c]=max(dp[c],dp[c-w]+v)\n    return dp[cap]',
  [
    [
      [
        [
          [2, 3],
          [3, 4],
          [4, 5],
        ],
        5,
      ],
      7,
    ],
    [[[[2, 3]], 4], 3],
    [[[], 3], 0],
  ],
  ['O(items*capacity)', 'O(capacity)'],
  'Iterate capacity backward so the current item cannot feed a later state in the same pass. Forward iteration would make it reusable.',
);
add(
  'Grid paths with barriers',
  'Dynamic programming 2D',
  'A grid has 0 for open and 1 for blocked cells. Count right/down paths from top-left to bottom-right. Empty grid has zero paths.',
  '(g){if(!g.length||!g[0].length)return 0;const dp=Array(g[0].length).fill(0);dp[0]=1;for(const row of g)for(let c=0;c<row.length;c++)dp[c]=row[c]?0:dp[c]+(c?dp[c-1]:0);return dp.at(-1);}',
  '(g):\n    if not g or not g[0]: return 0\n    dp=[0]*len(g[0])\n    dp[0]=1\n    for row in g:\n        for c,x in enumerate(row): dp[c]=0 if x else dp[c]+(dp[c-1] if c else 0)\n    return dp[-1]',
  [
    [
      [
        [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0],
        ],
      ],
      2,
    ],
    [[[[1]]], 0],
    [[[]], 0],
  ],
  ['O(rows*cols)', 'O(cols)'],
  'At an open cell, paths arrive from above and left. Reset blocked states to zero rather than carrying the previous row through them.',
);
add(
  'Matrix chain cost',
  'Dynamic programming interval',
  'Given dimensions d, matrix i has shape d[i] by d[i+1]. Return the fewest scalar multiplications to multiply the chain. Fewer than two matrices cost zero.',
  '(d){const n=d.length-1;if(n<2)return 0;const dp=Array.from({length:n},()=>Array(n).fill(0));for(let len=2;len<=n;len++)for(let l=0;l+len<=n;l++){let r=l+len-1;dp[l][r]=Infinity;for(let k=l;k<r;k++)dp[l][r]=Math.min(dp[l][r],dp[l][k]+dp[k+1][r]+d[l]*d[k+1]*d[r+1]);}return dp[0][n-1];}',
  '(d):\n    n=len(d)-1\n    if n<2: return 0\n    dp=[[0]*n for _ in range(n)]\n    for size in range(2,n+1):\n        for l in range(n-size+1):\n            r=l+size-1\n            dp[l][r]=min(dp[l][k]+dp[k+1][r]+d[l]*d[k+1]*d[r+1] for k in range(l,r))\n    return dp[0][-1]',
  [
    [[[10, 30, 5, 60]], 4500],
    [[[10, 20]], 0],
    [[[]], 0],
  ],
  ['O(n³)', 'O(n²)'],
  'Choose the final multiplication split. Both child intervals are shorter, so fill by increasing interval length.',
  'Hard',
);
add(
  'Visit every city',
  'Dynamic programming bitmask',
  'Given a complete directed nonnegative cost matrix for n<=10 cities, start at 0, visit every city once, and return to 0. Return minimum cost; n<=1 costs 0.',
  '(w){let n=w.length;if(n<2)return 0;let dp=Array.from({length:1<<n},()=>Array(n).fill(Infinity));dp[1][0]=0;for(let mask=1;mask<(1<<n);mask++)for(let u=0;u<n;u++)if(dp[mask][u]<Infinity)for(let v=1;v<n;v++)if(!(mask&(1<<v)))dp[mask|(1<<v)][v]=Math.min(dp[mask|(1<<v)][v],dp[mask][u]+w[u][v]);return Math.min(...dp.at(-1).map((x,u)=>x+w[u][0]));}',
  '(w):\n    n=len(w)\n    if n<2: return 0\n    dp=[[float("inf")]*n for _ in range(1<<n)]\n    dp[1][0]=0\n    for mask in range(1,1<<n):\n        for u in range(n):\n            for v in range(1,n):\n                if not mask&(1<<v): dp[mask|(1<<v)][v]=min(dp[mask|(1<<v)][v],dp[mask][u]+w[u][v])\n    return min(dp[-1][u]+w[u][0] for u in range(n))',
  [
    [
      [
        [
          [0, 10, 15],
          [10, 0, 20],
          [15, 20, 0],
        ],
      ],
      45,
    ],
    [
      [
        [
          [0, 3],
          [4, 0],
        ],
      ],
      7,
    ],
    [[[[0]]], 0],
  ],
  ['O(n²*2^n)', 'O(n*2^n)'],
  'The visited set and final city fully determine a subproblem. A bitmask makes that set a compact table index.',
  'Hard',
);
add(
  'Minimum jumps',
  'Greedy',
  'a[i] is the maximum forward jump from i. Return the fewest jumps to reach the last index, or -1 if impossible. Empty input costs 0.',
  '(a){if(a.length<2)return 0;let end=0,far=0,jumps=0;for(let i=0;i<a.length-1;i++){far=Math.max(far,i+a[i]);if(i===end){if(far<=i)return -1;jumps++;end=far;if(end>=a.length-1)return jumps;}}return -1;}',
  '(a):\n    if len(a)<2: return 0\n    end=far=jumps=0\n    for i in range(len(a)-1):\n        far=max(far,i+a[i])\n        if i==end:\n            if far<=i: return -1\n            jumps+=1\n            end=far\n            if end>=len(a)-1: return jumps\n    return -1',
  [
    [[[2, 3, 1, 1, 4]], 2],
    [[[1, 0, 2]], -1],
    [[[]], 0],
  ],
  ['O(n)', 'O(1)'],
  'Each current reach interval is a breadth layer. Compute the farthest next-layer endpoint before committing another jump.',
);
add(
  'Circular fuel start',
  'Greedy',
  'Given equal-length gas and travel-cost arrays, return the start after the last negative running-balance segment, or -1 if total gas is insufficient. Empty input returns -1.',
  '(gas,cost){if(!gas.length)return -1;let total=0,tank=0,start=0;for(let i=0;i<gas.length;i++){let x=gas[i]-cost[i];total+=x;tank+=x;if(tank<0){start=i+1;tank=0;}}return total<0?-1:start%gas.length;}',
  '(gas,cost):\n    if not gas: return -1\n    total=tank=start=0\n    for i,(g,c) in enumerate(zip(gas,cost)):\n        total+=g-c\n        tank+=g-c\n        if tank<0:\n            start=i+1\n            tank=0\n    return -1 if total<0 else start%len(gas)',
  [
    [
      [
        [1, 2, 3, 4, 5],
        [3, 4, 5, 1, 2],
      ],
      3,
    ],
    [[[2], [3]], -1],
    [[[], []], -1],
  ],
  ['O(n)', 'O(1)'],
  'If the balance fails between start and i, no intermediate station in that segment can be a valid start. A nonnegative total ensures a surviving candidate works.',
);
add(
  'First not smaller',
  'Binary search patterns',
  'Return the first index in a sorted array whose value is >= target, or the array length.',
  '(a,t){let l=0,r=a.length;while(l<r){let m=l+Math.floor((r-l)/2);if(a[m]<t)l=m+1;else r=m;}return l;}',
  '(a,t):\n    l,r=0,len(a)\n    while l<r:\n        m=(l+r)//2\n        if a[m]<t: l=m+1\n        else: r=m\n    return l',
  [
    [[[1, 2, 2, 4], 2], 1],
    [[[1, 2], 9], 2],
    [[[], 3], 0],
  ],
  ['O(log n)', 'O(1)'],
  'Maintain a half-open interval [left,right). The answer is a boundary between values that fail the predicate and those that satisfy it.',
);
add(
  'Rotated search',
  'Binary search patterns',
  'Return the index of target in a rotated strictly ascending array of distinct integers, or -1.',
  '(a,t){let l=0,r=a.length-1;while(l<=r){let m=(l+r)>>1;if(a[m]===t)return m;if(a[l]<=a[m]){if(a[l]<=t&&t<a[m])r=m-1;else l=m+1;}else{if(a[m]<t&&t<=a[r])l=m+1;else r=m-1;}}return -1;}',
  '(a,t):\n    l,r=0,len(a)-1\n    while l<=r:\n        m=(l+r)//2\n        if a[m]==t: return m\n        if a[l]<=a[m]:\n            if a[l]<=t<a[m]: r=m-1\n            else: l=m+1\n        else:\n            if a[m]<t<=a[r]: l=m+1\n            else: r=m-1\n    return -1',
  [
    [[[4, 5, 6, 7, 0, 1, 2], 0], 4],
    [[[3, 1], 2], -1],
    [[[], 1], -1],
  ],
  ['O(log n)', 'O(1)'],
  'At least one half is sorted. Decide whether the target lies inside that sorted range before discarding half.',
);
add(
  'Integer square root',
  'Binary search patterns',
  'Return floor(sqrt(n)) for a nonnegative safe integer n <= 10^12, without using a square-root function.',
  '(n){let l=0,r=n+1;while(l+1<r){let m=Math.floor((l+r)/2);if(m<=n/m)l=m;else r=m;}return l;}',
  '(n):\n    l,r=0,n+1\n    while l+1<r:\n        m=(l+r)//2\n        if m*m<=n: l=m\n        else: r=m\n    return l',
  [
    [[8], 2],
    [[16], 4],
    [[0], 0],
  ],
  ['O(log n)', 'O(1)'],
  'Search the last integer satisfying x²<=n. Division can avoid multiplication overflow in fixed-width languages.',
);
add(
  'Insert an interval',
  'Intervals',
  'Insert a closed interval into sorted nonoverlapping closed intervals and merge overlaps. Return a fresh list.',
  '(a,x){const out=[];let i=0,s=x[0],e=x[1];while(i<a.length&&a[i][1]<s)out.push([...a[i++]]);while(i<a.length&&a[i][0]<=e){s=Math.min(s,a[i][0]);e=Math.max(e,a[i][1]);i++;}out.push([s,e]);while(i<a.length)out.push([...a[i++]]);return out;}',
  '(a,x):\n    out=[]\n    i=0\n    s,e=x\n    while i<len(a) and a[i][1]<s:\n        out.append(a[i][:])\n        i+=1\n    while i<len(a) and a[i][0]<=e:\n        s=min(s,a[i][0])\n        e=max(e,a[i][1])\n        i+=1\n    out.append([s,e])\n    return out+[v[:] for v in a[i:]]',
  [
    [
      [
        [
          [1, 3],
          [6, 9],
        ],
        [2, 5],
      ],
      [
        [1, 5],
        [6, 9],
      ],
    ],
    [[[], [2, 3]], [[2, 3]]],
    [[[[1, 2]], [2, 4]], [[1, 4]]],
  ],
  ['O(n)', 'O(n) output'],
  'Partition intervals into strictly before, overlapping, and strictly after. Closed intervals touching the new endpoint belong to the overlap group.',
);
add(
  'Count set bits',
  'Bit manipulation',
  'Return the number of set bits in an unsigned 32-bit integer.',
  '(n){let count=0;while(n!==0){n=(n&(n-1))>>>0;count++;}return count;}',
  '(n):\n    count=0\n    while n:\n        n &= n-1\n        count+=1\n    return count',
  [
    [[11], 3],
    [[4294967295], 32],
    [[0], 0],
  ],
  ['O(number of set bits)', 'O(1)'],
  'n & (n-1) clears the lowest set bit. JavaScript bitwise operations are signed, so normalize back to unsigned after each update.',
  'Easy',
);
add(
  'Euclidean divisor',
  'Math',
  'Return gcd(a,b) for integers with absolute values <=10^12. gcd(0,0) is 0.',
  '(a,b){a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;}',
  '(a,b):\n    a,b=abs(a),abs(b)\n    while b: a,b=b,a%b\n    return a',
  [
    [[54, 24], 6],
    [[-8, 12], 4],
    [[0, 0], 0],
  ],
  ['O(log min(|a|,|b|)) for nonzero inputs', 'O(1)'],
  'Replacing (a,b) by (b,a mod b) preserves common divisors and strictly reduces the second nonzero operand.',
  'Easy',
);
add(
  'Fast integer power',
  'Math',
  'Return x raised to integer n, where -30<=n<=30. x is nonzero when n is negative.',
  '(x,n){let k=Math.abs(n),out=1;while(k){if(k%2)out*=x;x*=x;k=Math.floor(k/2);}return n<0?1/out:out;}',
  '(x,n):\n    k=abs(n)\n    out=1\n    while k:\n        if k%2: out*=x\n        x*=x\n        k//=2\n    return 1/out if n<0 else out',
  [
    [[2, 10], 1024],
    [[2, -2], 0.25],
    [[9, 0], 1],
  ],
  ['O(log |n|)', 'O(1)'],
  'Repeated squaring consumes one exponent bit per step. Invert the final result for a negative exponent.',
);
add(
  'Count target subarrays',
  'Prefix sums',
  'Return how many nonempty contiguous subarrays sum to target. Values may be negative.',
  '(a,t){const counts=new Map([[0,1]]);let s=0,out=0;for(const x of a){s+=x;out+=counts.get(s-t)||0;counts.set(s,(counts.get(s)||0)+1);}return out;}',
  '(a,t):\n    counts={0:1}\n    s=out=0\n    for x in a:\n        s+=x\n        out+=counts.get(s-t,0)\n        counts[s]=counts.get(s,0)+1\n    return out',
  [
    [[[1, 1, 1], 2], 2],
    [[[0, 0], 0], 3],
    [[[], 0], 0],
  ],
  ['O(n)', 'O(n)'],
  'A subarray sum is the difference of two prefix sums. Count earlier prefixes before inserting the current one to exclude empty subarrays.',
);
add(
  'Longest consecutive run',
  'Hash maps',
  'Return the length of the longest consecutive integer sequence, ignoring input order and duplicates.',
  '(a){const s=new Set(a);let best=0;for(const x of s)if(!s.has(x-1)){let y=x;while(s.has(y))y++;best=Math.max(best,y-x);}return best;}',
  '(a):\n    s=set(a)\n    best=0\n    for x in s:\n        if x-1 not in s:\n            y=x\n            while y in s: y+=1\n            best=max(best,y-x)\n    return best',
  [
    [[[100, 4, 200, 1, 3, 2]], 4],
    [[[1, 2, 2, 3]], 3],
    [[[]], 0],
  ],
  ['O(n) expected', 'O(n)'],
  'Only begin a scan at a value with no predecessor. Then every distinct value is traversed in at most one run.',
);
add(
  'Trapped rainwater',
  'Two pointers',
  'Given nonnegative bar heights, return the total trapped rainwater volume.',
  '(a){let l=0,r=a.length-1,lm=0,rm=0,out=0;while(l<=r){if(lm<=rm){lm=Math.max(lm,a[l]);out+=lm-a[l++];}else{rm=Math.max(rm,a[r]);out+=rm-a[r--];}}return out;}',
  '(a):\n    l,r=0,len(a)-1\n    lm=rm=out=0\n    while l<=r:\n        if lm<=rm:\n            lm=max(lm,a[l])\n            out+=lm-a[l]\n            l+=1\n        else:\n            rm=max(rm,a[r])\n            out+=rm-a[r]\n            r-=1\n    return out',
  [
    [[[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6],
    [[[3, 0, 3]], 3],
    [[[]], 0],
  ],
  ['O(n)', 'O(1)'],
  'The side with the lower known maximum can be finalized: the opposite side already supplies a boundary at least that high.',
  'Hard',
);
add(
  'Minimum covering substring',
  'Sliding window',
  'Return the shortest substring of s containing all characters of t with multiplicity; ties choose the first. Return "" if absent or t is empty. ASCII inputs.',
  '(s,t){if(!t)return "";const need=new Map();for(const c of t)need.set(c,(need.get(c)||0)+1);let left=0,missing=t.length,start=0,len=Infinity;for(let r=0;r<s.length;r++){const c=s[r];if((need.get(c)||0)>0)missing--;need.set(c,(need.get(c)||0)-1);while(missing===0){if(r-left+1<len){start=left;len=r-left+1;}let x=s[left++];need.set(x,(need.get(x)||0)+1);if(need.get(x)>0)missing++;}}return len===Infinity?"":s.slice(start,start+len);}',
  '(s,t):\n    from collections import Counter\n    if not t: return ""\n    need=Counter(t)\n    missing=len(t)\n    left=start=0\n    length=len(s)+1\n    for r,c in enumerate(s):\n        if need[c]>0: missing-=1\n        need[c]-=1\n        while missing==0:\n            if r-left+1<length: start,length=left,r-left+1\n            x=s[left]\n            left+=1\n            need[x]+=1\n            if need[x]>0: missing+=1\n    return "" if length>len(s) else s[start:start+length]',
  [
    [['ADOBECODEBANC', 'ABC'], 'BANC'],
    [['a', 'aa'], ''],
    [['abc', ''], ''],
  ],
  ['O(|s|+|t|)', 'O(alphabet)'],
  'Track the count of still-missing required occurrences, not merely distinct characters. Shrink only while all requirements remain satisfied.',
  'Hard',
);
add(
  'Largest histogram rectangle',
  'Stacks and queues',
  'Return the maximum rectangle area under nonnegative unit-width histogram bars.',
  '(a){const s=[],h=[...a,0];let best=0;for(let i=0;i<h.length;i++){while(s.length&&h[s.at(-1)]>h[i]){let height=h[s.pop()],left=s.length?s.at(-1):-1;best=Math.max(best,height*(i-left-1));}s.push(i);}return best;}',
  '(a):\n    h=a+[0]\n    stack=[]\n    best=0\n    for i,x in enumerate(h):\n        while stack and h[stack[-1]]>x:\n            height=h[stack.pop()]\n            left=stack[-1] if stack else -1\n            best=max(best,height*(i-left-1))\n        stack.append(i)\n    return best',
  [
    [[[2, 1, 5, 6, 2, 3]], 10],
    [[[2, 2]], 4],
    [[[]], 0],
  ],
  ['O(n)', 'O(n)'],
  'When a shorter bar arrives, it fixes the right boundary for taller pending bars. A zero sentinel flushes remaining candidates.',
  'Hard',
);

export const dsaProblems = dsaSeeds.map((seed) => codeProblem(seed));
