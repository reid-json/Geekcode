import { codeProblem, type CodeSeed } from './builders';
import { career, coach, slug, type Problem } from './schema';

type Drill = [
  title: string,
  topic: string,
  prompt: string,
  answer: string[],
  why: string,
  kind?: Problem['kind'],
  choices?: string[],
];
const drills: Drill[] = [
  [
    'Java map defaults',
    'Java collections',
    'Predict the output:\n```java\nMap<String,Integer> m = new HashMap<>();\nm.put("a", 2);\nSystem.out.println(m.getOrDefault("b", 7));\nSystem.out.println(m.size());\n```',
    ['7', '1'],
    'getOrDefault reads a fallback but does not insert a mapping. In contrast, computeIfAbsent may mutate the map.',
  ],
  [
    'Java equality trap',
    'Java strings',
    'Predict the output:\n```java\nString a = new String("lab");\nString b = new String("lab");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));\n```',
    ['false', 'true'],
    'Reference equality compares object identity. String.equals compares character contents.',
  ],
  [
    'Java stream laziness',
    'Java streams and lambdas',
    'Predict the only output:\n```java\nvar xs = List.of(1, 2, 3);\nvar stream = xs.stream().map(x -> { System.out.println(x); return x * 2; });\nSystem.out.println("ready");\n```',
    ['ready'],
    'Intermediate stream operations are lazy. Without a terminal operation, the mapping lambda never executes.',
  ],
  [
    'Java integer division',
    'Java generics and exceptions',
    'Predict the output:\n```java\nSystem.out.println(7 / 2);\nSystem.out.println(7 / 2.0);\n```',
    ['3', '3.5'],
    'Integer division truncates toward zero before any later conversion. A double operand selects floating-point division.',
  ],
  [
    'Java finally wins',
    'Java generics and exceptions',
    'Predict the output:\n```java\nstatic int f() { try { return 1; } finally { return 2; } }\nSystem.out.println(f());\n```',
    ['2'],
    'A return in finally replaces the pending return, and can suppress exceptions. Prefer finally only for cleanup.',
  ],
  [
    'Java list removal overload',
    'Java collections',
    'Predict the output:\n```java\nvar xs = new ArrayList<>(List.of(1, 2, 3));\nxs.remove(1);\nxs.remove(Integer.valueOf(1));\nSystem.out.println(xs);\n```',
    ['[3]'],
    'remove(int) removes by index; remove(Object) removes a matching value. Boxing controls overload selection.',
  ],
  [
    'Java wildcard direction',
    'Java generics and exceptions',
    'Choose every statement that compiles for List<? extends Number> xs. Enter the exact selected lines, one per line.',
    ['Number n = xs.get(0);', 'xs.add(null);'],
    'An extends wildcard is a producer of Number. The captured subtype is unknown, so adding a concrete Integer is unsafe, but null is valid.',
    'multi-select',
    ['Number n = xs.get(0);', 'xs.add(1);', 'xs.add(null);'],
  ],
  [
    'Java volatile guarantee',
    'Java concurrency and IO',
    'Choose the guaranteed property of a volatile boolean flag shared by threads. Enter the exact line.',
    ['Writes are visible to subsequent reads.'],
    'Volatile provides visibility and ordering for that variable, not atomicity of compound read-modify-write operations.',
    'choice',
    [
      'All surrounding code is mutually exclusive.',
      'Writes are visible to subsequent reads.',
      'Increment becomes atomic.',
    ],
  ],
  [
    'Java atomic counter',
    'Java concurrency and IO',
    'Fill the blank with the method name: AtomicInteger counter; int previous = counter.___(); The operation must atomically increment and return the old value.',
    ['getAndIncrement'],
    'getAndIncrement returns the previous value; incrementAndGet returns the updated value.',
    'fill',
  ],
  [
    'Java resource order',
    'Java concurrency and IO',
    'Resources A and B are declared in that order in try-with-resources. Each close() prints its name. Enter the two close outputs in order.',
    ['B', 'A'],
    'Resources close in reverse declaration order, even when the body throws. Secondary close errors become suppressed exceptions.',
  ],
  [
    'Java regex escaping',
    'Regex and file handling',
    'Fill the Java string literal content (without outer quotes) for a regex matching one or more digits. Remember Java string escaping.',
    ['\\\\d+'],
    'Java string parsing and regex parsing are separate layers: two backslashes in source encode one for the regex engine.',
    'fill',
  ],
  [
    'Java immutable collection',
    'Java collections',
    'What exception class is thrown by List.of(1,2).add(3)? Enter the simple class name.',
    ['UnsupportedOperationException'],
    'List.of returns an unmodifiable list. The values themselves are not necessarily deeply immutable.',
  ],
  [
    'Java equality bug repair',
    'Java strings',
    'Spot the bug: boolean same(String a, String b) { return a == b; } must compare nullable string contents safely. Replace only the return expression with the standard java.util.Objects helper call. Enter the expression without a semicolon.',
    ['Objects.equals(a, b)'],
    'Objects.equals handles both-null, one-null, and equal-content cases without dereferencing a null receiver. Identity comparison does not implement value equality.',
    'repair',
  ],
  [
    'Python mutable defaults',
    'Python comprehensions',
    'Predict the output:\n```python\ndef f(x, items=[]):\n    items.append(x)\n    return len(items)\nprint(f(1))\nprint(f(2))\n```',
    ['1', '2'],
    'Default expressions are evaluated once at function definition. Use None and construct a new list inside for per-call state.',
  ],
  [
    'JavaScript closure trace',
    'JavaScript and TypeScript',
    'Predict the output:\n```javascript\nconst fns=[];\nfor(var i=0;i<3;i++) fns.push(()=>i);\nconsole.log(fns.map(f=>f()).join(","));\n```',
    ['3,3,3'],
    'var shares one function-scoped binding. let creates a separate iteration binding.',
  ],
  [
    'SQL null logic',
    'SQL idioms',
    "Predict the result word for SELECT CASE WHEN NULL = NULL THEN 'yes' ELSE 'no' END;",
    ['no'],
    'NULL comparison yields UNKNOWN, not true. IS NULL tests missingness explicitly.',
  ],
  [
    'Bash quoted expansion',
    'Bash idioms',
    'Given x="a b", how many arguments does printf "%s\\n" "$x" receive after its format argument? Enter a number.',
    ['1'],
    'Double quotes preserve the expansion as a single argument. Unquoted expansion undergoes word splitting and pathname expansion.',
  ],
];
export const syntaxProblems: Problem[] = drills.map(
  ([title, topic, prompt, answer, why, kind, choices]) => ({
    id: slug(title),
    title,
    topic,
    track: 'syntax',
    kind: kind ?? 'predict',
    difficulty: 'Easy',
    description: `${prompt}\n\nThis is an authored language-semantics drill, not a Java/shell interpreter. Enter output exactly, one line per printed value.`,
    languages: [title.startsWith('Java ') ? 'java' : 'text'],
    starter: { java: '', text: '' },
    reference: { java: answer.join('\n'), text: answer.join('\n') },
    answer,
    choices,
    tests: [{ args: [], expected: answer }],
    complexity: { time: 'Not assessed', space: 'Not assessed' },
    hints: [
      'Which operation changes state, and which only reads it?',
      'When is the expression evaluated?',
      'What exact type or binding does this operation use?',
    ],
    editorial: why,
    coach: coach(topic, `lesson-${slug(topic)}`, []),
    career: career(topic, 'syntax'),
    prerequisites: [],
  }),
);
const coding: CodeSeed[] = [
  {
    title: 'Frequency comprehension',
    topic: 'Python comprehensions',
    kind: 'refactor',
    prompt:
      'Refactor a repeated-count loop: return an object mapping each lowercase ASCII word to its frequency. Object key order is not graded.',
    js: '(words){const out={};for(const w of words)out[w]=(out[w]||0)+1;return out;}',
    py: '(words):\n    from collections import Counter\n    return dict(Counter(words))',
    cases: [
      [[['a', 'b', 'a']], { a: 2, b: 1 }],
      [[[]], {}],
      [[['x']], { x: 1 }],
    ],
    cost: ['O(n)', 'O(distinct words)'],
    insight:
      'Count in one pass rather than calling count for each distinct element, which can cause quadratic repeated scans.',
  },
  {
    title: 'Stable unique values',
    topic: 'JavaScript and TypeScript',
    prompt:
      'Return values with duplicates removed, preserving first-occurrence order. Inputs are integers.',
    js: '(a){return [...new Set(a)];}',
    py: '(a):\n    return list(dict.fromkeys(a))',
    cases: [
      [[[3, 1, 3, 2]], [3, 1, 2]],
      [[[]], []],
      [[[0, 0]], [0]],
    ],
    cost: ['O(n) expected', 'O(n)'],
    insight:
      'Insertion-ordered sets/maps retain first appearance. A sorting-based solution would violate the stable-order contract.',
  },
  {
    title: 'Named capture parser',
    topic: 'Regex and file handling',
    prompt:
      'Parse lines of the exact form KEY=VALUE, where KEY contains uppercase letters and underscores and VALUE is the remaining text (possibly empty). Ignore invalid lines and return [key,value] pairs.',
    js: '(lines){return lines.flatMap(s=>{const m=/^([A-Z_]+)=(.*)$/.exec(s);return m?[[m[1],m[2]]]:[];});}',
    py: '(lines):\n    import re\n    return [[m.group(1),m.group(2)] for s in lines if (m:=re.fullmatch(r"([A-Z_]+)=(.*)",s))]',
    cases: [
      [
        [['PORT=3000', 'bad', 'X=']],
        [
          ['PORT', '3000'],
          ['X', ''],
        ],
      ],
      [[['A=x=y']], [['A', 'x=y']]],
      [[[]], []],
    ],
    cost: ['O(total characters)', 'O(output)'],
    insight:
      'Anchor the whole line and decide whether empty values and extra equals signs are legal. Parsing only a matching prefix silently accepts malformed input.',
  },
  {
    title: 'Exception-safe integer conversion',
    topic: 'Java generics and exceptions',
    prompt:
      'Return integers for strings matching an optional sign followed by ASCII digits; replace invalid strings with null. Values fit signed 32-bit range. Do not accept whitespace or decimal notation.',
    js: '(values){return values.map(s=>/^[+-]?[0-9]+$/.test(s)?Number(s):null);}',
    py: '(values):\n    import re\n    return [int(s) if re.fullmatch(r"[+-]?[0-9]+",s) else None for s in values]',
    cases: [
      [[['12', '-3', 'x']], [12, -3, null]],
      [[[' 2', '2.0', '+4']], [null, null, 4]],
      [[[]], []],
    ],
    cost: ['O(total characters)', 'O(output)'],
    insight:
      'Validate the entire representation before conversion. parseInt accepts trailing garbage and is not an exact validator.',
  },
];
syntaxProblems.push(...coding.map((seed) => codeProblem(seed, 'syntax')));
