-- 赤瞳工作空间 PostgreSQL schema
-- 目标：把 data/app.json 拆成可长期维护的业务表，先满足内部系统最小上线。

create extension if not exists pgcrypto;

create table if not exists roles (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id text not null references roles(id) on delete cascade,
  permission text not null,
  primary key (role_id, permission)
);

create table if not exists departments (
  id text primary key,
  name text not null unique,
  owner text not null,
  headcount_plan integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists positions (
  id text primary key,
  title text not null,
  department_id text references departments(id),
  department_name text not null,
  level text not null default 'P1',
  salary_band text not null default '待定',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text,
  demo_password text,
  role_id text not null references roles(id),
  department_id text references departments(id),
  department_name text not null,
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employees (
  id text primary key,
  name text not null,
  department_id text references departments(id),
  department_name text not null,
  title text not null,
  status text not null default 'active',
  onboard_date date not null,
  leave_balance numeric(6, 2) not null default 0,
  salary_base numeric(12, 2) not null default 0,
  phone text not null default '',
  emergency_contact text not null default '',
  address text not null default '',
  skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists handbook_articles (
  id text primary key,
  category text not null,
  title text not null,
  summary text not null,
  owner text not null,
  updated_at date not null,
  content jsonb not null default '[]'::jsonb
);

create table if not exists sop_workflows (
  id text primary key,
  name text not null,
  department_name text not null,
  scenario text not null,
  owner text not null,
  sla text not null,
  steps jsonb not null default '[]'::jsonb
);

create table if not exists work_sheets (
  id text primary key,
  title text not null,
  department_name text not null,
  owner text not null,
  participants jsonb not null default '[]'::jsonb,
  audience_departments jsonb not null default '[]'::jsonb,
  audience_titles jsonb not null default '[]'::jsonb,
  status text not null,
  fields jsonb not null default '[]'::jsonb,
  updated_at date not null
);

create table if not exists schedules (
  id text primary key,
  schedule_date date,
  day_label text not null default '',
  schedule_time text not null,
  title text not null,
  department_name text not null,
  location text not null,
  owner text not null
);

create table if not exists notices (
  id text primary key,
  title text not null,
  department_name text not null,
  publisher text not null,
  priority text not null,
  published_at date not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists staff_assignments (
  id text primary key,
  project text not null,
  department_name text not null,
  lead text not null,
  members jsonb not null default '[]'::jsonb,
  participants jsonb not null default '[]'::jsonb,
  shift text not null,
  status text not null
);

create table if not exists kfs_scores (
  id text primary key,
  employee_id text references employees(id),
  employee_name text not null,
  department_name text not null,
  k numeric(5, 2) not null,
  f numeric(5, 2) not null,
  s numeric(5, 2) not null,
  coefficient numeric(6, 3) not null,
  bonus numeric(12, 2) not null default 0,
  notes text not null default ''
);

create table if not exists leave_requests (
  id text primary key,
  employee_id text references employees(id),
  employee_name text not null,
  type text not null,
  days numeric(6, 2) not null,
  reason text not null default '',
  status text not null default 'pending',
  submitted_at date not null,
  reviewed_at timestamptz,
  reviewer text
);

create table if not exists payroll_runs (
  id text primary key,
  period text not null unique,
  status text not null,
  employee_count integer not null default 0,
  gross_pay numeric(14, 2) not null default 0,
  deductions numeric(14, 2) not null default 0,
  net_pay numeric(14, 2) not null default 0,
  owner text not null,
  generated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payslips (
  id text primary key,
  payroll_run_id text not null references payroll_runs(id) on delete cascade,
  employee_id text references employees(id),
  employee_name text not null,
  department_name text not null,
  base_pay numeric(12, 2) not null default 0,
  allowance numeric(12, 2) not null default 0,
  gross_pay numeric(12, 2) not null default 0,
  deductions numeric(12, 2) not null default 0,
  net_pay numeric(12, 2) not null default 0
);

create table if not exists approvals (
  id text primary key,
  title text not null,
  owner text not null,
  amount text not null default '-',
  status text not null default 'pending',
  created_at date not null
);

create table if not exists audit_logs (
  id text primary key,
  user_id text references app_users(id),
  action text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists app_metrics (
  key text primary key,
  value numeric(14, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_email on app_users(email);
create index if not exists idx_employees_department on employees(department_name);
create index if not exists idx_leave_requests_status on leave_requests(status);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);
create index if not exists idx_notices_department on notices(department_name);
create index if not exists idx_payroll_runs_period on payroll_runs(period desc);
