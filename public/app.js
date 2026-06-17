const state = {
  user: null,
  bootstrap: null,
  employeeFilters: {
    query: "",
    department: "all",
    position: "all"
  },
  handbookFilters: {
    query: "",
    category: "all"
  },
  sopFilters: {
    query: "",
    department: "all"
  },
  knowledge: {
    query: "",
    activeTab: "handbook"
  },
  activeModule: "work"
};

const loginForm = document.querySelector("#loginForm");
const hero = document.querySelector(".hero");
const loginCard = document.querySelector("#loginCard");
const workspace = document.querySelector("#workspace");
const bottomNav = document.querySelector("#bottomNav");
const adminGrid = document.querySelector(".hr-grid");
const welcomeTitle = document.querySelector("#welcomeTitle");
const metrics = document.querySelector("#metrics");
const workTodayMeta = document.querySelector("#workTodayMeta");
const modulePanels = document.querySelectorAll("[data-module-panel]");
const moduleNavItems = document.querySelectorAll("[data-module-target]");
const workSheetList = document.querySelector("#workSheetList");
const profileForm = document.querySelector("#profileForm");
const profileSummary = document.querySelector("#profileSummary");
const avatarInput = document.querySelector("#avatarInput");
const avatarPreview = document.querySelector("#avatarPreview");
const avatarName = document.querySelector("#avatarName");
const avatarRole = document.querySelector("#avatarRole");
const scheduleList = document.querySelector("#scheduleList");
const employeeScheduleList = document.querySelector("#employeeScheduleList");
const weeklyScheduleList = document.querySelector("#weeklyScheduleList");
const employeeAssignmentList = document.querySelector("#employeeAssignmentList");
const noticeList = document.querySelector("#noticeList");
const handbookList = document.querySelector("#handbookList");
const sopList = document.querySelector("#sopList");
const faqList = document.querySelector("#faqList");
const shootingReferenceList = document.querySelector("#shootingReferenceList");
const standardProcessList = document.querySelector("#standardProcessList");
const kfsList = document.querySelector("#kfsList");
const assignmentList = document.querySelector("#assignmentList");
const approvalList = document.querySelector("#approvalList");
const employeeList = document.querySelector("#employeeList");
const departmentList = document.querySelector("#departmentList");
const positionList = document.querySelector("#positionList");
const leaveList = document.querySelector("#leaveList");
const payrollList = document.querySelector("#payrollList");
const auditList = document.querySelector("#auditList");
const employeeForm = document.querySelector("#employeeForm");
const workSheetForm = document.querySelector("#workSheetForm");
const approvalForm = document.querySelector("#approvalForm");
const departmentForm = document.querySelector("#departmentForm");
const positionForm = document.querySelector("#positionForm");
const noticeForm = document.querySelector("#noticeForm");
const scheduleForm = document.querySelector("#scheduleForm");
const employeeDepartmentSelect = document.querySelector("#employeeDepartmentSelect");
const employeePositionSelect = document.querySelector("#employeePositionSelect");
const positionDepartmentSelect = document.querySelector("#positionDepartmentSelect");
const workSheetDepartmentSelect = document.querySelector("#workSheetDepartmentSelect");
const workSheetPositionSelect = document.querySelector("#workSheetPositionSelect");
const noticeDepartmentSelect = document.querySelector("#noticeDepartmentSelect");
const scheduleDepartmentSelect = document.querySelector("#scheduleDepartmentSelect");
const scheduleIdInput = document.querySelector("#scheduleIdInput");
const scheduleSubmitButton = document.querySelector("#scheduleSubmitButton");
const scheduleCancelButton = document.querySelector("#scheduleCancelButton");
const employeeSearchInput = document.querySelector("#employeeSearchInput");
const departmentFilter = document.querySelector("#departmentFilter");
const positionFilter = document.querySelector("#positionFilter");
const knowledgeSearchInput = document.querySelector("#knowledgeSearchInput");
const knowledgeTabButtons = document.querySelectorAll("[data-knowledge-tab]");
const knowledgeSections = document.querySelectorAll("[data-knowledge-section]");
const leaveForm = document.querySelector("#leaveForm");
const leaveEmployeeSelect = document.querySelector("#leaveEmployeeSelect");
const generatePayrollButton = document.querySelector("#generatePayrollButton");
const logoutButton = document.querySelector("#logoutButton");
const detailDialog = document.querySelector("#detailDialog");
const dialogContent = document.querySelector("#dialogContent");
const dialogCloseButton = document.querySelector("#dialogCloseButton");
const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
const staticStorageKey = "chitong-static-data-v10";
let staticDataPromise = null;
let loginInProgress = false;

const apiPath = (endpoint) => `api/${endpoint}`;
const avatarStorageKey = "chitong-avatar-image";
const isStaticHost = () => window.location.protocol === "file:" || window.location.hostname.endsWith("github.io");

const apiRequest = (endpoint, options = {}) => {
  if (isStaticHost()) {
    return handleStaticApi(`/api/${endpoint}`, options);
  }

  return fetch(apiPath(endpoint), options);
};

window.fetch = async (resource, options = {}) => {
  if (!nativeFetch) {
    return handleStaticApi(new URL(typeof resource === "string" ? resource : resource.url, window.location.href).pathname, options);
  }

  const requestUrl = typeof resource === "string" ? resource : resource.url;
  const pathname = new URL(requestUrl, window.location.href).pathname;

  if (!pathname.includes("/api/")) {
    return nativeFetch(resource, options);
  }

  if (localStorage.getItem(staticStorageKey)) {
    return handleStaticApi(pathname, options);
  }

  try {
    const response = await nativeFetch(resource, options);
    const contentType = response.headers.get("Content-Type") || "";
    if (response.ok && contentType.includes("application/json")) {
      return response;
    }
  } catch {
    // Static hosting has no API server; the local fallback below keeps the preview usable.
  }

  return handleStaticApi(pathname, options);
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // The app still works without offline caching, especially during local HTTP testing.
  });
}

loginForm.addEventListener("submit", handleLogin);
loginForm.querySelector("button[type='submit']")?.addEventListener("click", handleLogin);

async function handleLogin(event) {
  event.preventDefault();
  if (loginInProgress) {
    return;
  }

  loginInProgress = true;
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await apiRequest("login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.error || "登录失败");
      return;
    }

    state.user = result.user;
    await loadWorkspace();
  } catch (error) {
    alert(`登录没有完成：${error.message || "浏览器数据组件不可用"}。请刷新页面后再试。`);
  } finally {
    loginInProgress = false;
  }
}

logoutButton?.addEventListener("click", () => {
  state.user = null;
  state.activeModule = "work";
  workspace.classList.add("is-hidden");
  bottomNav.classList.add("is-hidden");
  hero.classList.remove("is-hidden");
  loginCard.classList.remove("is-hidden");
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(profileForm);

  const response = await apiRequest("profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "保存资料失败");
    return;
  }

  await loadWorkspace();
});

avatarInput?.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    localStorage.setItem(avatarStorageKey, String(reader.result || ""));
    renderAvatar();
  });
  reader.readAsDataURL(file);
});

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(employeeForm);

  const response = await apiRequest("employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "新增失败");
    return;
  }

  employeeForm.reset();
  await loadWorkspace();
});

workSheetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(workSheetForm);

  const response = await apiRequest("work-sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "发布工作表失败");
    return;
  }

  workSheetForm.reset();
  await loadWorkspace();
});

approvalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(approvalForm);
  const payload = Object.fromEntries(formData.entries());
  payload.owner = state.user?.name || "未知提交人";

  const response = await apiRequest("approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "提交报销失败");
    return;
  }

  approvalForm.reset();
  await loadWorkspace();
});

departmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(departmentForm);

  const response = await apiRequest("departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "新增部门失败");
    return;
  }

  departmentForm.reset();
  await loadWorkspace();
});

positionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(positionForm);

  const response = await apiRequest("positions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "新增岗位失败");
    return;
  }

  positionForm.reset();
  await loadWorkspace();
});

noticeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(noticeForm);

  const response = await apiRequest("notices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "发布公告失败");
    return;
  }

  noticeForm.reset();
  await loadWorkspace();
});

scheduleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(scheduleForm);

  const response = await apiRequest("schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "保存日程失败");
    return;
  }

  resetScheduleForm();
  await loadWorkspace();
});

scheduleCancelButton.addEventListener("click", resetScheduleForm);

employeeSearchInput.addEventListener("input", () => {
  state.employeeFilters.query = employeeSearchInput.value.trim().toLowerCase();
  renderEmployees();
});

departmentFilter.addEventListener("change", () => {
  state.employeeFilters.department = departmentFilter.value;
  renderEmployees();
});

positionFilter.addEventListener("change", () => {
  state.employeeFilters.position = positionFilter.value;
  renderEmployees();
});

knowledgeSearchInput.addEventListener("input", () => {
  state.knowledge.query = knowledgeSearchInput.value.trim().toLowerCase();
  renderHandbookArticles();
  renderSopWorkflows();
  renderKnowledgeExtras();
});

knowledgeTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.knowledge.activeTab = button.dataset.knowledgeTab;
    renderKnowledgeNavigation();
  });
});

leaveForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(leaveForm);

  const response = await apiRequest("leave-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData.entries()))
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "提交失败");
    return;
  }

  leaveForm.reset();
  await loadWorkspace();
});

employeeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-employee-detail]");
  if (!button) {
    return;
  }

  openEmployeeDetail(button.dataset.employeeDetail);
});

handbookList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-handbook-detail]");
  if (!button) {
    return;
  }

  openHandbookDetail(button.dataset.handbookDetail);
});

sopList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sop-detail]");
  if (!button) {
    return;
  }

  openSopDetail(button.dataset.sopDetail);
});

leaveList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-leave-action]");
  if (!button) {
    return;
  }

  const response = await apiRequest("leave-requests/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: button.dataset.leaveId,
      action: button.dataset.leaveAction
    })
  });

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "审批失败");
    return;
  }

  await loadWorkspace();
});

scheduleList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-schedule-edit]");
  if (!button) {
    return;
  }

  startScheduleEdit(button.dataset.scheduleEdit);
});

generatePayrollButton.addEventListener("click", async () => {
  generatePayrollButton.disabled = true;
  generatePayrollButton.textContent = "生成中...";

  const response = await apiRequest("payroll-runs/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  generatePayrollButton.disabled = false;
  generatePayrollButton.textContent = "生成本月工资单";

  if (!response.ok) {
    const result = await response.json();
    alert(result.error || "生成失败");
    return;
  }

  await loadWorkspace();
});

moduleNavItems.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveModule(button.dataset.moduleTarget);
  });
});

adminGrid?.addEventListener("click", (event) => {
  const heading = event.target.closest(".panel-heading");
  const panel = heading?.closest(".panel");
  if (!panel || !adminGrid.contains(panel)) {
    return;
  }

  adminGrid.querySelectorAll(".panel.is-open").forEach((openPanel) => {
    if (openPanel !== panel) {
      openPanel.classList.remove("is-open");
    }
  });
  panel.classList.toggle("is-open");
});

payrollList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-payslip-detail]");
  if (!button) {
    return;
  }

  openPayslipDetail(button.dataset.payrollId, button.dataset.payslipDetail);
});

dialogCloseButton.addEventListener("click", closeDialog);

detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) {
    closeDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && detailDialog.open) {
    closeDialog();
  }
});

async function loadWorkspace() {
  const response = await apiRequest("bootstrap");
  state.bootstrap = await response.json();

  hero.classList.add("is-hidden");
  loginCard.classList.add("is-hidden");
  workspace.classList.remove("is-hidden");
  bottomNav.classList.remove("is-hidden");
  if (welcomeTitle) {
    welcomeTitle.textContent = "赤瞳工作空间";
  }

  renderMetrics();
  renderProfile();
  renderTodayWorkMeta();
  renderWorkSheets();
  renderEmployeeAssignments();
  renderNotices();
  renderEmployeeSchedules();
  renderWeeklySchedules();
  renderSchedules();
  renderEmployeePortalControls();
  renderHandbookArticles();
  renderSopWorkflows();
  renderKnowledgeExtras();
  renderKfsScores();
  renderApprovals();
  renderOrgControls();
  renderEmployees();
  renderDepartments();
  renderPositions();
  renderAssignments();
  renderLeaveRequests();
  renderPayrollRuns();
  renderAuditLogs();
  renderRoleNavigation();
  setActiveModule(getAllowedModules()[0]);
}

async function handleStaticApi(pathname, options = {}) {
  const endpoint = pathname.slice(pathname.indexOf("/api/") + 5);
  const method = String(options.method || "GET").toUpperCase();
  const data = await getStaticData();
  const body = options.body ? JSON.parse(options.body) : {};

  if (method === "POST" && endpoint === "login") {
    const user = data.users.find((item) => item.email === body.email && item.password === body.password);

    if (!user) {
      return jsonResponse(401, { error: "账号或密码不正确。" });
    }

    appendStaticAuditLog(data, user.id, "login", "用户登录系统");
    saveStaticData(data);
    return jsonResponse(200, {
      user: toPublicUser(user),
      token: btoa(`${user.id}:${Date.now()}`)
    });
  }

  if (method === "GET" && endpoint === "bootstrap") {
    return jsonResponse(200, staticBootstrap(data));
  }

  if (method === "POST" && endpoint === "approvals") {
    const approval = {
      id: `APP-${String(data.approvals.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名报销"),
      owner: String(body.owner || state.user?.name || "未知提交人"),
      amount: String(body.amount || "-"),
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10)
    };
    data.approvals.unshift(approval);
    appendStaticAuditLog(data, state.user?.id || "user-003", "create_approval", `新增报销申请：${approval.title}`);
    saveStaticData(data);
    return jsonResponse(201, { approval });
  }

  if (method === "POST" && endpoint === "profile") {
    const employee = findCurrentStaticEmployee(data);

    if (!employee) {
      return jsonResponse(404, { error: "没有找到当前员工档案。" });
    }

    employee.phone = String(body.phone || "");
    employee.emergencyContact = String(body.emergencyContact || "");
    employee.address = String(body.address || "");
    employee.skills = String(body.skills || "")
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
    employee.updatedAt = new Date().toISOString();
    appendStaticAuditLog(data, state.user.id, "update_profile", `更新个人资料：${employee.name}`);
    saveStaticData(data);
    return jsonResponse(200, { employee });
  }

  if (method === "POST" && endpoint === "work-sheets") {
    const fields = String(body.fields || "")
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const workSheet = {
      id: `WS-${String(data.workSheets.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名工作表"),
      department: String(body.department || "全员"),
      owner: state.user?.name || "管理员",
      participants: [],
      audienceDepartments: [String(body.department || "全员")],
      audienceTitles: [String(body.titleTarget || "全员")],
      status: "管理员发布",
      fields: fields.length ? fields : ["项目", "负责人", "状态"],
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    data.workSheets.unshift(workSheet);
    appendStaticAuditLog(data, state.user?.id || "user-001", "create_work_sheet", `发布工作表：${workSheet.title}`);
    saveStaticData(data);
    return jsonResponse(201, { workSheet });
  }

  if (method === "POST" && endpoint === "employees") {
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
    refreshStaticMetrics(data);
    appendStaticAuditLog(data, "user-001", "create_employee", `新增员工：${employee.name}`);
    saveStaticData(data);
    return jsonResponse(201, { employee });
  }

  if (method === "POST" && endpoint === "departments") {
    const department = {
      id: `DEP-${String(data.departments.length + 1).padStart(4, "0")}`,
      name: String(body.name || "未命名部门"),
      owner: String(body.owner || "待定负责人"),
      headcountPlan: Number(body.headcountPlan || 0),
      status: "active"
    };
    data.departments.unshift(department);
    appendStaticAuditLog(data, "user-001", "create_department", `新增部门：${department.name}`);
    saveStaticData(data);
    return jsonResponse(201, { department });
  }

  if (method === "POST" && endpoint === "positions") {
    const position = {
      id: `POS-${String(data.positions.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名岗位"),
      department: String(body.department || "未分配"),
      level: String(body.level || "P1"),
      salaryBand: String(body.salaryBand || "待定"),
      status: "active"
    };
    data.positions.unshift(position);
    appendStaticAuditLog(data, "user-001", "create_position", `新增岗位：${position.title}`);
    saveStaticData(data);
    return jsonResponse(201, { position });
  }

  if (method === "POST" && endpoint === "notices") {
    const notice = {
      id: `NTC-${String(data.notices.length + 1).padStart(4, "0")}`,
      title: String(body.title || "未命名公告"),
      department: String(body.department || "全员"),
      publisher: state.user?.name || "管理员",
      priority: String(body.priority || "通知"),
      publishedAt: new Date().toISOString().slice(0, 10),
      content: String(body.content || "")
    };
    data.notices.unshift(notice);
    appendStaticAuditLog(data, state.user?.id || "user-001", "create_notice", `发布公告：${notice.title}`);
    saveStaticData(data);
    return jsonResponse(201, { notice });
  }

  if (method === "POST" && endpoint === "schedules") {
    const scheduleId = String(body.scheduleId || "");
    const schedule = {
      id: scheduleId || `SCH-${String(data.schedules.length + 1).padStart(4, "0")}`,
      date: String(body.date || getISODate(new Date())),
      day: formatShortWeekday(String(body.date || getISODate(new Date()))),
      time: String(body.time || "09:30"),
      title: String(body.title || "未命名日程"),
      department: String(body.department || "全员"),
      location: String(body.location || "待定"),
      owner: String(body.owner || state.user?.name || "管理员")
    };
    const existingIndex = data.schedules.findIndex((item) => item.id === schedule.id);
    if (existingIndex >= 0) {
      data.schedules[existingIndex] = schedule;
    } else {
      data.schedules.unshift(schedule);
    }
    appendStaticAuditLog(data, state.user?.id || "user-001", existingIndex >= 0 ? "update_schedule" : "create_schedule", `${existingIndex >= 0 ? "修改" : "新增"}日程：${schedule.title}`);
    saveStaticData(data);
    return jsonResponse(existingIndex >= 0 ? 200 : 201, { schedule });
  }

  if (method === "POST" && endpoint === "leave-requests") {
    const employee = data.employees.find((item) => item.id === body.employeeId);
    const leaveRequest = {
      id: `LEV-${String(data.leaveRequests.length + 1).padStart(4, "0")}`,
      employeeId: String(body.employeeId || ""),
      employeeName: employee?.name || String(body.employeeName || "未知员工"),
      type: String(body.type || "年假"),
      days: Number(body.days || 1),
      reason: String(body.reason || "未填写原因"),
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10)
    };
    data.leaveRequests.unshift(leaveRequest);
    refreshStaticMetrics(data);
    appendStaticAuditLog(data, "user-002", "create_leave_request", `新增请假申请：${leaveRequest.employeeName} ${leaveRequest.days} 天`);
    saveStaticData(data);
    return jsonResponse(201, { leaveRequest });
  }

  if (method === "POST" && endpoint === "leave-requests/action") {
    const leaveRequest = data.leaveRequests.find((item) => item.id === body.id);
    const action = String(body.action || "");

    if (!leaveRequest) {
      return jsonResponse(404, { error: "请假申请不存在。" });
    }

    if (!["approved", "rejected"].includes(action)) {
      return jsonResponse(400, { error: "审批动作不正确。" });
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

    refreshStaticMetrics(data);
    appendStaticAuditLog(data, "user-002", action === "approved" ? "approve_leave_request" : "reject_leave_request", `${action === "approved" ? "通过" : "驳回"}请假申请：${leaveRequest.employeeName} ${leaveRequest.days} 天`);
    saveStaticData(data);
    return jsonResponse(200, { leaveRequest });
  }

  if (method === "POST" && endpoint === "payroll-runs/generate") {
    const period = new Date().toISOString().slice(0, 7);
    const activeEmployees = data.employees.filter((item) => item.status === "active");
    const payslips = activeEmployees.map((employee) => createStaticPayslip(employee, period));
    const totals = payslips.reduce((summary, item) => ({
      grossPay: summary.grossPay + item.grossPay,
      deductions: summary.deductions + item.deductions,
      netPay: summary.netPay + item.netPay
    }), { grossPay: 0, deductions: 0, netPay: 0 });
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
      data.payrollRuns[existingIndex] = { ...data.payrollRuns[existingIndex], ...payrollRun };
    } else {
      data.payrollRuns.unshift(payrollRun);
    }
    refreshStaticMetrics(data);
    appendStaticAuditLog(data, "user-001", "generate_payroll", `生成 ${period} 工资单：${activeEmployees.length} 人`);
    saveStaticData(data);
    return jsonResponse(201, { payrollRun });
  }

  return jsonResponse(404, { error: "接口不存在。" });
}

async function getStaticData() {
  if (staticDataPromise) {
    return staticDataPromise;
  }

  staticDataPromise = (async () => {
    const stored = localStorage.getItem(staticStorageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(staticStorageKey);
      }
    }

    if (window.CHITONG_SEED_DATA) {
      return cloneData(window.CHITONG_SEED_DATA);
    }

    if (nativeFetch) {
      const response = await nativeFetch("data/app.json");
      if (!response.ok) {
        throw new Error("静态演示数据加载失败。");
      }
      return response.json();
    }

    return readJsonWithXHR("data/app.json");
  })();

  return staticDataPromise;
}

function readJsonWithXHR(url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "json";
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("静态演示数据加载失败。"));
        return;
      }

      if (request.response) {
        resolve(request.response);
        return;
      }

      try {
        resolve(JSON.parse(request.responseText));
      } catch {
        reject(new Error("静态演示数据格式不正确。"));
      }
    };
    request.onerror = () => reject(new Error("静态演示数据无法读取。"));
    request.send();
  });
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function saveStaticData(data) {
  localStorage.setItem(staticStorageKey, JSON.stringify(data));
  staticDataPromise = Promise.resolve(data);
}

function staticBootstrap(data) {
  return {
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
    roles: data.roles
  };
}

function appendStaticAuditLog(data, userId, action, message) {
  data.auditLogs.push({
    id: `LOG-${Date.now()}`,
    userId,
    action,
    message,
    createdAt: new Date().toISOString()
  });
}

function refreshStaticMetrics(data) {
  data.metrics.employeeCount = data.employees.filter((item) => item.status === "active").length;
  data.metrics.pendingLeaves = data.leaveRequests.filter((item) => item.status === "pending").length;
  data.metrics.payrollTotal = Number(data.payrollRuns[0]?.grossPay || 0);
}

function createStaticPayslip(employee, period) {
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

function findCurrentStaticEmployee(data) {
  return data.employees.find((employee) => employee.name === state.user?.name)
    || data.employees.find((employee) => employee.department === state.user?.department);
}

function toPublicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function setActiveModule(moduleName) {
  const allowedModules = getAllowedModules();
  const safeModuleName = allowedModules.includes(moduleName) ? moduleName : allowedModules[0];
  const isModuleChange = state.activeModule !== safeModuleName;
  state.activeModule = safeModuleName;

  modulePanels.forEach((panel) => {
    const isAllowed = allowedModules.includes(panel.dataset.modulePanel);
    const isActive = panel.dataset.modulePanel === safeModuleName && isAllowed;
    panel.classList.toggle("is-role-hidden", !isAllowed);
    panel.classList.toggle("is-active", isActive);
    if (isActive && isModuleChange) {
      panel.scrollTop = 0;
    }
  });

  moduleNavItems.forEach((button) => {
    const isAllowed = allowedModules.includes(button.dataset.moduleTarget);
    button.classList.toggle("is-role-hidden", !isAllowed);
    button.classList.toggle("is-active", button.dataset.moduleTarget === safeModuleName && isAllowed);
  });
}

function renderRoleNavigation() {
  bottomNav.dataset.role = state.user.role;
  if (welcomeTitle) {
    welcomeTitle.textContent = "赤瞳工作空间";
  }
  generatePayrollButton.classList.toggle("is-hidden", !canManage());
}

function getAllowedModules() {
  if (!state.user || state.user.role === "employee") {
    return ["work", "knowledge", "me"];
  }

  return ["work", "knowledge", "admin", "me"];
}

function renderEmployeePortalControls() {
  renderKnowledgeNavigation();
}

function renderKnowledgeNavigation() {
  knowledgeTabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.knowledgeTab === state.knowledge.activeTab);
  });
  knowledgeSections.forEach((section) => {
    section.classList.toggle("is-active", section.dataset.knowledgeSection === state.knowledge.activeTab);
  });
}

function renderHandbookArticles() {
  const articles = getFilteredHandbookArticles();

  handbookList.innerHTML = articles.length
    ? articles.map((item) => `
      <article class="knowledge-card">
        <div>
          <span class="tag">${escapeHtml(item.category)}</span>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.summary)}</p>
          <small>${escapeHtml(item.owner)} · 更新于 ${escapeHtml(item.updatedAt)}</small>
        </div>
        <button class="mini neutral" type="button" data-handbook-detail="${escapeHtml(item.id)}">查看</button>
      </article>
    `).join("")
    : `<p class="empty-state">没有找到相关手册。制度藏起来可不行，我们换个关键词找。</p>`;
}

function renderSopWorkflows() {
  const workflows = getFilteredSopWorkflows();

  sopList.innerHTML = workflows.length
    ? workflows.map((item) => `
      <article class="knowledge-card">
        <div>
          <span class="tag">${escapeHtml(item.department)}</span>
          <h4>${escapeHtml(item.name)}</h4>
          <p>${escapeHtml(item.scenario)}</p>
          <small>${escapeHtml(item.owner)} · ${escapeHtml(item.sla)}</small>
        </div>
        <button class="mini neutral" type="button" data-sop-detail="${escapeHtml(item.id)}">步骤</button>
      </article>
    `).join("")
    : `<p class="empty-state">没有找到相关 SOP。流程没丢，只是关键词可能太神秘了。</p>`;
}

function renderKnowledgeExtras() {
  faqList.innerHTML = filterKnowledgePairs([
    ["忘记素材命名怎么办？", "先按项目名_日期_机位_镜号补齐，再同步给项目负责人确认。"],
    ["客户临时改需求怎么办？", "先记录变更点和影响时间，再由主管确认是否调整排期。"],
    ["报销材料不齐怎么办？", "先补发票、付款凭证和审批截图，缺一项先不要提交。"]
  ]).map(([title, summary]) => renderSimpleKnowledgeCard("FAQ", title, summary)).join("")
    || `<p class="empty-state">没有找到相关疑难解答。</p>`;

  shootingReferenceList.innerHTML = filterKnowledgePairs([
    ["产品短视频镜头参考", "开场 3 秒给主体，细节镜头补质感，结尾保留品牌露出。"],
    ["采访类布光参考", "主光 45 度，轮廓光压暗背景，收音先试录 10 秒。"],
    ["素材交接参考", "当天素材当天备份，镜头备注和异常情况必须同步剪辑。"]
  ]).map(([title, summary]) => renderSimpleKnowledgeCard("Reference", title, summary)).join("")
    || `<p class="empty-state">没有找到相关拍摄参考。</p>`;

  standardProcessList.innerHTML = filterKnowledgePairs([
    ["拍摄前检查", "通告、设备、电池、存储卡、道具、场地和人员到位后再开拍。"],
    ["拍摄中记录", "每组镜头记录机位、条数、异常和是否可用，避免剪辑返工。"],
    ["收工后交付", "素材编号、双备份、交接人确认，项目群同步完成状态。"]
  ]).map(([title, summary]) => renderSimpleKnowledgeCard("Standard", title, summary)).join("")
    || `<p class="empty-state">没有找到相关标准流程。</p>`;
}

function filterKnowledgePairs(items) {
  const query = state.knowledge.query;
  if (!query) {
    return items;
  }

  return items.filter(([title, summary]) => `${title} ${summary}`.toLowerCase().includes(query));
}

function renderSimpleKnowledgeCard(tag, title, summary) {
  return `
    <article class="knowledge-card">
      <div>
        <span class="tag">${escapeHtml(tag)}</span>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(summary)}</p>
      </div>
    </article>
  `;
}

function getFilteredHandbookArticles() {
  const query = state.knowledge.query;

  return state.bootstrap.handbookArticles.filter((item) => {
    const text = `${item.category} ${item.title} ${item.summary} ${item.owner}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);

    return matchesQuery;
  });
}

function getFilteredSopWorkflows() {
  const query = state.knowledge.query;

  return state.bootstrap.sopWorkflows.filter((item) => {
    const text = `${item.name} ${item.department} ${item.scenario} ${item.owner}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);

    return matchesQuery;
  });
}

function renderMetrics() {
  const labels = {
    employeeCount: "在职员工",
    pendingLeaves: "待批假单",
    payrollTotal: "本月应发",
    riskAlerts: "风险提醒"
  };

  metrics.innerHTML = Object.entries(state.bootstrap.metrics)
    .map(([key, value]) => `
      <article class="metric-card">
        <span class="eyebrow">${labels[key] || key}</span>
        <strong>${formatMetric(key, value)}</strong>
      </article>
    `)
    .join("");
}

function renderWorkSheets() {
  const workSheets = getVisibleWorkSheets();

  workSheetList.innerHTML = workSheets.length
    ? workSheets
    .map((item) => `
      <article class="work-card">
        <div>
          <span class="tag">${escapeHtml(item.department)}</span>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.owner)} · ${escapeHtml(item.status)} · 更新 ${escapeHtml(item.updatedAt)}</p>
        </div>
        <div class="mini-grid">
          ${item.fields.map((field) => `<span>${escapeHtml(field)}</span>`).join("")}
        </div>
      </article>
    `)
    .join("")
    : `<p class="empty-state">暂时没有和你相关的工作表。</p>`;
}

function renderTodayWorkMeta() {
  workTodayMeta.textContent = `${formatDisplayDate(new Date())} · ${state.user.name}`;
}

function renderProfile() {
  const employee = getCurrentEmployee();
  renderAvatar(employee);
  if (!employee) {
    profileSummary.innerHTML = `<p class="empty-state">暂时没有匹配到你的员工档案。</p>`;
    return;
  }

  profileForm.elements.phone.value = employee.phone || "";
  profileForm.elements.emergencyContact.value = employee.emergencyContact || "";
  profileForm.elements.address.value = employee.address || "";
  profileForm.elements.skills.value = Array.isArray(employee.skills) ? employee.skills.join("、") : (employee.skills || "");
  profileSummary.innerHTML = `
    <article class="profile-card">
      <strong>${escapeHtml(employee.name)} · ${escapeHtml(employee.title)}</strong>
      <p>${escapeHtml(employee.department)} · 手机 ${escapeHtml(employee.phone || "未填写")}</p>
      <p>紧急联系人：${escapeHtml(employee.emergencyContact || "未填写")}</p>
      <p>地址：${escapeHtml(employee.address || "未填写")}</p>
      <div class="mini-grid">
        ${(Array.isArray(employee.skills) ? employee.skills : []).map((skill) => `<span>${escapeHtml(skill)}</span>`).join("") || "<span>暂无技能标签</span>"}
      </div>
    </article>
  `;
}

function renderAvatar(employee = getCurrentEmployee()) {
  if (!avatarPreview || !avatarName || !avatarRole) {
    return;
  }

  const image = localStorage.getItem(avatarStorageKey);
  if (image) {
    avatarPreview.style.backgroundImage = `url("${image}")`;
    avatarPreview.textContent = "";
  } else {
    avatarPreview.style.backgroundImage = "";
    avatarPreview.textContent = (state.user?.name || employee?.name || "赤").slice(0, 1);
  }

  avatarName.textContent = state.user?.name || employee?.name || "个人资料";
  avatarRole.textContent = employee
    ? `${employee.department} · ${employee.title} · 点击头像上传照片`
    : "点击头像上传照片，个人资料设置在这里";
}

function renderSchedules() {
  scheduleList.innerHTML = state.bootstrap.schedules
    .map((item) => `
      <article class="timeline-item">
        <time>${escapeHtml(item.time)}</time>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.department)} · ${escapeHtml(item.location)} · ${escapeHtml(item.owner)}</p>
          <button class="mini neutral" type="button" data-schedule-edit="${escapeHtml(item.id)}">修改</button>
        </div>
      </article>
    `)
    .join("");
}

function renderEmployeeSchedules() {
  const schedules = getTodaySchedules();

  employeeScheduleList.innerHTML = schedules.length
    ? schedules.map((item) => `
      <article class="timeline-item">
        <time>${escapeHtml(item.time)}</time>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.department)} · ${escapeHtml(item.location)} · ${escapeHtml(item.owner)}</p>
        </div>
      </article>
    `).join("")
    : `<p class="empty-state">今天暂时没有和你相关的日程。</p>`;
}

function renderWeeklySchedules() {
  const schedules = getVisibleSchedules();

  weeklyScheduleList.innerHTML = schedules.length
    ? schedules.map((item) => `
      <article class="timeline-item">
        <time>${escapeHtml(item.day || "本周")}</time>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.time)} · ${escapeHtml(item.department)} · ${escapeHtml(item.location)} · ${escapeHtml(item.owner)}</p>
        </div>
      </article>
    `).join("")
    : `<p class="empty-state">本周暂时没有安排。</p>`;
}

function renderEmployeeAssignments() {
  if (!employeeAssignmentList) {
    return;
  }

  const assignments = getVisibleAssignments();

  employeeAssignmentList.innerHTML = assignments.length
    ? assignments.map((item) => `
      <article class="assignment-card">
        <div>
          <span class="tag">${escapeHtml(item.department)}</span>
          <h4>${escapeHtml(item.project)}</h4>
          <p>${escapeHtml(item.lead)} · ${escapeHtml(item.shift)}</p>
          <small>${item.members.map((member) => escapeHtml(member)).join(" / ")}</small>
        </div>
        <span class="status">${escapeHtml(item.status)}</span>
      </article>
    `).join("")
    : `<p class="empty-state">暂时没有和你相关的项目协作。</p>`;
}

function renderNotices() {
  const notices = getVisibleNotices();

  noticeList.innerHTML = notices.length
    ? notices.map((item) => `
      <article class="notice-card">
        <div>
          <span class="tag">${escapeHtml(item.priority)}</span>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.content)}</p>
          <small>${escapeHtml(item.publisher)} · ${escapeHtml(item.department)} · ${escapeHtml(item.publishedAt)}</small>
        </div>
      </article>
    `).join("")
    : `<p class="empty-state">暂时没有新的通知。</p>`;
}

function renderApprovals() {
  const approvals = state.bootstrap.approvals.filter((item) => canManage() || item.owner === state.user.name);

  approvalList.innerHTML = approvals.length
    ? approvals.map((item) => `
      <div class="row">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.owner)} · ${escapeHtml(item.amount)} · ${escapeHtml(item.createdAt)}</p>
        </div>
        <span class="status ${statusClass(item.status)}">${statusText(item.status)}</span>
      </div>
    `).join("")
    : `<p class="empty-state">暂时没有报销申请。</p>`;
}

function renderKfsScores() {
  const scores = canManage()
    ? state.bootstrap.kfsScores
    : state.bootstrap.kfsScores.filter((item) => item.employeeName === state.user.name);

  kfsList.innerHTML = scores
    .map((item) => `
      <article class="kfs-card">
        <div class="kfs-head">
          <div>
            <strong>${escapeHtml(item.employeeName)}</strong>
            <p>${escapeHtml(item.department)} · 系数 ${escapeHtml(item.coefficient)}</p>
          </div>
          <span class="status is-approved">${formatCurrency(item.bonus)}</span>
        </div>
        <div class="kfs-bars">
          ${renderKfsBar("K 关键成果", item.k)}
          ${renderKfsBar("F 流程效率", item.f)}
          ${renderKfsBar("S 服务协作", item.s)}
        </div>
        <p>${escapeHtml(item.notes)}</p>
      </article>
    `)
    .join("") || `<p class="empty-state">暂时没有你的 KFS 绩效记录。</p>`;
}

function renderKfsBar(label, value) {
  return `
    <div class="kfs-bar">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <i style="width: ${Number(value || 0)}%"></i>
    </div>
  `;
}

function renderAssignments() {
  assignmentList.innerHTML = state.bootstrap.staffAssignments
    .map((item) => `
      <article class="assignment-card">
        <div>
          <span class="tag">${escapeHtml(item.department)}</span>
          <h4>${escapeHtml(item.project)}</h4>
          <p>${escapeHtml(item.lead)} · ${escapeHtml(item.shift)}</p>
          <small>${item.members.map((member) => escapeHtml(member)).join(" / ")}</small>
        </div>
        <span class="status">${escapeHtml(item.status)}</span>
      </article>
    `)
    .join("");
}

function getVisibleWorkSheets() {
  if (canManage()) {
    return state.bootstrap.workSheets;
  }

  const employee = getCurrentEmployee();

  return state.bootstrap.workSheets.filter((item) => {
    const departments = item.audienceDepartments || [item.department];
    const titles = item.audienceTitles || [];
    const matchesDepartment = departments.includes("全员") || departments.includes(state.user.department);
    const matchesTitle = !titles.length || titles.includes("全员") || titles.includes(employee?.title);

    return isCurrentUserRelated(item) || (matchesDepartment && matchesTitle);
  });
}

function getVisibleAssignments() {
  if (canManage()) {
    return state.bootstrap.staffAssignments;
  }

  return state.bootstrap.staffAssignments.filter((item) => isCurrentUserRelated(item));
}

function getVisibleNotices() {
  return state.bootstrap.notices.filter((item) => {
    return item.department === "全员" || item.department === state.user.department;
  });
}

function getVisibleSchedules() {
  if (canManage()) {
    return state.bootstrap.schedules;
  }

  return state.bootstrap.schedules.filter((item) => {
    return item.department === "全员"
      || item.department === state.user.department
      || item.owner === state.user.name;
  });
}

function getTodaySchedules() {
  return getVisibleSchedules().filter((item) => !item.date || item.date === getISODate(new Date()));
}

function isCurrentUserRelated(item) {
  const participants = item.participants || [];
  return item.owner === state.user.name
    || item.lead === state.user.name
    || item.department === state.user.department
    || participants.includes(state.user.name);
}

function canManage() {
  return state.user?.role === "admin" || state.user?.role === "manager";
}

function getCurrentEmployee() {
  return state.bootstrap.employees.find((employee) => employee.name === state.user?.name)
    || state.bootstrap.employees.find((employee) => employee.department === state.user?.department);
}

function getISODate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function formatShortWeekday(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("zh-CN", {
    weekday: "short"
  });
}

function renderEmployees() {
  const employees = getFilteredEmployees();

  employeeList.innerHTML = employees.length
    ? employees
    .map((item) => `
      <div class="row">
        <div>
          <strong>${escapeHtml(item.name)} · ${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.department)} · 入职 ${escapeHtml(item.onboardDate)} · 年假余额 ${escapeHtml(item.leaveBalance)} 天</p>
        </div>
        <div class="actions">
          <span class="status">${employeeStatusText(item.status)}</span>
          <button class="mini neutral" type="button" data-employee-detail="${escapeHtml(item.id)}">详情</button>
        </div>
      </div>
    `)
    .join("")
    : `<p class="empty-state">没有找到符合条件的员工。换个关键词试试，别和数据库玩捉迷藏。</p>`;

  leaveEmployeeSelect.innerHTML = state.bootstrap.employees
    .filter((item) => item.status === "active")
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} · ${escapeHtml(item.department)}</option>`)
    .join("");
}

function renderOrgControls() {
  const departments = state.bootstrap.departments.filter((item) => item.status === "active");
  const positions = state.bootstrap.positions.filter((item) => item.status === "active");
  const departmentOptions = departments
    .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`)
    .join("");
  const communicationDepartmentOptions = `<option value="全员">全员</option>${departmentOptions}`;
  const positionOptions = positions
    .map((item) => `<option value="${escapeHtml(item.title)}">${escapeHtml(item.title)} · ${escapeHtml(item.department)}</option>`)
    .join("");

  employeeDepartmentSelect.innerHTML = departmentOptions;
  workSheetDepartmentSelect.innerHTML = communicationDepartmentOptions;
  positionDepartmentSelect.innerHTML = departmentOptions;
  noticeDepartmentSelect.innerHTML = communicationDepartmentOptions;
  scheduleDepartmentSelect.innerHTML = communicationDepartmentOptions;
  employeePositionSelect.innerHTML = positionOptions;
  workSheetPositionSelect.innerHTML = `<option value="全员">全员</option>${positionOptions}`;
  departmentFilter.innerHTML = `<option value="all">全部部门</option>${departmentOptions}`;
  positionFilter.innerHTML = `<option value="all">全部岗位</option>${positions
    .map((item) => `<option value="${escapeHtml(item.title)}">${escapeHtml(item.title)}</option>`)
    .join("")}`;
  departmentFilter.value = state.employeeFilters.department;
  positionFilter.value = state.employeeFilters.position;
  if (!scheduleForm.elements.date.value) {
    scheduleForm.elements.date.value = getISODate(new Date());
  }
}

function startScheduleEdit(scheduleId) {
  const schedule = state.bootstrap.schedules.find((item) => item.id === scheduleId);
  if (!schedule) {
    return;
  }

  scheduleForm.elements.time.value = schedule.time || "";
  scheduleForm.elements.date.value = schedule.date || getISODate(new Date());
  scheduleForm.elements.title.value = schedule.title || "";
  scheduleForm.elements.department.value = schedule.department || "全员";
  scheduleForm.elements.location.value = schedule.location || "";
  scheduleForm.elements.owner.value = schedule.owner || "";
  scheduleIdInput.value = schedule.id;
  scheduleSubmitButton.textContent = "保存修改";
}

function resetScheduleForm() {
  scheduleForm.reset();
  scheduleForm.elements.date.value = getISODate(new Date());
  scheduleIdInput.value = "";
  scheduleSubmitButton.textContent = "保存日程";
}

function renderDepartments() {
  departmentList.innerHTML = state.bootstrap.departments
    .map((item) => {
      const currentCount = state.bootstrap.employees.filter((employee) => employee.department === item.name).length;

      return `
        <article class="org-chip">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.owner)} · 当前 ${currentCount} 人 / 编制 ${escapeHtml(item.headcountPlan)}</span>
        </article>
      `;
    })
    .join("");
}

function renderPositions() {
  positionList.innerHTML = state.bootstrap.positions
    .map((item) => `
      <article class="org-chip">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.department)} · ${escapeHtml(item.level)} · ${escapeHtml(item.salaryBand)}</span>
      </article>
    `)
    .join("");
}

function getFilteredEmployees() {
  const { query, department, position } = state.employeeFilters;

  return state.bootstrap.employees.filter((employee) => {
    const text = `${employee.name} ${employee.department} ${employee.title}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesDepartment = department === "all" || employee.department === department;
    const matchesPosition = position === "all" || employee.title === position;

    return matchesQuery && matchesDepartment && matchesPosition;
  });
}

function renderLeaveRequests() {
  leaveList.innerHTML = state.bootstrap.leaveRequests
    .map((item) => `
      <div class="row">
        <div>
          <strong>${escapeHtml(item.employeeName)} · ${escapeHtml(item.type)} ${escapeHtml(item.days)} 天</strong>
          <p>${escapeHtml(item.reason)} · 提交于 ${escapeHtml(item.submittedAt)}${item.reviewer ? ` · ${escapeHtml(item.reviewer)} 已处理` : ""}</p>
        </div>
        <div class="actions">
          <span class="status ${statusClass(item.status)}">${statusText(item.status)}</span>
          ${renderLeaveActions(item)}
        </div>
      </div>
    `)
    .join("");
}

function renderPayrollRuns() {
  if (!canManage()) {
    const payslips = getCurrentUserPayslips();
    payrollList.innerHTML = payslips.length
      ? payslips.map((item) => `
        <div class="payroll-card">
          <div class="payroll-head">
            <div>
              <strong>${escapeHtml(item.period)} 工资单</strong>
              <p>${escapeHtml(item.employeeName)} · ${escapeHtml(item.department)}</p>
            </div>
            <span class="status">${payrollStatusText(item.status)}</span>
          </div>
          <dl>
            <div><dt>应发</dt><dd>${formatCurrency(item.grossPay)}</dd></div>
            <div><dt>扣减</dt><dd>${formatCurrency(item.deductions)}</dd></div>
            <div><dt>实发</dt><dd>${formatCurrency(item.netPay)}</dd></div>
          </dl>
        </div>
      `).join("")
      : `<p class="empty-state">暂时没有你的工资核算记录。</p>`;
    return;
  }

  payrollList.innerHTML = state.bootstrap.payrollRuns
    .map((item) => `
      <div class="payroll-card">
        <div class="payroll-head">
          <div>
            <strong>${escapeHtml(item.period)} 工资批次</strong>
            <p>${escapeHtml(item.owner)} · ${escapeHtml(item.employeeCount)} 人</p>
          </div>
          <span class="status">${payrollStatusText(item.status)}</span>
        </div>
        <dl>
          <div><dt>应发</dt><dd>${formatCurrency(item.grossPay)}</dd></div>
          <div><dt>扣减</dt><dd>${formatCurrency(item.deductions)}</dd></div>
          <div><dt>实发</dt><dd>${formatCurrency(item.netPay)}</dd></div>
        </dl>
        ${renderPayslipPreview(item)}
      </div>
    `)
    .join("");
}

function getCurrentUserPayslips() {
  return state.bootstrap.payrollRuns
    .flatMap((run) => (run.payslips || []).map((slip) => ({ ...slip, period: run.period, status: run.status })))
    .filter((item) => item.employeeName === state.user.name);
}

function renderAuditLogs() {
  auditList.innerHTML = state.bootstrap.auditLogs
    .map((item) => `
      <div class="row">
        <strong>${escapeHtml(item.message)}</strong>
        <p>${escapeHtml(item.action)} · ${new Date(item.createdAt).toLocaleString("zh-CN")}</p>
      </div>
    `)
    .join("");
}

function statusText(status) {
  return {
    pending: "待审批",
    approved: "已通过",
    review: "复核中",
    rejected: "已拒绝"
  }[status] || status;
}

function statusClass(status) {
  return {
    approved: "is-approved",
    rejected: "is-rejected",
    paid: "is-approved"
  }[status] || "";
}

function renderLeaveActions(item) {
  if (item.status !== "pending" && item.status !== "review") {
    return "";
  }

  return `
    <button class="mini approve" type="button" data-leave-id="${escapeHtml(item.id)}" data-leave-action="approved">通过</button>
    <button class="mini reject" type="button" data-leave-id="${escapeHtml(item.id)}" data-leave-action="rejected">驳回</button>
  `;
}

function renderPayslipPreview(payrollRun) {
  const payslips = payrollRun.payslips || [];

  if (!payslips.length) {
    return `<p class="hint payroll-empty">还没有生成工资明细，点击上方按钮生成本月工资单。</p>`;
  }

  const preview = payslips.slice(0, 3)
    .map((item) => `
      <li>
        <span>${escapeHtml(item.employeeName)} · ${escapeHtml(item.department)}</span>
        <button class="link-button" type="button" data-payroll-id="${escapeHtml(payrollRun.id)}" data-payslip-detail="${escapeHtml(item.id)}">${formatCurrency(item.netPay)}</button>
      </li>
    `)
    .join("");

  return `
    <ul class="payslip-preview">
      ${preview}
      ${payslips.length > 3 ? `<li><span>还有 ${payslips.length - 3} 人</span><strong>已生成</strong></li>` : ""}
    </ul>
  `;
}

function openEmployeeDetail(employeeId) {
  const employee = state.bootstrap.employees.find((item) => item.id === employeeId);
  if (!employee) {
    return;
  }

  const leaves = state.bootstrap.leaveRequests.filter((item) => item.employeeId === employeeId);
  const payslips = state.bootstrap.payrollRuns
    .flatMap((run) => (run.payslips || []).map((slip) => ({ ...slip, period: run.period, status: run.status })))
    .filter((item) => item.employeeId === employeeId);

  dialogContent.innerHTML = `
    <section class="detail-header">
      <p class="eyebrow">Employee Detail</p>
      <h2>${escapeHtml(employee.name)}</h2>
      <p>${escapeHtml(employee.department)} · ${escapeHtml(employee.title)} · ${employeeStatusText(employee.status)}</p>
    </section>
    <section class="detail-stats">
      <article><span>入职日期</span><strong>${escapeHtml(employee.onboardDate)}</strong></article>
      <article><span>年假余额</span><strong>${escapeHtml(employee.leaveBalance)} 天</strong></article>
      <article><span>基本工资</span><strong>${formatCurrency(employee.salaryBase)}</strong></article>
    </section>
    <section class="detail-section">
      <h3>请假记录</h3>
      ${renderDetailLeaves(leaves)}
    </section>
    <section class="detail-section">
      <h3>工资记录</h3>
      ${renderDetailPayslips(payslips)}
    </section>
  `;
  openDialog();
}

function openHandbookDetail(articleId) {
  const article = state.bootstrap.handbookArticles.find((item) => item.id === articleId);
  if (!article) {
    return;
  }

  dialogContent.innerHTML = `
    <section class="detail-header">
      <p class="eyebrow">Employee Handbook</p>
      <h2>${escapeHtml(article.title)}</h2>
      <p>${escapeHtml(article.category)} · ${escapeHtml(article.owner)} · 更新于 ${escapeHtml(article.updatedAt)}</p>
    </section>
    <section class="detail-section">
      <h3>重点说明</h3>
      <p class="policy-summary">${escapeHtml(article.summary)}</p>
      <ol class="step-list">
        ${article.content.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>
  `;
  openDialog();
}

function openSopDetail(workflowId) {
  const workflow = state.bootstrap.sopWorkflows.find((item) => item.id === workflowId);
  if (!workflow) {
    return;
  }

  dialogContent.innerHTML = `
    <section class="detail-header">
      <p class="eyebrow">SOP Workflow</p>
      <h2>${escapeHtml(workflow.name)}</h2>
      <p>${escapeHtml(workflow.department)} · ${escapeHtml(workflow.owner)} · ${escapeHtml(workflow.sla)}</p>
    </section>
    <section class="detail-section">
      <h3>适用场景</h3>
      <p class="policy-summary">${escapeHtml(workflow.scenario)}</p>
      <ol class="step-list">
        ${workflow.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>
  `;
  openDialog();
}

function openPayslipDetail(payrollId, payslipId) {
  const payroll = state.bootstrap.payrollRuns.find((item) => item.id === payrollId);
  const payslip = payroll?.payslips?.find((item) => item.id === payslipId);
  if (!payroll || !payslip) {
    return;
  }

  dialogContent.innerHTML = `
    <section class="detail-header">
      <p class="eyebrow">Payslip Detail</p>
      <h2>${escapeHtml(payslip.employeeName)} · ${escapeHtml(payroll.period)} 工资单</h2>
      <p>${escapeHtml(payslip.department)} · 批次状态：${payrollStatusText(payroll.status)}</p>
    </section>
    <section class="salary-breakdown">
      <div><span>基本工资</span><strong>${formatCurrency(payslip.basePay)}</strong></div>
      <div><span>补贴</span><strong>${formatCurrency(payslip.allowance)}</strong></div>
      <div><span>应发</span><strong>${formatCurrency(payslip.grossPay)}</strong></div>
      <div><span>扣减</span><strong>${formatCurrency(payslip.deductions)}</strong></div>
      <div class="net"><span>实发</span><strong>${formatCurrency(payslip.netPay)}</strong></div>
    </section>
    <p class="hint">当前扣减为演示规则估算：社保加个人所得税。正式上线时应接入真实社保、公积金、个税和考勤规则。</p>
  `;
  openDialog();
}

function renderDetailLeaves(leaves) {
  if (!leaves.length) {
    return `<p class="empty-state">暂无请假记录。</p>`;
  }

  return `
    <div class="detail-list">
      ${leaves.map((item) => `
        <div>
          <strong>${escapeHtml(item.type)} ${escapeHtml(item.days)} 天</strong>
          <span>${statusText(item.status)} · ${escapeHtml(item.submittedAt)} · ${escapeHtml(item.reason)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDetailPayslips(payslips) {
  if (!payslips.length) {
    return `<p class="empty-state">暂无工资单记录。</p>`;
  }

  return `
    <div class="detail-list">
      ${payslips.map((item) => `
        <div>
          <strong>${escapeHtml(item.period)} · ${formatCurrency(item.netPay)}</strong>
          <span>${payrollStatusText(item.status)} · 应发 ${formatCurrency(item.grossPay)} · 扣减 ${formatCurrency(item.deductions)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function openDialog() {
  if (typeof detailDialog.showModal === "function") {
    detailDialog.showModal();
    return;
  }

  detailDialog.setAttribute("open", "");
}

function closeDialog() {
  detailDialog.close();
}

function employeeStatusText(status) {
  return {
    active: "在职",
    probation: "试用",
    inactive: "离职"
  }[status] || status;
}

function payrollStatusText(status) {
  return {
    draft: "草稿",
    calculating: "结算中",
    reviewed: "待发放",
    paid: "已发放"
  }[status] || status;
}

function formatMetric(key, value) {
  if (key === "payrollTotal") {
    return formatCurrency(value);
  }

  return value;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
