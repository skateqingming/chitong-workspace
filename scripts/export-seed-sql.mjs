import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const dataPath = join(rootDir, "data", "app.json");
const seedPath = join(rootDir, "db", "seed-demo.sql");
const data = JSON.parse(await readFile(dataPath, "utf8"));
const lines = [
  "-- Demo seed generated from data/app.json",
  "-- Run after db/schema.sql. Demo passwords are intentionally plain text for prototype migration only.",
  "begin;"
];

insertRows("roles", data.roles.map((item) => ({
  id: item.id,
  name: item.name
})));

insertRows("role_permissions", data.roles.flatMap((role) =>
  role.permissions.map((permission) => ({
    role_id: role.id,
    permission
  }))
));

insertRows("departments", data.departments.map((item) => ({
  id: item.id,
  name: item.name,
  owner: item.owner,
  headcount_plan: item.headcountPlan,
  status: item.status
})));

insertRows("positions", data.positions.map((item) => ({
  id: item.id,
  title: item.title,
  department_id: findDepartmentId(item.department),
  department_name: item.department,
  level: item.level,
  salary_band: item.salaryBand,
  status: item.status
})));

insertRows("app_users", data.users.map((item) => ({
  id: item.id,
  name: item.name,
  email: item.email,
  demo_password: item.password,
  role_id: item.role,
  department_id: findDepartmentId(item.department),
  department_name: item.department
})));

insertRows("employees", data.employees.map((item) => ({
  id: item.id,
  name: item.name,
  department_id: findDepartmentId(item.department),
  department_name: item.department,
  title: item.title,
  status: item.status,
  onboard_date: item.onboardDate,
  leave_balance: item.leaveBalance,
  salary_base: item.salaryBase
})));

insertRows("handbook_articles", data.handbookArticles.map((item) => ({
  id: item.id,
  category: item.category,
  title: item.title,
  summary: item.summary,
  owner: item.owner,
  updated_at: item.updatedAt,
  content: json(item.content)
})));

insertRows("sop_workflows", data.sopWorkflows.map((item) => ({
  id: item.id,
  name: item.name,
  department_name: item.department,
  scenario: item.scenario,
  owner: item.owner,
  sla: item.sla,
  steps: json(item.steps)
})));

insertRows("work_sheets", data.workSheets.map((item) => ({
  id: item.id,
  title: item.title,
  department_name: item.department,
  owner: item.owner,
  participants: json(item.participants || []),
  status: item.status,
  fields: json(item.fields || []),
  updated_at: item.updatedAt
})));

insertRows("schedules", data.schedules.map((item) => ({
  id: item.id,
  schedule_time: item.time,
  title: item.title,
  department_name: item.department,
  location: item.location,
  owner: item.owner
})));

insertRows("notices", data.notices.map((item) => ({
  id: item.id,
  title: item.title,
  department_name: item.department,
  publisher: item.publisher,
  priority: item.priority,
  published_at: item.publishedAt,
  content: item.content
})));

insertRows("staff_assignments", data.staffAssignments.map((item) => ({
  id: item.id,
  project: item.project,
  department_name: item.department,
  lead: item.lead,
  members: json(item.members || []),
  participants: json(item.participants || []),
  shift: item.shift,
  status: item.status
})));

insertRows("kfs_scores", data.kfsScores.map((item) => ({
  id: item.id,
  employee_id: item.employeeId,
  employee_name: item.employeeName,
  department_name: item.department,
  k: item.k,
  f: item.f,
  s: item.s,
  coefficient: item.coefficient,
  bonus: item.bonus,
  notes: item.notes
})));

insertRows("leave_requests", data.leaveRequests.map((item) => ({
  id: item.id,
  employee_id: item.employeeId,
  employee_name: item.employeeName,
  type: item.type,
  days: item.days,
  reason: item.reason,
  status: item.status,
  submitted_at: item.submittedAt,
  reviewed_at: item.reviewedAt || null,
  reviewer: item.reviewer || null
})));

insertRows("payroll_runs", data.payrollRuns.map((item) => ({
  id: item.id,
  period: item.period,
  status: item.status,
  employee_count: item.employeeCount,
  gross_pay: item.grossPay,
  deductions: item.deductions,
  net_pay: item.netPay,
  owner: item.owner,
  generated_at: item.generatedAt || null
})));

insertRows("payslips", data.payrollRuns.flatMap((run) =>
  (run.payslips || []).map((item) => ({
    id: item.id,
    payroll_run_id: run.id,
    employee_id: item.employeeId,
    employee_name: item.employeeName,
    department_name: item.department,
    base_pay: item.basePay,
    allowance: item.allowance,
    gross_pay: item.grossPay,
    deductions: item.deductions,
    net_pay: item.netPay
  }))
));

insertRows("approvals", data.approvals.map((item) => ({
  id: item.id,
  title: item.title,
  owner: item.owner,
  amount: item.amount,
  status: item.status,
  created_at: item.createdAt
})));

insertRows("audit_logs", data.auditLogs.map((item) => ({
  id: item.id,
  user_id: item.userId,
  action: item.action,
  message: item.message,
  created_at: item.createdAt
})));

insertRows("app_metrics", Object.entries(data.metrics).map(([key, value]) => ({
  key,
  value
})));

lines.push("commit;", "");
await mkdir(dirname(seedPath), { recursive: true });
await writeFile(seedPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${seedPath}`);

function insertRows(table, rows) {
  if (!rows.length) {
    return;
  }

  const columns = Object.keys(rows[0]);
  lines.push("");
  lines.push(`insert into ${table} (${columns.join(", ")}) values`);
  lines.push(rows.map((row) => `  (${columns.map((column) => sqlValue(row[column])).join(", ")})`).join(",\n") + `\non conflict do nothing;`);
}

function findDepartmentId(name) {
  return data.departments.find((item) => item.name === name)?.id || null;
}

function json(value) {
  return { jsonb: value };
}

function sqlValue(value) {
  if (value && typeof value === "object" && "jsonb" in value) {
    return `${quote(JSON.stringify(value.jsonb))}::jsonb`;
  }

  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return quote(String(value));
}

function quote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}
