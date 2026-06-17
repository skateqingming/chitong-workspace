import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, isAbsolute, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(rootDir, "public");
const bundledDataPath = join(rootDir, "data", "app.json");
const dataPath = resolveDataPath(process.env.DATA_FILE || join("data", "app.json"));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES || 1024 * 1024);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml"
};

if (process.argv.includes("--check")) {
  const data = await loadData();
  assertShape(data);
  console.log("Project check passed.");
  process.exit(0);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/healthz") {
      sendJson(response, 200, {
        ok: true,
        service: "chitong-workspace",
        storage: process.env.DATABASE_URL ? "postgres-ready" : "json-file"
      });
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "服务器开小差了，请稍后再试。" });
  }
});

server.listen(port, host, () => {
  console.log(`Internal app is running at http://${host}:${port}`);
});

async function handleApi(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/login") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const user = data.users.find(
      (item) => item.email === body.email && item.password === body.password
    );

    if (!user) {
      sendJson(response, 401, { error: "账号或密码不正确。" });
      return;
    }

    await appendAuditLog(data, user.id, "login", "用户登录系统");
    await saveData(data);

    sendJson(response, 200, {
      user: publicUser(user),
      token: Buffer.from(`${user.id}:${Date.now()}`).toString("base64")
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    const data = await loadData();
    sendJson(response, 200, {
      metrics: data.metrics,
      approvals: data.approvals,
      employees: data.employees,
      departments: data.departments,
      positions: data.positions,
      handbookArticles: data.handbookArticles,
      sopWorkflows: data.sopWorkflows,
      workSheets: data.workSheets,
      schedules: data.schedules,
      notices: data.notices,
      staffAssignments: data.staffAssignments,
      kfsScores: data.kfsScores,
      leaveRequests: data.leaveRequests,
      payrollRuns: data.payrollRuns,
      auditLogs: data.auditLogs.slice(-8).reverse(),
      roles: data.roles,
      users: data.users.map(publicUser)
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/approvals") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const approval = {
      id: `APP-${String(data.approvals.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名申请"),
      owner: String(body.owner || "未知提交人"),
      amount: String(body.amount || "-"),
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10)
    };
    data.approvals.unshift(approval);
    await appendAuditLog(data, "user-002", "create_approval", `新增申请：${approval.title}`);
    await saveData(data);
    sendJson(response, 201, { approval });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/employees") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const employee = {
      id: `EMP-${String(data.employees.length + 1).padStart(4, "0")}`,
      name: String(body.name || "未命名员工"),
      department: String(body.department || "未分配"),
      title: String(body.title || "待定岗位"),
      status: "active",
      onboardDate: new Date().toISOString().slice(0, 10),
      leaveBalance: Number(body.leaveBalance || 5),
      salaryBase: Number(body.salaryBase || 8000)
    };
    data.employees.unshift(employee);
    data.metrics.employeeCount = data.employees.filter((item) => item.status === "active").length;
    await appendAuditLog(data, "user-001", "create_employee", `新增员工：${employee.name}`);
    await saveData(data);
    sendJson(response, 201, { employee });
    return;
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/employees/")) {
    const data = await loadData();
    const employeeId = decodeURIComponent(url.pathname.split("/").pop() || "");
    const employee = data.employees.find((item) => item.id === employeeId);

    if (!employee) {
      sendJson(response, 404, { error: "员工不存在。" });
      return;
    }

    employee.status = "inactive";
    employee.leftAt = new Date().toISOString().slice(0, 10);
    refreshMetrics(data);
    await appendAuditLog(data, "user-001", "delete_employee", `删除员工：${employee.name}`);
    await saveData(data);
    sendJson(response, 200, { employee });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/departments") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const department = {
      id: `DEP-${String(data.departments.length + 1).padStart(4, "0")}`,
      name: String(body.name || "未命名部门"),
      owner: String(body.owner || "待定负责人"),
      headcountPlan: Number(body.headcountPlan || 0),
      status: "active"
    };
    data.departments.unshift(department);
    await appendAuditLog(data, "user-001", "create_department", `新增部门：${department.name}`);
    await saveData(data);
    sendJson(response, 201, { department });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/positions") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const position = {
      id: `POS-${String(data.positions.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名岗位"),
      department: String(body.department || "未分配"),
      level: String(body.level || "P1"),
      salaryBand: String(body.salaryBand || "待定"),
      status: "active"
    };
    data.positions.unshift(position);
    await appendAuditLog(data, "user-001", "create_position", `新增岗位：${position.title}`);
    await saveData(data);
    sendJson(response, 201, { position });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/notices") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const noticeId = String(body.noticeId || "");
    const existingIndex = data.notices.findIndex((item) => item.id === noticeId);
    const notice = {
      id: noticeId || `NTC-${String(data.notices.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名公告"),
      department: String(body.department || "全员"),
      publisher: "管理员",
      priority: String(body.priority || "通知"),
      publishedAt: existingIndex >= 0 ? data.notices[existingIndex].publishedAt : new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      content: String(body.content || "")
    };

    if (existingIndex >= 0) {
      data.notices[existingIndex] = notice;
    } else {
      data.notices.unshift(notice);
    }

    await appendAuditLog(data, "user-001", existingIndex >= 0 ? "update_notice" : "create_notice", `${existingIndex >= 0 ? "修改" : "发布"}公告：${notice.title}`);
    await saveData(data);
    sendJson(response, existingIndex >= 0 ? 200 : 201, { notice });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/schedules") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const scheduleId = String(body.scheduleId || "");
    const schedule = {
      id: scheduleId || `SCH-${String(data.schedules.length + 1).padStart(4, "0")}`,
      date: String(body.date || new Date().toISOString().slice(0, 10)),
      day: formatShortWeekday(String(body.date || new Date().toISOString().slice(0, 10))),
      time: String(body.time || "09:30"),
      title: String(body.title || "未命名日程"),
      department: String(body.department || "全员"),
      location: String(body.location || "待定"),
      owner: String(body.owner || "管理员")
    };
    const existingIndex = data.schedules.findIndex((item) => item.id === schedule.id);

    if (existingIndex >= 0) {
      data.schedules[existingIndex] = schedule;
    } else {
      data.schedules.unshift(schedule);
    }

    await appendAuditLog(data, "user-001", existingIndex >= 0 ? "update_schedule" : "create_schedule", `${existingIndex >= 0 ? "修改" : "新增"}日程：${schedule.title}`);
    await saveData(data);
    sendJson(response, existingIndex >= 0 ? 200 : 201, { schedule });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/leave-requests") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const employee = data.employees.find((item) => item.id === body.employeeId);
    const days = Number(body.days || 1);
    const leaveRequest = {
      id: `LEV-${String(data.leaveRequests.length + 1).padStart(4, "0")}`,
      employeeId: String(body.employeeId || ""),
      employeeName: employee?.name || String(body.employeeName || "未知员工"),
      type: String(body.type || "年假"),
      days,
      reason: String(body.reason || "未填写原因"),
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10)
    };
    data.leaveRequests.unshift(leaveRequest);
    data.metrics.pendingLeaves = data.leaveRequests.filter((item) => item.status === "pending").length;
    await appendAuditLog(data, "user-002", "create_leave_request", `新增请假申请：${leaveRequest.employeeName} ${leaveRequest.days} 天`);
    await saveData(data);
    sendJson(response, 201, { leaveRequest });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/leave-requests/action") {
    const body = await readJsonBody(request);
    const data = await loadData();
    const leaveRequest = data.leaveRequests.find((item) => item.id === body.id);
    const action = String(body.action || "");

    if (!leaveRequest) {
      sendJson(response, 404, { error: "请假申请不存在。" });
      return;
    }

    if (!["approved", "rejected"].includes(action)) {
      sendJson(response, 400, { error: "审批动作不正确。" });
      return;
    }

    if (leaveRequest.status !== "pending" && leaveRequest.status !== "review") {
      sendJson(response, 409, { error: "该申请已经处理过了。" });
      return;
    }

    leaveRequest.status = action;
    leaveRequest.reviewedAt = new Date().toISOString();
    leaveRequest.reviewer = "周主管";

    if (action === "approved") {
      const employee = data.employees.find((item) => item.id === leaveRequest.employeeId);
      if (employee) {
        employee.leaveBalance = Math.max(0, Number(employee.leaveBalance || 0) - Number(leaveRequest.days || 0));
      }
    }

    refreshMetrics(data);
    await appendAuditLog(
      data,
      "user-002",
      action === "approved" ? "approve_leave_request" : "reject_leave_request",
      `${action === "approved" ? "通过" : "驳回"}请假申请：${leaveRequest.employeeName} ${leaveRequest.days} 天`
    );
    await saveData(data);
    sendJson(response, 200, { leaveRequest });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/payroll-runs/generate") {
    const data = await loadData();
    const period = new Date().toISOString().slice(0, 7);
    const activeEmployees = data.employees.filter((item) => item.status === "active");
    const payslips = activeEmployees.map((employee) => createPayslip(employee, period));
    const totals = payslips.reduce(
      (summary, item) => ({
        grossPay: summary.grossPay + item.grossPay,
        deductions: summary.deductions + item.deductions,
        netPay: summary.netPay + item.netPay
      }),
      { grossPay: 0, deductions: 0, netPay: 0 }
    );
    const payrollRun = {
      id: `PAY-${period}`,
      period,
      status: "reviewed",
      employeeCount: activeEmployees.length,
      grossPay: totals.grossPay,
      deductions: totals.deductions,
      netPay: totals.netPay,
      owner: "许会计",
      generatedAt: new Date().toISOString(),
      payslips
    };
    const existingIndex = data.payrollRuns.findIndex((item) => item.id === payrollRun.id);

    if (existingIndex >= 0) {
      data.payrollRuns[existingIndex] = {
        ...data.payrollRuns[existingIndex],
        ...payrollRun
      };
    } else {
      data.payrollRuns.unshift(payrollRun);
    }

    refreshMetrics(data);
    await appendAuditLog(data, "user-001", "generate_payroll", `生成 ${period} 工资单：${activeEmployees.length} 人`);
    await saveData(data);
    sendJson(response, 201, { payrollRun });
    return;
  }

  sendJson(response, 404, { error: "接口不存在。" });
}

async function serveStatic(pathname, response) {
  const safePath = normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    sendJson(response, 404, { error: "页面不存在。" });
    return;
  }

  const content = await readFile(filePath);
  response.writeHead(200, {
    ...securityHeaders(),
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "Cache-Control": extname(filePath) === ".html" ? "no-store" : "public, max-age=3600"
  });
  response.end(content);
}

async function loadData() {
  if (!existsSync(dataPath)) {
    const bundledData = await readFile(bundledDataPath, "utf8");
    await mkdir(dirname(dataPath), { recursive: true });
    await writeFile(dataPath, bundledData);
  }

  const raw = await readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

async function saveData(data) {
  await mkdir(dirname(dataPath), { recursive: true });
  const tempPath = `${dataPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tempPath, dataPath);
}

async function readJsonBody(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > maxBodyBytes) {
      throw new Error("请求内容过大。");
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function appendAuditLog(data, userId, action, message) {
  data.auditLogs.push({
    id: `LOG-${Date.now()}`,
    userId,
    action,
    message,
    createdAt: new Date().toISOString()
  });
}

function createPayslip(employee, period) {
  const basePay = Number(employee.salaryBase || 0);
  const allowance = Math.round(basePay * 0.08);
  const socialSecurity = Math.round(basePay * 0.11);
  const tax = Math.round(Math.max(0, basePay + allowance - socialSecurity - 5000) * 0.08);
  const deductions = socialSecurity + tax;
  const grossPay = basePay + allowance;

  return {
    id: `SLIP-${period}-${employee.id}`,
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    basePay,
    allowance,
    grossPay,
    deductions,
    netPay: grossPay - deductions
  };
}

function refreshMetrics(data) {
  data.metrics.employeeCount = data.employees.filter((item) => item.status === "active").length;
  data.metrics.pendingLeaves = data.leaveRequests.filter((item) => item.status === "pending").length;
  const currentRun = data.payrollRuns[0];
  data.metrics.payrollTotal = Number(currentRun?.grossPay || 0);
}

function formatShortWeekday(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "待定";
  }

  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    ...securityHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function assertShape(data) {
  for (const key of ["users", "roles", "metrics", "approvals", "employees", "departments", "positions", "handbookArticles", "sopWorkflows", "workSheets", "schedules", "notices", "staffAssignments", "kfsScores", "leaveRequests", "payrollRuns", "auditLogs"]) {
    if (!Array.isArray(data[key]) && key !== "metrics") {
      throw new Error(`data/app.json 缺少数组字段：${key}`);
    }
  }
}

function resolveDataPath(value) {
  return isAbsolute(value) ? value : join(rootDir, value);
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  };
}
