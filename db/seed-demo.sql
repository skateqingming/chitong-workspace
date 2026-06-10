-- Demo seed generated from data/app.json
-- Run after db/schema.sql. Demo passwords are intentionally plain text for prototype migration only.
begin;

insert into roles (id, name) values
  ('admin', '管理员'),
  ('manager', '主管'),
  ('employee', '员工')
on conflict do nothing;

insert into role_permissions (role_id, permission) values
  ('admin', 'manage_users'),
  ('admin', 'view_reports'),
  ('admin', 'approve'),
  ('admin', 'audit'),
  ('manager', 'view_reports'),
  ('manager', 'approve'),
  ('employee', 'submit_request')
on conflict do nothing;

insert into departments (id, name, owner, headcount_plan, status) values
  ('DEP-0001', '摄影部', '林制片', 14, 'active'),
  ('DEP-0002', '剪辑部', '周剪辑', 10, 'active'),
  ('DEP-0003', '财务部', '许会计', 6, 'active')
on conflict do nothing;

insert into positions (id, title, department_id, department_name, level, salary_band, status) values
  ('POS-0001', '摄影总监', 'DEP-0001', '摄影部', 'M3', '24k-35k', 'active'),
  ('POS-0002', '剪辑主管', 'DEP-0002', '剪辑部', 'M2', '18k-28k', 'active'),
  ('POS-0003', '摄影师', 'DEP-0001', '摄影部', 'P2', '12k-20k', 'active'),
  ('POS-0004', '薪资会计', 'DEP-0003', '财务部', 'P2', '14k-20k', 'active')
on conflict do nothing;

insert into app_users (id, name, email, demo_password, role_id, department_id, department_name) values
  ('user-001', '林制片', 'admin@company.local', 'admin123', 'admin', 'DEP-0001', '摄影部'),
  ('user-002', '周剪辑', 'manager@company.local', 'manager123', 'manager', 'DEP-0002', '剪辑部'),
  ('user-003', '陈摄影', 'user@company.local', 'user123', 'employee', 'DEP-0001', '摄影部')
on conflict do nothing;

insert into employees (id, name, department_id, department_name, title, status, onboard_date, leave_balance, salary_base) values
  ('EMP-0001', '林制片', 'DEP-0001', '摄影部', '摄影总监', 'active', '2022-03-12', 9, 28000),
  ('EMP-0002', '周剪辑', 'DEP-0002', '剪辑部', '剪辑主管', 'active', '2023-07-01', 6, 22000),
  ('EMP-0003', '陈摄影', 'DEP-0001', '摄影部', '摄影师', 'active', '2025-02-18', 4, 15000),
  ('EMP-0004', '许会计', 'DEP-0003', '财务部', '薪资会计', 'active', '2024-04-08', 7, 16000)
on conflict do nothing;

insert into handbook_articles (id, category, title, summary, owner, updated_at, content) values
  ('HB-0001', '入职指南', '新员工入职第一天', '完成账号开通、办公设备领取、通讯录加入和直属主管对齐。', '人事行政', '2026-06-01', '["09:30 前到前台完成签到和身份信息核验。","领取电脑、门禁、工牌和基础办公用品。","加入企业通讯录、部门群和项目协作空间。","与直属主管确认试用期目标、汇报节奏和本周优先事项。"]'::jsonb),
  ('HB-0002', '考勤休假', '考勤与请假规则', '说明上下班时间、请假提前量、假期余额和异常处理方式。', '人事行政', '2026-06-03', '["工作日默认 09:30-18:30，午休 12:30-13:30。","年假、调休建议至少提前 1 个工作日提交。","病假可先口头同步主管，返岗后补充证明和系统申请。","忘打卡需在 24 小时内提交异常说明。"]'::jsonb),
  ('HB-0003', '财务报销', '报销材料要求', '发票、付款凭证、审批截图和费用说明必须完整。', '财务部', '2026-06-05', '["报销前确认费用已获得主管或预算负责人审批。","发票抬头、税号、金额和业务说明必须一致。","单笔超过 5000 元的费用需附合同或采购说明。","每月 25 日前提交当月报销，逾期顺延到下月。"]'::jsonb),
  ('HB-0004', '信息安全', '账号与数据安全', '公司账号、客户资料和工资数据不得外传或私人留存。', '信息安全', '2026-06-06', '["不得把公司账号、验证码、客户数据发送到私人聊天工具。","离开工位时锁屏，外出会议避免展示敏感数据。","发现异常登录、钓鱼链接或设备丢失，立即同步 IT。","薪资、人事、合同数据仅限授权人员查看。"]'::jsonb)
on conflict do nothing;

insert into sop_workflows (id, name, department_name, scenario, owner, sla, steps) values
  ('SOP-0001', '请假申请 SOP', '全员', '员工需要年假、调休、病假或事假时使用。', '人事行政', '主管 1 个工作日内处理', '["员工在系统选择请假类型、天数和原因。","直属主管确认排班、项目影响和交接安排。","审批通过后，系统扣减假期余额并记录审计日志。","员工休假前完成必要工作交接。"]'::jsonb),
  ('SOP-0002', '费用报销 SOP', '全员', '员工产生差旅、采购、活动等合规费用后使用。', '财务部', '财务 3 个工作日内初审', '["员工整理发票、付款凭证和审批记录。","提交报销申请并选择费用归属部门和项目。","主管确认业务真实性，财务复核票据合规性。","复核通过后进入付款批次。"]'::jsonb),
  ('SOP-0003', '拍摄交付 SOP', '摄影部', '拍摄任务从通告、现场执行到素材交接时使用。', '摄影部', '当日完成录入', '["确认拍摄通告、机位、灯光、收音和道具清单。","现场完成素材编号、镜头备注和异常记录。","收工后将素材交给剪辑部并同步备份路径。","主管确认素材完整后关闭拍摄任务。"]'::jsonb),
  ('SOP-0004', '设备报修 SOP', '全员', '电脑、网络、门禁或会议设备异常时使用。', '信息技术', '紧急问题 4 小时内响应', '["员工描述故障现象、影响范围和设备编号。","IT 判断远程处理或现场处理。","如需更换设备，登记临时设备和归还时间。","处理完成后员工确认问题关闭。"]'::jsonb)
on conflict do nothing;

insert into work_sheets (id, title, department_name, owner, participants, status, fields, updated_at) values
  ('WS-0001', '今日拍摄任务表', '摄影部', '陈摄影', '["陈摄影","林制片"]'::jsonb, '进行中', '["客户/项目","场景","机位","素材编号","完成状态"]'::jsonb, '2026-06-10'),
  ('WS-0002', '剪辑交付进度表', '剪辑部', '周剪辑', '["周剪辑","林制片"]'::jsonb, '待复核', '["项目","粗剪","精剪","调色","导出","客户反馈"]'::jsonb, '2026-06-10'),
  ('WS-0003', '报销与付款跟踪表', '财务部', '许会计', '["许会计"]'::jsonb, '本周更新', '["申请人","费用类型","发票","审批","付款批次"]'::jsonb, '2026-06-09')
on conflict do nothing;

insert into schedules (id, schedule_time, title, department_name, location, owner) values
  ('SCH-0001', '09:30', '晨会与今日任务分配', '全员', '会议室 A', '林制片'),
  ('SCH-0002', '10:30', '产品短视频拍摄', '摄影部', '1 号棚', '陈摄影'),
  ('SCH-0003', '15:00', '客户片初剪复核', '剪辑部', '剪辑室 2', '周剪辑'),
  ('SCH-0004', '17:30', '本日费用与工时确认', '财务部', '线上', '许会计')
on conflict do nothing;

insert into notices (id, title, department_name, publisher, priority, published_at, content) values
  ('NTC-0001', '本周拍摄素材命名统一规范', '摄影部', '林制片', '重要', '2026-06-10', '素材文件统一使用 项目名_日期_机位_镜号 命名，收工后同步到项目盘。'),
  ('NTC-0002', '剪辑项目交付节点提醒', '剪辑部', '周剪辑', '提醒', '2026-06-10', '所有客户片初剪需在当日 18:00 前提交复核，延迟请提前说明。'),
  ('NTC-0003', '报销单据截止时间', '全员', '许会计', '财务', '2026-06-09', '本月报销请在 25 日前提交，发票、审批截图和付款凭证需一次上传完整。')
on conflict do nothing;

insert into staff_assignments (id, project, department_name, lead, members, participants, shift, status) values
  ('ASG-0001', '品牌短片 A', '摄影部', '林制片', '["陈摄影","灯光助理"]'::jsonb, '["林制片","陈摄影","灯光助理"]'::jsonb, '09:30-18:30', '已排班'),
  ('ASG-0002', '直播切片 B', '剪辑部', '周剪辑', '["剪辑师 1","剪辑师 2"]'::jsonb, '["周剪辑","剪辑师 1","剪辑师 2"]'::jsonb, '13:00-22:00', '缺 1 人'),
  ('ASG-0003', '月度工资核算', '财务部', '许会计', '["财务助理"]'::jsonb, '["许会计","财务助理"]'::jsonb, '10:00-19:00', '待确认')
on conflict do nothing;

insert into kfs_scores (id, employee_id, employee_name, department_name, k, f, s, coefficient, bonus, notes) values
  ('KFS-0001', 'EMP-0001', '林制片', '摄影部', 92, 88, 90, 1.12, 3360, '关键成果稳定，现场协调优秀。'),
  ('KFS-0002', 'EMP-0002', '周剪辑', '剪辑部', 89, 94, 86, 1.1, 2420, '交付效率高，返修改善明显。'),
  ('KFS-0003', 'EMP-0003', '陈摄影', '摄影部', 84, 80, 88, 1.03, 450, '素材完整度好，现场记录还可更细。'),
  ('KFS-0004', 'EMP-0004', '许会计', '财务部', 91, 89, 92, 1.13, 2080, '工资核算准确，风险提醒及时。')
on conflict do nothing;

insert into leave_requests (id, employee_id, employee_name, type, days, reason, status, submitted_at, reviewed_at, reviewer) values
  ('LEV-0001', 'EMP-0003', '陈摄影', '年假', 2, '家庭出行', 'pending', '2026-06-08', null, null),
  ('LEV-0002', 'EMP-0002', '周剪辑', '调休', 1, '周末活动补休', 'approved', '2026-06-04', null, null),
  ('LEV-0003', 'EMP-0004', '许会计', '病假', 0.5, '上午就诊', 'review', '2026-06-07', null, null)
on conflict do nothing;

insert into payroll_runs (id, period, status, employee_count, gross_pay, deductions, net_pay, owner, generated_at) values
  ('PAY-2026-06', '2026-06', 'calculating', 42, 486300, 62840, 423460, '许会计', null),
  ('PAY-2026-05', '2026-05', 'paid', 41, 472100, 60420, 411680, '许会计', null)
on conflict do nothing;

insert into payslips (id, payroll_run_id, employee_id, employee_name, department_name, base_pay, allowance, gross_pay, deductions, net_pay) values
  ('SLIP-2026-06-EMP-0001', 'PAY-2026-06', 'EMP-0001', '林制片', '摄影部', 28000, 2240, 30240, 4773, 25467),
  ('SLIP-2026-06-EMP-0002', 'PAY-2026-06', 'EMP-0002', '周剪辑', '剪辑部', 22000, 1760, 23760, 3727, 20033),
  ('SLIP-2026-06-EMP-0003', 'PAY-2026-06', 'EMP-0003', '陈摄影', '摄影部', 15000, 1200, 16200, 2396, 13804),
  ('SLIP-2026-06-EMP-0004', 'PAY-2026-06', 'EMP-0004', '许会计', '财务部', 16000, 1280, 17280, 2602, 14678)
on conflict do nothing;

insert into approvals (id, title, owner, amount, status, created_at) values
  ('APP-0001', '采购 8 台设计工作站', '周主管', '¥86,000', 'pending', '2026-06-03'),
  ('APP-0002', '市场活动物料报销', '陈同学', '¥12,430', 'approved', '2026-06-01'),
  ('APP-0003', '新增供应商准入', '林总', '-', 'review', '2026-05-29')
on conflict do nothing;

insert into audit_logs (id, user_id, action, message, created_at) values
  ('LOG-0001', 'user-001', 'seed', '系统初始化完成', '2026-06-01T09:00:00.000Z'),
  ('LOG-1781088866893', 'user-001', 'login', '用户登录系统', '2026-06-10T10:54:26.893Z'),
  ('LOG-1781088945802', 'user-001', 'login', '用户登录系统', '2026-06-10T10:55:45.802Z'),
  ('LOG-1781108981326', 'user-001', 'login', '用户登录系统', '2026-06-10T16:29:41.326Z'),
  ('LOG-1781109067711', 'user-003', 'login', '用户登录系统', '2026-06-10T16:31:07.711Z'),
  ('LOG-1781112592048', 'user-001', 'login', '用户登录系统', '2026-06-10T17:29:52.048Z'),
  ('LOG-1781112613983', 'user-001', 'login', '用户登录系统', '2026-06-10T17:30:13.983Z')
on conflict do nothing;

insert into app_metrics (key, value) values
  ('employeeCount', 42),
  ('pendingLeaves', 2),
  ('payrollTotal', 486300),
  ('riskAlerts', 2)
on conflict do nothing;
commit;

