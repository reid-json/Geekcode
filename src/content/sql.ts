import { career, coach, slug, type Problem } from './schema';

export const sqlSeed = `
CREATE TABLE departments(id INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE employees(id INTEGER PRIMARY KEY,name TEXT,department_id INTEGER,salary INTEGER,manager_id INTEGER);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer TEXT,amount INTEGER,ordered_on TEXT);
INSERT INTO departments VALUES (1,'Engineering'),(2,'Support'),(3,'Research');
INSERT INTO employees VALUES (1,'Ada',1,120,NULL),(2,'Lin',1,100,1),(3,'Sam',2,80,NULL),(4,'Jo',2,80,3),(5,'Kai',NULL,60,NULL);
INSERT INTO orders VALUES (1,'Ada',40,'2026-01-01'),(2,'Ada',60,'2026-01-02'),(3,'Lin',30,'2026-01-02'),(4,'Sam',90,'2026-01-03');
`;
type SqlDrill = [string, string, string, string, unknown[][], string, unknown[][]];
const drills: SqlDrill[] = [
  [
    'Department headcounts',
    'Joins and aggregation',
    'List every department name and employee count, including empty departments, by department id.',
    'SELECT d.name, COUNT(e.id) FROM departments d LEFT JOIN employees e ON e.department_id=d.id GROUP BY d.id,d.name ORDER BY d.id',
    [
      ['Engineering', 2],
      ['Support', 2],
      ['Research', 0],
    ],
    "INSERT INTO employees VALUES (6,'Pat',3,70,NULL);",
    [
      ['Engineering', 2],
      ['Support', 2],
      ['Research', 1],
    ],
  ],
  [
    'Above departmental average',
    'CTEs and subqueries',
    'Return employee names with salary strictly above their department average, sorted by name. Employees without a department are excluded.',
    'SELECT name FROM employees e WHERE department_id IS NOT NULL AND salary > (SELECT AVG(salary) FROM employees x WHERE x.department_id=e.department_id) ORDER BY name',
    [['Ada']],
    "INSERT INTO employees VALUES(6,'Zed',2,200,NULL);",
    [['Ada'], ['Zed']],
  ],
  [
    'Salary dense rank',
    'Window functions',
    'Return name and dense salary rank within department, including the NULL-department partition, ordered by employee id.',
    'SELECT name,DENSE_RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) FROM employees ORDER BY id',
    [
      ['Ada', 1],
      ['Lin', 2],
      ['Sam', 1],
      ['Jo', 1],
      ['Kai', 1],
    ],
    "INSERT INTO employees VALUES(6,'Pat',1,100,NULL);",
    [
      ['Ada', 1],
      ['Lin', 2],
      ['Sam', 1],
      ['Jo', 1],
      ['Kai', 1],
      ['Pat', 2],
    ],
  ],
  [
    'Running order revenue',
    'Window functions',
    'Return order id and cumulative amount ordered by ordered_on, then id. Include the current row.',
    'SELECT id,SUM(amount) OVER(ORDER BY ordered_on,id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders ORDER BY ordered_on,id',
    [
      [1, 40],
      [2, 100],
      [3, 130],
      [4, 220],
    ],
    "INSERT INTO orders VALUES(5,'Jo',10,'2026-01-02');",
    [
      [1, 40],
      [2, 100],
      [3, 130],
      [5, 140],
      [4, 230],
    ],
  ],
  [
    'Customers over a threshold',
    'Joins and aggregation',
    'Return customer and total spend for totals >=90, ordered by total descending then customer ascending.',
    'SELECT customer,SUM(amount) AS total FROM orders GROUP BY customer HAVING SUM(amount)>=90 ORDER BY total DESC,customer',
    [
      ['Ada', 100],
      ['Sam', 90],
    ],
    "INSERT INTO orders VALUES(5,'Lin',60,'2026-01-04');",
    [
      ['Ada', 100],
      ['Lin', 90],
      ['Sam', 90],
    ],
  ],
  [
    'Employees without orders',
    'Joins and aggregation',
    'Return names of employees who have no matching customer name in orders, sorted by name. Use a null-safe anti-join.',
    'SELECT e.name FROM employees e WHERE NOT EXISTS(SELECT 1 FROM orders o WHERE o.customer=e.name) ORDER BY e.name',
    [['Jo'], ['Kai']],
    "INSERT INTO orders VALUES(5,NULL,5,'2026-01-05');",
    [['Jo'], ['Kai']],
  ],
  [
    'Manager relationships',
    'Joins and aggregation',
    'Return employee name and manager name for employees with a manager, ordered by employee id.',
    'SELECT e.name,m.name FROM employees e JOIN employees m ON e.manager_id=m.id ORDER BY e.id',
    [
      ['Lin', 'Ada'],
      ['Jo', 'Sam'],
    ],
    "INSERT INTO employees VALUES(6,'Pat',1,50,2);",
    [
      ['Lin', 'Ada'],
      ['Jo', 'Sam'],
      ['Pat', 'Lin'],
    ],
  ],
  [
    'Recursive reports',
    'Recursive queries',
    'Starting from employee 1, list that employee and every transitive report as [name,depth], ordered by depth then name. Seed data has no manager cycle.',
    'WITH RECURSIVE team(id,name,depth) AS (SELECT id,name,0 FROM employees WHERE id=1 UNION ALL SELECT e.id,e.name,t.depth+1 FROM employees e JOIN team t ON e.manager_id=t.id) SELECT name,depth FROM team ORDER BY depth,name',
    [
      ['Ada', 0],
      ['Lin', 1],
    ],
    "INSERT INTO employees VALUES(6,'Pat',1,50,2);",
    [
      ['Ada', 0],
      ['Lin', 1],
      ['Pat', 2],
    ],
  ],
  [
    'Previous order amount',
    'Window functions',
    'Return order id and previous order amount for that customer, ordered by order id. Order each customer history by date then id. No predecessor is NULL.',
    'SELECT id,LAG(amount) OVER(PARTITION BY customer ORDER BY ordered_on,id) FROM orders ORDER BY id',
    [
      [1, null],
      [2, 40],
      [3, null],
      [4, null],
    ],
    "INSERT INTO orders VALUES(5,'Ada',10,'2026-01-04');",
    [
      [1, null],
      [2, 40],
      [3, null],
      [4, null],
      [5, 60],
    ],
  ],
  [
    'Department salary share',
    'Window functions',
    'Return name and salary divided by the sum of salaries in their department, ordered by id. Include the NULL partition and use real division.',
    'SELECT name,1.0*salary/SUM(salary) OVER(PARTITION BY department_id) FROM employees ORDER BY id',
    [
      ['Ada', 120 / 220],
      ['Lin', 100 / 220],
      ['Sam', 0.5],
      ['Jo', 0.5],
      ['Kai', 1],
    ],
    "INSERT INTO employees VALUES(6,'Pat',2,160,NULL);",
    [
      ['Ada', 120 / 220],
      ['Lin', 100 / 220],
      ['Sam', 0.25],
      ['Jo', 0.25],
      ['Kai', 1],
      ['Pat', 0.5],
    ],
  ],
  [
    'Most recent customer order',
    'CTEs and subqueries',
    'Return customer and most recent order amount, breaking same-date ties by largest id, sorted by customer.',
    'WITH ranked AS(SELECT customer,amount,ROW_NUMBER() OVER(PARTITION BY customer ORDER BY ordered_on DESC,id DESC) AS rn FROM orders) SELECT customer,amount FROM ranked WHERE rn=1 ORDER BY customer',
    [
      ['Ada', 60],
      ['Lin', 30],
      ['Sam', 90],
    ],
    "INSERT INTO orders VALUES(5,'Ada',25,'2026-01-02');",
    [
      ['Ada', 25],
      ['Lin', 30],
      ['Sam', 90],
    ],
  ],
  [
    'Daily totals',
    'Joins and aggregation',
    'Return ordered_on and summed amount, sorted by date.',
    'SELECT ordered_on,SUM(amount) FROM orders GROUP BY ordered_on ORDER BY ordered_on',
    [
      ['2026-01-01', 40],
      ['2026-01-02', 90],
      ['2026-01-03', 90],
    ],
    "INSERT INTO orders VALUES(5,'Jo',10,'2026-01-01');",
    [
      ['2026-01-01', 50],
      ['2026-01-02', 90],
      ['2026-01-03', 90],
    ],
  ],
  [
    'Second distinct salary',
    'CTEs and subqueries',
    'Return one row containing the second highest distinct salary, or NULL if fewer than two distinct salaries exist.',
    'SELECT MAX(salary) FROM employees WHERE salary<(SELECT MAX(salary) FROM employees)',
    [[100]],
    "DELETE FROM employees; INSERT INTO employees VALUES(9,'Only',1,7,NULL);",
    [[null]],
  ],
  [
    'Null department label',
    'SQL idioms',
    'Return employee name and department name, using Unassigned when no department exists, ordered by employee id.',
    "SELECT e.name,COALESCE(d.name,'Unassigned') FROM employees e LEFT JOIN departments d ON e.department_id=d.id ORDER BY e.id",
    [
      ['Ada', 'Engineering'],
      ['Lin', 'Engineering'],
      ['Sam', 'Support'],
      ['Jo', 'Support'],
      ['Kai', 'Unassigned'],
    ],
    'DELETE FROM employees WHERE id<>5;',
    [['Kai', 'Unassigned']],
  ],
  [
    'Deterministic salary pagination',
    'Indexes and query plans',
    'Return the second and third employee names in descending salary order, breaking ties by ascending id.',
    'SELECT name FROM employees ORDER BY salary DESC,id ASC LIMIT 2 OFFSET 1',
    [['Lin'], ['Sam']],
    "INSERT INTO employees VALUES(6,'Pat',1,130,NULL);",
    [['Ada'], ['Lin']],
  ],
];
export const sqlProblems: Problem[] = drills.map(
  ([title, topic, prompt, reference, expected, extra, hidden]) => ({
    id: slug(title),
    title,
    topic,
    track: 'sql',
    kind: 'code',
    difficulty: topic === 'Recursive queries' ? 'Hard' : 'Medium',
    description: `${prompt}\n\nSchema: departments(id,name); employees(id,name,department_id,salary,manager_id); orders(id,customer,amount,ordered_on). Salary/amount are integer units. Dates are ISO text. Return the requested columns only. Read-only SQLite; the last SELECT result is graded. Each test starts from a fresh database.`,
    languages: ['sql'],
    starter: { sql: '-- Inspect the schema in the description.\nSELECT * FROM employees;\n' },
    reference: { sql: reference },
    seed: sqlSeed,
    tests: [
      { args: [], expected, label: 'Seed database' },
      { args: [extra], expected: hidden, hidden: true, label: 'Changed data' },
    ],
    hints: [
      'Which rows must survive when no match exists?',
      'What defines a group, and what defines ordering inside it?',
      'How would tied values or a missing value change your result?',
    ],
    complexity: {
      time: 'Plan-dependent; inspect indexes and cardinality',
      space: 'Plan-dependent',
    },
    editorial: `The reference query makes row identity, grouping, and output ordering explicit. Compare a correlated subquery with a join/CTE formulation where applicable: repeated scans can cost more, while joins can multiply rows accidentally. Check NULL semantics and ties. For performance, use EXPLAIN QUERY PLAN and consider an index matching filter and ordering columns; do not assume an index is always used.`,
    coach: coach(topic, `lesson-${slug(topic)}`, [topic]),
    career: career(topic, 'sql'),
    prerequisites: [],
  }),
);
