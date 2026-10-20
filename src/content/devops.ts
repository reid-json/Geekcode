import { career, coach, slug, type Language, type Problem, type Rule } from './schema';

type Config = {
  title: string;
  topic: string;
  prompt: string;
  starter: string;
  reference: string;
  rules: Rule[];
  yaml?: boolean;
  kind?: Problem['kind'];
  why: string;
};
const configs: Config[] = [
  {
    title: 'Non-root Node container',
    topic: 'Dockerfiles and Compose',
    prompt:
      'Write a Dockerfile based on node:22-alpine, with WORKDIR /app, copy package manifests, run npm ci --omit=dev, copy source, switch to USER node, and start node server.js. Dependency installation must precede copying all source.',
    starter: 'FROM node:22-alpine\nWORKDIR /app\n',
    reference:
      'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nUSER node\nCMD ["node", "server.js"]',
    rules: [
      { label: 'Pinned major Alpine image', pattern: '^FROM node:22-alpine\\s*$' },
      { label: 'Working directory', pattern: '^WORKDIR /app\\s*$' },
      {
        label: 'Manifest before install before source',
        pattern: 'COPY package\\*?[^\\n]*[\\s\\S]*RUN npm ci --omit=dev[\\s\\S]*COPY \\. \\.',
      },
      { label: 'Non-root final user', pattern: '^USER node\\s*$', notPattern: '^USER root\\s*$' },
      {
        label: 'Exec-form server command',
        pattern: 'CMD\\s*\\[\\s*"node"\\s*,\\s*"server.js"\\s*\\]',
      },
    ],
    why: 'Copying manifests first lets dependency layers survive source-only changes. A non-root user reduces privilege but does not alone make a container secure.',
  },
  {
    title: 'Compose health dependency',
    topic: 'Dockerfiles and Compose',
    prompt:
      'Define services.db with image postgres:16-alpine and POSTGRES_PASSWORD=local-only. Define services.api with image my-api:1 and depends_on.db.condition=service_healthy. Add a db healthcheck test ["CMD-SHELL","pg_isready -U postgres"]. This is a local-only example, not a production secret pattern.',
    yaml: true,
    starter: 'services:\n  db:\n    image: postgres:16-alpine\n  api:\n    image: my-api:1\n',
    reference:
      'services:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: local-only\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n  api:\n    image: my-api:1\n    depends_on:\n      db:\n        condition: service_healthy',
    rules: [
      { label: 'Database image', path: 'services.db.image', equals: 'postgres:16-alpine' },
      {
        label: 'Local password',
        path: 'services.db.environment.POSTGRES_PASSWORD',
        equals: 'local-only',
      },
      {
        label: 'Readiness condition',
        path: 'services.api.depends_on.db.condition',
        equals: 'service_healthy',
      },
      {
        label: 'Health command',
        path: 'services.db.healthcheck.test',
        equals: ['CMD-SHELL', 'pg_isready -U postgres'],
      },
    ],
    why: 'depends_on startup order alone does not imply readiness. The condition requires a meaningful healthcheck; production credentials belong outside committed YAML.',
  },
  {
    title: 'Repair a CI job',
    topic: 'CI CD pipelines',
    prompt:
      'Fix this GitHub Actions fragment: name checks, on=[push,pull_request], jobs.test.runs-on=ubuntu-latest, checkout with actions/checkout@v4, setup Node 22 with actions/setup-node@v4, then npm ci and npm test as separate run steps.',
    yaml: true,
    kind: 'repair',
    starter:
      'name: checks\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n',
    reference:
      'name: checks\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n      - run: npm ci\n      - run: npm test',
    rules: [
      { label: 'Runner', path: 'jobs.test.runs-on', equals: 'ubuntu-latest' },
      { label: 'Checkout first', path: 'jobs.test.steps.0.uses', equals: 'actions/checkout@v4' },
      {
        label: 'Node setup second',
        path: 'jobs.test.steps.1.uses',
        equals: 'actions/setup-node@v4',
      },
      { label: 'Node version', path: 'jobs.test.steps.1.with.node-version', equals: 22 },
      { label: 'Locked install before test', path: 'jobs.test.steps.2.run', equals: 'npm ci' },
      { label: 'Test last', path: 'jobs.test.steps.3.run', equals: 'npm test' },
    ],
    why: 'A clean runner has neither your source nor node_modules. Checkout, toolchain setup, locked installation, and tests must happen in dependency order.',
  },
  {
    title: 'Least-privilege workflow',
    topic: 'CI CD pipelines',
    prompt:
      'Write a YAML fragment with permissions.contents=read and concurrency.group=checks plus concurrency.cancel-in-progress=true.',
    yaml: true,
    starter: 'permissions:\n  contents: write\n',
    reference:
      'permissions:\n  contents: read\nconcurrency:\n  group: checks\n  cancel-in-progress: true',
    rules: [
      { label: 'Read-only repository token', path: 'permissions.contents', equals: 'read' },
      { label: 'Concurrency group', path: 'concurrency.group', equals: 'checks' },
      { label: 'Cancel stale runs', path: 'concurrency.cancel-in-progress', equals: true },
    ],
    why: 'Token scope should match actual job needs. Cancelling obsolete checks saves runner capacity; deployment jobs may need a different concurrency policy.',
  },
  {
    title: 'Deployment selector contract',
    topic: 'Kubernetes core objects',
    prompt:
      'Create an apps/v1 Deployment named web with 3 replicas. Match app=web in selector and pod labels. Use container name web, image nginx:1.27-alpine, and containerPort 80.',
    yaml: true,
    starter: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\n',
    reference:
      'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: web\n          image: nginx:1.27-alpine\n          ports:\n            - containerPort: 80',
    rules: [
      { label: 'Deployment API', path: 'apiVersion', equals: 'apps/v1' },
      { label: 'Kind', path: 'kind', equals: 'Deployment' },
      { label: 'Replicas', path: 'spec.replicas', equals: 3 },
      { label: 'Selector label', path: 'spec.selector.matchLabels.app', equals: 'web' },
      { label: 'Matching pod label', path: 'spec.template.metadata.labels.app', equals: 'web' },
      {
        label: 'Container image',
        path: 'spec.template.spec.containers.0.image',
        equals: 'nginx:1.27-alpine',
      },
      { label: 'Port', path: 'spec.template.spec.containers.0.ports.0.containerPort', equals: 80 },
    ],
    why: 'A Deployment selector must match its pod-template labels. Declaring containerPort documents a port; it does not itself expose the workload.',
  },
  {
    title: 'Service target port',
    topic: 'Kubernetes core objects',
    prompt:
      'Write a v1 Service named web selecting app=web, exposing TCP port 80 to targetPort 8080. Default ClusterIP is sufficient.',
    yaml: true,
    starter: 'apiVersion: v1\nkind: Service\n',
    reference:
      'apiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 8080\n      protocol: TCP',
    rules: [
      { label: 'Service', path: 'kind', equals: 'Service' },
      { label: 'Selector', path: 'spec.selector.app', equals: 'web' },
      { label: 'Client-facing port', path: 'spec.ports.0.port', equals: 80 },
      { label: 'Pod-facing port', path: 'spec.ports.0.targetPort', equals: 8080 },
      { label: 'Transport', path: 'spec.ports.0.protocol', equals: 'TCP' },
    ],
    why: 'Service port and targetPort live on different sides of the forwarding abstraction. An incorrect selector yields no endpoints even with correct port numbers.',
  },
  {
    title: 'Readiness versus liveness',
    topic: 'Kubernetes core objects',
    prompt:
      'Write a container YAML fragment with readinessProbe.httpGet.path=/ready and port=8080, livenessProbe.httpGet.path=/live and port=8080. Readiness failure must not be confused with process restart.',
    yaml: true,
    starter: 'name: api\nimage: api:1\n',
    reference:
      'name: api\nimage: api:1\nreadinessProbe:\n  httpGet:\n    path: /ready\n    port: 8080\nlivenessProbe:\n  httpGet:\n    path: /live\n    port: 8080',
    rules: [
      { label: 'Readiness endpoint', path: 'readinessProbe.httpGet.path', equals: '/ready' },
      { label: 'Readiness port', path: 'readinessProbe.httpGet.port', equals: 8080 },
      { label: 'Liveness endpoint', path: 'livenessProbe.httpGet.path', equals: '/live' },
      { label: 'Liveness port', path: 'livenessProbe.httpGet.port', equals: 8080 },
    ],
    why: 'Readiness controls traffic eligibility; liveness can restart a stuck container. A downstream outage should not automatically trigger restart storms.',
  },
  {
    title: 'Bounded resource budget',
    topic: 'Kubernetes core objects',
    prompt:
      'Write a resources fragment requesting cpu 250m and memory 128Mi, limiting cpu 500m and memory 256Mi. Quote quantity strings.',
    yaml: true,
    starter: 'resources: {}\n',
    reference:
      'resources:\n  requests:\n    cpu: "250m"\n    memory: "128Mi"\n  limits:\n    cpu: "500m"\n    memory: "256Mi"',
    rules: [
      { label: 'CPU request', path: 'resources.requests.cpu', equals: '250m' },
      { label: 'Memory request', path: 'resources.requests.memory', equals: '128Mi' },
      { label: 'CPU limit', path: 'resources.limits.cpu', equals: '500m' },
      { label: 'Memory limit', path: 'resources.limits.memory', equals: '256Mi' },
    ],
    why: 'Requests affect scheduling; limits bound runtime consumption. A memory limit can cause OOM kills; CPU limits generally throttle rather than kill.',
  },
  {
    title: 'Persistent volume claim',
    topic: 'Kubernetes core objects',
    prompt:
      'Write a v1 PersistentVolumeClaim named data, accessModes [ReadWriteOnce], resources.requests.storage=1Gi.',
    yaml: true,
    starter: 'apiVersion: v1\nkind: PersistentVolumeClaim\n',
    reference:
      'apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: data\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 1Gi',
    rules: [
      { label: 'Claim kind', path: 'kind', equals: 'PersistentVolumeClaim' },
      { label: 'Claim name', path: 'metadata.name', equals: 'data' },
      { label: 'Access mode', path: 'spec.accessModes', equals: ['ReadWriteOnce'] },
      { label: 'Requested size', path: 'spec.resources.requests.storage', equals: '1Gi' },
    ],
    why: 'A claim requests storage through a storage class/binding process. ReadWriteOnce means one node, not necessarily one pod.',
  },
  {
    title: 'Terraform typed input',
    topic: 'Terraform basics',
    prompt:
      'Write a Terraform variable "instance_count" with type number, default 2, and validation condition var.instance_count >= 1 with a nonempty error_message. This checker recognizes this authored HCL subset only.',
    starter: 'variable "instance_count" {\n}\n',
    reference:
      'variable "instance_count" {\n  type = number\n  default = 2\n  validation {\n    condition = var.instance_count >= 1\n    error_message = "At least one instance is required."\n  }\n}',
    rules: [
      { label: 'Named variable', pattern: 'variable\\s+"instance_count"\\s*\\{' },
      { label: 'Numeric type', pattern: 'type\\s*=\\s*number' },
      { label: 'Default', pattern: 'default\\s*=\\s*2\\b' },
      {
        label: 'Positive validation',
        pattern: 'condition\\s*=\\s*var\\.instance_count\\s*>=\\s*1',
      },
      { label: 'Actionable message', pattern: 'error_message\\s*=\\s*"[^"]+"' },
    ],
    why: 'Validate assumptions at the input boundary rather than letting an invalid value fail during provisioning. Text checks do not replace terraform validate or provider planning.',
  },
];
type Command = [string, string, string, string[], string, Problem['kind']?];
const commands: Command[] = [
  [
    'Safe shell pipeline',
    'Linux and shell',
    'Enter the exact Bash option command enabling exit-on-error, unset-variable errors, and failed-pipeline detection.',
    ['set -euo pipefail'],
    'pipefail propagates a failing pipeline component. errexit has contextual exceptions; do not treat these flags as complete error handling.',
    'fill',
  ],
  [
    'Git conflict recovery',
    'Git workflows',
    'Order these exact commands for a rebase paused on conflicts: git rebase --continue; git add fixed.txt; edit fixed.txt. One command per line.',
    ['edit fixed.txt', 'git add fixed.txt', 'git rebase --continue'],
    'Resolve the file, stage the resolved content, then continue. Use git rebase --abort to return to the pre-rebase state.',
    'order',
  ],
  [
    'Find a regression commit',
    'Git workflows',
    'Order the exact commands: git bisect good v1.0; git bisect run npm test; git bisect start; git bisect bad HEAD.',
    ['git bisect start', 'git bisect bad HEAD', 'git bisect good v1.0', 'git bisect run npm test'],
    'Bisect requires a known bad and known good boundary. The test command must return meaningful exit codes and work across candidate revisions.',
    'order',
  ],
  [
    'Undo a published commit',
    'Git workflows',
    'A commit already exists on a shared branch. Enter the non-history-rewriting command to create its inverse for commit abc123.',
    ['git revert abc123'],
    'Revert records an inverse commit. Reset plus force-push rewrites shared history and can disrupt collaborators.',
    'fill',
  ],
  [
    'Docker layer invalidation',
    'Dockerfiles and Compose',
    'Predict yes/no: If COPY . . precedes RUN npm ci and one source file changes, must that npm ci layer be rebuilt?',
    ['yes'],
    'Each layer cache depends on its preceding filesystem state. Put stable dependency manifests before volatile source.',
  ],
  [
    'DNS versus TCP',
    'Networking fundamentals',
    'A hostname resolves correctly, but connecting to port 443 times out. Does successful DNS prove the TCP port is reachable? Enter yes/no.',
    ['no'],
    'Name resolution and transport reachability are separate layers. Check routing, firewalls, listeners, and TCP handshakes.',
  ],
  [
    'SLO error budget',
    'Monitoring and incident response',
    'A 99.9% availability SLO over 30 days permits how many minutes unavailable? Enter the exact number.',
    ['43.2'],
    'Thirty days is 43,200 minutes; 0.1% is 43.2. Measurement windows and what counts as a good event must be agreed in advance.',
  ],
  [
    'Incident first response',
    'Monitoring and incident response',
    'Order: verify recovery; assess impact; mitigate with rollback; preserve timeline and open incident. Use the exact lines.',
    [
      'assess impact',
      'preserve timeline and open incident',
      'mitigate with rollback',
      'verify recovery',
    ],
    'Reduce customer impact before deep root-cause work, but preserve evidence and a clear incident timeline.',
    'order',
  ],
  [
    'Terraform plan boundary',
    'Terraform basics',
    'Predict yes/no: Does terraform plan normally apply the proposed infrastructure changes?',
    ['no'],
    'Plan previews changes and may refresh state/read remote resources; apply performs the planned mutations. A plan is not proof a later apply will succeed.',
  ],
  [
    'Shell output prediction',
    'Linux and shell',
    'Predict the output of: printf "%s\\n" "a b" | wc -l. Ignore leading spaces in wc output.',
    ['1'],
    'The quoted argument contains one line; spaces do not introduce newline characters.',
  ],
];
export const devopsProblems: Problem[] = configs.map((c) => {
  const language: Language = c.yaml ? 'yaml' : 'text';
  return {
    id: slug(c.title),
    title: c.title,
    topic: c.topic,
    track: 'devops',
    kind: c.kind ?? 'config',
    difficulty: 'Medium',
    description: `${c.prompt}\n\nSTATIC LAB: YAML is parsed and listed fields are checked. Docker/HCL/shell are bounded authored text checks, not real tools. Passing is not a deployability or security guarantee.`,
    languages: [language],
    starter: { [language]: c.starter },
    reference: { [language]: c.reference },
    rules: c.rules,
    tests: [{ args: [], expected: 'All authored rubric checks pass' }],
    hints: [
      'What must exist before the next operation can work?',
      'Which field links this resource to the thing it controls?',
      'What observation would prove readiness rather than just existence?',
    ],
    complexity: { time: 'Static rubric', space: 'Not assessed' },
    editorial: c.why,
    coach: coach(c.topic, `lesson-${slug(c.topic)}`),
    career: career(c.topic, 'devops'),
    prerequisites: [],
  };
});
devopsProblems.push(
  ...commands.map(([title, topic, prompt, answer, why, kind]): Problem => ({
    id: slug(title),
    title,
    topic,
    track: 'devops',
    kind: kind ?? 'predict',
    difficulty: 'Easy',
    description: `${prompt}\n\nAuthored command-semantics check; nothing runs on your machine.`,
    languages: ['text'],
    starter: { text: '' },
    reference: { text: answer.join('\n') },
    answer,
    tests: [{ args: [], expected: answer }],
    hints: [
      'Which step depends on a previous result?',
      'What does the command actually change?',
      'Which layer of the system does this observation test?',
    ],
    complexity: { time: 'Not assessed', space: 'Not assessed' },
    editorial: why,
    coach: coach(topic, `lesson-${slug(topic)}`),
    career: career(topic, 'devops'),
    prerequisites: [],
  })),
);
