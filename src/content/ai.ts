import { codeProblem, type CodeSeed } from './builders';

const seeds: CodeSeed[] = [];
function add(
  title: string,
  topic: string,
  prompt: string,
  js: string,
  py: string,
  cases: CodeSeed['cases'],
  insight: string,
  cost: [string, string] = ['O(n)', 'O(1) excluding output'],
) {
  seeds.push({ title, topic, prompt, js, py, cases, insight, cost });
}
add(
  'Mean squared error',
  'Regression and gradient descent',
  'Return mean squared error between equal-length truth and prediction arrays; empty arrays return 0.',
  '(y,p){return y.length?y.reduce((s,x,i)=>s+(x-p[i])**2,0)/y.length:0;}',
  '(y,p):\n    return sum((a-b)**2 for a,b in zip(y,p))/len(y) if y else 0',
  [
    [
      [
        [1, 2, 3],
        [1, 2, 5],
      ],
      4 / 3,
    ],
    [[[0], [2]], 4],
    [[[], []], 0],
  ],
  'Square residuals before averaging. Large errors contribute disproportionately; report the scale because squared units are easy to misinterpret.',
);
add(
  'One gradient step',
  'Regression and gradient descent',
  'For y≈w*x with no intercept and loss mean((w*x-y)^2), return w after one gradient-descent step with learning rate lr. Empty data leaves w unchanged.',
  '(x,y,w,lr){if(!x.length)return w;const g=2*x.reduce((s,v,i)=>s+(w*v-y[i])*v,0)/x.length;return w-lr*g;}',
  '(x,y,w,lr):\n    g=2*sum((w*a-b)*a for a,b in zip(x,y))/len(x) if x else 0\n    return w-lr*g',
  [
    [[[1, 2], [2, 4], 0, 0.1], 1],
    [[[1], [1], 1, 0.5], 1],
    [[[], [], 3, 1], 3],
  ],
  'Differentiate the stated loss exactly. Whether a 1/2 factor is present changes the gradient by a factor of two.',
);
add(
  'Stable sigmoid',
  'Logistic regression',
  'Return sigmoid(x) for a real number, safely for magnitudes up to 1000.',
  '(x){if(x>=0)return 1/(1+Math.exp(-x));const z=Math.exp(x);return z/(1+z);}',
  '(x):\n    import math\n    if x>=0: return 1/(1+math.exp(-x))\n    z=math.exp(x)\n    return z/(1+z)',
  [
    [[0], 0.5],
    [[1000], 1],
    [[-1000], 0],
  ],
  'Choose the algebraic form whose exponent is nonpositive to avoid overflow.',
  ['O(1)', 'O(1)'],
);
add(
  'Binary confusion counts',
  'Classification metrics',
  'Given binary labels and predictions, return [TP,FP,FN,TN].',
  '(y,p){let c=[0,0,0,0];for(let i=0;i<y.length;i++)c[y[i]?(p[i]?0:2):(p[i]?1:3)]++;return c;}',
  '(y,p):\n    c=[0,0,0,0]\n    for a,b in zip(y,p): c[0 if a and b else 2 if a else 1 if b else 3]+=1\n    return c',
  [
    [
      [
        [1, 0, 1, 0],
        [1, 1, 0, 0],
      ],
      [1, 1, 1, 1],
    ],
    [
      [
        [1, 1],
        [1, 1],
      ],
      [2, 0, 0, 0],
    ],
    [
      [[], []],
      [0, 0, 0, 0],
    ],
  ],
  'Name which class is positive before counting. Confusing FP with FN reverses precision/recall interpretations.',
);
add(
  'Precision recall F1',
  'Classification metrics',
  'Given TP, FP, FN counts, return [precision,recall,F1]. Define any zero denominator result as 0.',
  '(tp,fp,fn){let p=tp+fp?tp/(tp+fp):0,r=tp+fn?tp/(tp+fn):0;return [p,r,p+r?2*p*r/(p+r):0];}',
  '(tp,fp,fn):\n    p=tp/(tp+fp) if tp+fp else 0\n    r=tp/(tp+fn) if tp+fn else 0\n    return [p,r,2*p*r/(p+r) if p+r else 0]',
  [
    [
      [3, 1, 2],
      [0.75, 0.6, 2 / 3],
    ],
    [
      [0, 0, 2],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
  'Precision conditions on predicted positives; recall conditions on actual positives. State the zero-division convention explicitly.',
  ['O(1)', 'O(1)'],
);
add(
  'Pairwise ROC AUC',
  'Classification metrics',
  'Return binary ROC AUC as the fraction of positive-negative score pairs ranked correctly, with ties worth 0.5. Return null if either class is absent.',
  '(y,s){let wins=0,p=0,n=0;for(const v of y)v?p++:n++;if(!p||!n)return null;for(let i=0;i<y.length;i++)if(y[i])for(let j=0;j<y.length;j++)if(!y[j])wins+=s[i]>s[j]?1:s[i]===s[j]?0.5:0;return wins/(p*n);}',
  '(y,s):\n    pos=[s[i] for i,v in enumerate(y) if v]\n    neg=[s[i] for i,v in enumerate(y) if not v]\n    if not pos or not neg: return None\n    return sum(1 if a>b else 0.5 if a==b else 0 for a in pos for b in neg)/(len(pos)*len(neg))',
  [
    [
      [
        [0, 1, 0, 1],
        [0.1, 0.9, 0.4, 0.8],
      ],
      1,
    ],
    [
      [
        [0, 1],
        [0.5, 0.5],
      ],
      0.5,
    ],
    [[[1], [0.8]], null],
  ],
  'AUC measures ranking rather than a particular threshold. A single-class test set cannot estimate it.',
  ['O(n²)', 'O(n)'],
);
add(
  'Standardize a feature',
  'Regularization and bias variance',
  'Return population z-scores of numeric values. Constant arrays become zeros; empty input returns [].',
  '(a){if(!a.length)return [];const m=a.reduce((s,x)=>s+x,0)/a.length,v=a.reduce((s,x)=>s+(x-m)**2,0)/a.length;return a.map(x=>v?(x-m)/Math.sqrt(v):0);}',
  '(a):\n    import math\n    if not a: return []\n    m=sum(a)/len(a)\n    v=sum((x-m)**2 for x in a)/len(a)\n    return [(x-m)/math.sqrt(v) if v else 0 for x in a]',
  [
    [[[1, 2, 3]], [-1.224744871391589, 0, 1.224744871391589]],
    [[[4, 4]], [0, 0]],
    [[[]], []],
  ],
  'Fit the mean and variance on training data only. This exercise transforms one vector; real evaluation must reuse training statistics on validation/test.',
);
add(
  'L2 penalty',
  'Regularization and bias variance',
  'Return lambda * sum(w_i^2), excluding a separately supplied intercept b. The intercept argument is intentionally unused.',
  '(w,b,lambda){return lambda*w.reduce((s,x)=>s+x*x,0);}',
  '(w,b,lam):\n    return lam*sum(x*x for x in w)',
  [
    [[[3, 4], 100, 0.1], 2.5],
    [[[0], 5, 2], 0],
    [[[], 1, 1], 0],
  ],
  'Regularization penalizes parameters, not predictions. Explicitly state whether the intercept is included; many conventions exclude it.',
);
add(
  'Stratified split indices',
  'Train validation test',
  'For binary labels and train fraction f, select the first floor(classCount*f) indices of each class for training. Return [trainIndices,testIndices], both sorted.',
  '(y,f){const groups=[[],[]];y.forEach((v,i)=>groups[v].push(i));let train=[],test=[];for(const g of groups){let k=Math.floor(g.length*f);train.push(...g.slice(0,k));test.push(...g.slice(k));}return [train.sort((a,b)=>a-b),test.sort((a,b)=>a-b)];}',
  '(y,f):\n    groups=[[i for i,v in enumerate(y) if v==c] for c in [0,1]]\n    train=[]\n    test=[]\n    for g in groups:\n        k=int(len(g)*f)\n        train+=g[:k]\n        test+=g[k:]\n    return [sorted(train),sorted(test)]',
  [
    [
      [[0, 1, 0, 1, 0, 1], 0.5],
      [
        [0, 1],
        [2, 3, 4, 5],
      ],
    ],
    [
      [[1, 1], 1],
      [[0, 1], []],
    ],
    [
      [[], 0.8],
      [[], []],
    ],
  ],
  'Preserve class representation independently. Deterministic ordering is useful for tests but is not a substitute for shuffled or group/time-aware production splits.',
  ['O(n log n)', 'O(n)'],
);
add(
  'K-fold membership',
  'Train validation test',
  'Assign index i to validation fold i mod k. Return k arrays of validation indices. k is positive.',
  '(n,k){const folds=Array.from({length:k},()=>[]);for(let i=0;i<n;i++)folds[i%k].push(i);return folds;}',
  '(n,k):\n    return [list(range(f,n,k)) for f in range(k)]',
  [
    [
      [7, 3],
      [
        [0, 3, 6],
        [1, 4],
        [2, 5],
      ],
    ],
    [
      [2, 3],
      [[0], [1], []],
    ],
    [[0, 1], [[]]],
  ],
  'Every sample appears in exactly one held-out fold. Model selection may use cross-validation, but the final test set remains untouched.',
  ['O(n+k)', 'O(n+k)'],
);
add(
  'ASCII tokenizer',
  'Tokenization',
  'Lowercase text and return all maximal ASCII alphanumeric sequences. Punctuation separates tokens.',
  '(s){return s.toLowerCase().match(/[a-z0-9]+/g)||[];}',
  '(s):\n    import re\n    return re.findall(r"[a-z0-9]+",s.lower())',
  [
    [['RAG: 2 chunks, grounded.'], ['rag', '2', 'chunks', 'grounded']],
    [['a_b'], ['a', 'b']],
    [['...'], []],
  ],
  'A deterministic tokenizer defines matching behavior. Real model tokenization can split words into subwords and must match the embedding model.',
  ['O(characters)', 'O(characters)'],
);
add(
  'Cosine similarity',
  'Embeddings and vector search',
  'Return cosine similarity of equal-length vectors, or 0 when either norm is zero.',
  '(a,b){let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return aa&&bb?dot/Math.sqrt(aa*bb):0;}',
  '(a,b):\n    import math\n    dot=sum(x*y for x,y in zip(a,b))\n    aa=sum(x*x for x in a)\n    bb=sum(x*x for x in b)\n    return dot/math.sqrt(aa*bb) if aa and bb else 0',
  [
    [
      [
        [1, 0],
        [0, 1],
      ],
      0,
    ],
    [
      [
        [1, 2],
        [2, 4],
      ],
      1,
    ],
    [
      [
        [0, 0],
        [1, 2],
      ],
      0,
    ],
  ],
  'Normalize away magnitude to measure direction. A zero vector has no direction, so this task defines its similarity as zero.',
  ['O(dimensions)', 'O(1)'],
);
add(
  'Exact vector retrieval',
  'Embeddings and vector search',
  'Given unit vectors docs, a unit query vector, and k, return top document indices by dot product, ties by lower index. k may exceed document count.',
  '(docs,q,k){return docs.map((v,i)=>[i,v.reduce((s,x,j)=>s+x*q[j],0)]).sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,k).map(x=>x[0]);}',
  '(docs,q,k):\n    scores=[(i,sum(x*y for x,y in zip(v,q))) for i,v in enumerate(docs)]\n    return [i for i,s in sorted(scores,key=lambda x:(-x[1],x[0]))[:k]]',
  [
    [
      [
        [
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        [1, 0],
        2,
      ],
      [0, 1],
    ],
    [
      [
        [
          [1, 0],
          [1, 0],
        ],
        [1, 0],
        1,
      ],
      [0],
    ],
    [[[], [1, 0], 3], []],
  ],
  'For unit vectors, dot product equals cosine similarity. Keep deterministic tie-breaking so evaluations are reproducible.',
  ['O(Nd+N log N)', 'O(N)'],
);
add(
  'Smoothed inverse document frequency',
  'RAG and grounding',
  'Given documents as token arrays and a term, return log((1+N)/(1+df))+1, counting each document at most once.',
  '(docs,term){let df=docs.filter(d=>d.includes(term)).length;return Math.log((1+docs.length)/(1+df))+1;}',
  '(docs,term):\n    import math\n    df=sum(term in d for d in docs)\n    return math.log((1+len(docs))/(1+df))+1',
  [
    [[[['a', 'a'], ['b']], 'a'], 1.4054651081081644],
    [[[['a'], ['a']], 'a'], 1],
    [[[], 'x'], 1],
  ],
  'Document frequency counts documents, not occurrences. Smoothing keeps rare and unseen terms finite.',
  ['O(total tokens)', 'O(1)'],
);
add(
  'Overlapping token chunks',
  'RAG and grounding',
  'Given tokens, positive size, and overlap (0<=overlap<size), return windows stepped by size-overlap. Stop once a window reaches the end; do not emit redundant trailing windows.',
  '(tokens,size,overlap){const out=[];for(let i=0;i<tokens.length;i+=size-overlap){out.push(tokens.slice(i,i+size));if(i+size>=tokens.length)break;}return out;}',
  '(tokens,size,overlap):\n    out=[]\n    for i in range(0,len(tokens),size-overlap):\n        out.append(tokens[i:i+size])\n        if i+size>=len(tokens): break\n    return out',
  [
    [
      [['a', 'b', 'c', 'd', 'e'], 3, 1],
      [
        ['a', 'b', 'c'],
        ['c', 'd', 'e'],
      ],
    ],
    [[[1, 2], 3, 1], [[1, 2]]],
    [[[], 2, 0], []],
  ],
  'Overlap reduces boundary information loss but increases index size and duplicate retrieval. Stop after covering the final token.',
  ['O(n*size/(size-overlap))', 'O(output size)'],
);
add(
  'Retrieval precision and recall',
  'Retrieval evaluation',
  'Given retrieved document IDs (possibly duplicate), relevant unique IDs, and k, return [precision@k,recall@k]. Deduplicate before truncating. Precision divides by actual returned count; zero denominators give 0.',
  '(retrieved,relevant,k){const top=[...new Set(retrieved)].slice(0,k),rel=new Set(relevant);const hits=top.filter(x=>rel.has(x)).length;return [top.length?hits/top.length:0,rel.size?hits/rel.size:0];}',
  '(retrieved,relevant,k):\n    top=list(dict.fromkeys(retrieved))[:k]\n    rel=set(relevant)\n    hits=sum(x in rel for x in top)\n    return [hits/len(top) if top else 0,hits/len(rel) if rel else 0]',
  [
    [
      [['a', 'b', 'a', 'c'], ['a', 'c'], 2],
      [0.5, 0.5],
    ],
    [
      [[], ['a'], 3],
      [0, 0],
    ],
    [
      [['a'], [], 1],
      [0, 0],
    ],
  ],
  'Define duplicate handling and the precision denominator before comparing systems. Retrieval recall is distinct from answer correctness.',
  ['O(n+r)', 'O(n+r)'],
);
add(
  'Reciprocal rank',
  'Retrieval evaluation',
  'Return reciprocal rank of the first relevant retrieved ID, or 0 when none is relevant.',
  '(retrieved,relevant){const r=new Set(relevant);const i=retrieved.findIndex(x=>r.has(x));return i<0?0:1/(i+1);}',
  '(retrieved,relevant):\n    rel=set(relevant)\n    return next((1/(i+1) for i,x in enumerate(retrieved) if x in rel),0)',
  [
    [[['x', 'a', 'b'], ['a']], 0.5],
    [[['a'], ['a']], 1],
    [[[], ['a']], 0],
  ],
  'Reciprocal rank rewards putting at least one relevant result near the top. It says nothing about coverage of the remaining relevant documents.',
  ['O(n+r)', 'O(r)'],
);
add(
  'Citation coverage audit',
  'Prompt engineering and agents',
  'Claims are [text,citedIds]. Given known source IDs, return the fraction of claims with at least one citation and only known cited IDs. This checks attribution format, not semantic support. Empty claims return 0.',
  '(claims,sources){const known=new Set(sources);return claims.length?claims.filter(([,ids])=>ids.length&&ids.every(x=>known.has(x))).length/claims.length:0;}',
  '(claims,sources):\n    known=set(sources)\n    return sum(bool(ids) and all(x in known for x in ids) for text,ids in claims)/len(claims) if claims else 0',
  [
    [
      [
        [
          ['claim', ['s1']],
          ['other', []],
        ],
        ['s1'],
      ],
      0.5,
    ],
    [[[['claim', ['fake']]], ['s1']], 0],
    [[[], []], 0],
  ],
  'Existing IDs do not prove that sources support a claim. Separate citation validity, attribution coverage, and human/entailed support judgments.',
  ['O(citations+sources)', 'O(sources)'],
);
add(
  'Stable attention weights',
  'Transformer basics',
  'Return softmax scores for a numeric vector by subtracting its maximum before exponentiation. Empty input returns [].',
  '(a){if(!a.length)return [];const m=Math.max(...a),e=a.map(x=>Math.exp(x-m)),s=e.reduce((x,y)=>x+y,0);return e.map(x=>x/s);}',
  '(a):\n    import math\n    if not a: return []\n    m=max(a)\n    e=[math.exp(x-m) for x in a]\n    return [x/sum(e) for x in e]',
  [
    [[[1000, 1000]], [0.5, 0.5]],
    [[[0, 0, 0]], [1 / 3, 1 / 3, 1 / 3]],
    [[[]], []],
  ],
  'Softmax is invariant to adding a constant. Subtracting the maximum prevents overflow without changing the distribution.',
);
add(
  'Evaluation regression gate',
  'LLM evaluation harnesses',
  'Given baseline and candidate case scores in [0,1] and tolerance, return {meanDelta,regressions,passes}. A regression is candidate < baseline-tolerance; passes requires no regressions and nonnegative mean delta. Empty arrays pass with delta 0.',
  '(baseline,candidate,tolerance){const delta=baseline.length?baseline.reduce((s,x,i)=>s+candidate[i]-x,0)/baseline.length:0;const r=baseline.map((x,i)=>candidate[i]<x-tolerance?i:-1).filter(i=>i>=0);return {meanDelta:delta,regressions:r,passes:r.length===0&&delta>=0};}',
  '(baseline,candidate,tolerance):\n    delta=sum(b-a for a,b in zip(baseline,candidate))/len(baseline) if baseline else 0\n    r=[i for i,(a,b) in enumerate(zip(baseline,candidate)) if b<a-tolerance]\n    return {"meanDelta":delta,"regressions":r,"passes":not r and delta>=0}',
  [
    [[[0.5, 0.8], [0.7, 0.7], 0.05], { meanDelta: 0.05, regressions: [1], passes: false }],
    [[[0.4], [0.5], 0], { meanDelta: 0.1, regressions: [], passes: true }],
    [[[], [], 0], { meanDelta: 0, regressions: [], passes: true }],
  ],
  'Averages can hide serious per-case regressions. Keep a fixed held-out set and gate both aggregate behavior and critical slices.',
  ['O(n)', 'O(n) output'],
);
export const aiProblems = seeds.map((seed) => codeProblem(seed, 'ai'));
aiProblems[6].packages = ['pandas'];
aiProblems[19].packages = ['scikit-learn'];
