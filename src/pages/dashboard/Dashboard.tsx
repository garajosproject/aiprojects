import { useState } from 'react'
import { Select, Progress, Tooltip, Badge } from 'antd'
import {
  InfoCircleOutlined, AppstoreOutlined, ArrowUpOutlined,
  ArrowDownOutlined, UserOutlined, FileTextOutlined,
  TeamOutlined, WarningOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CalendarOutlined, EyeOutlined,
} from '@ant-design/icons'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import StatusBadge from '../../components/ui/StatusBadge'
import FitPlusLogo from '../../components/ui/FitPlusLogo'
import {
  monthlyPatientData, patientStatusPie, bmiMonthlyTrend,
  successMetrics, upcomingTasks, recentBlogs, patients, articles, teamMembers,
} from '../../data/mock'

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}

function KpiCard({ label, value, sub, trend, icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-lg ${
              trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {trend >= 0 ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-brand-navy leading-none mb-1">{value}</p>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
  )
}

// ── Custom Pie label ──────────────────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.06) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ── Task priority config ──────────────────────────────────────────────────────

const priorityConfig = {
  high: { color: '#ef4444', bg: '#fef2f2', label: 'High' },
  medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
  low: { color: '#6b7280', bg: '#f9fafb', label: 'Low' },
}

const taskTypeIcon: Record<string, React.ReactNode> = {
  renewal: <CalendarOutlined />,
  onboarding: <UserOutlined />,
  content: <FileTextOutlined />,
  assignment: <TeamOutlined />,
  team: <TeamOutlined />,
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [period, setPeriod] = useState('lifetime')

  // Computed stats from mock data
  const activeCount = patients.filter(p => p.status === 'Active').length
  const onboardingCount = patients.filter(p => p.status === 'Onboarding').length
  const expiredCount = patients.filter(p => p.status === 'Plan Expired').length
  const liveArticles = articles.filter(a => a.status === 'Live').length
  const activeDoctors = teamMembers.filter(m => m.role === 'Doctor' && m.status === 'Active').length

  const avgWeightLoss = patients.reduce((acc, p) => acc + (p.startingWeight - p.currentWeight), 0) / patients.length
  const avgBMIDrop = patients.reduce((acc, p) => acc + (p.startingBMI - p.currentBMI), 0) / patients.length

  return (
    <div>
      <Header title="Dashboard" icon={<AppstoreOutlined />} searchPlaceholder="Search" showSearch />

      <div className="p-5 space-y-5">

        {/* ── FitPlus identity banner ──────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FitPlusLogo scale={0.65} fontSize={16} textColor="#133696" />
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <p className="text-sm font-semibold text-[#133696]">Admin Dashboard</p>
              <p className="text-xs text-gray-400">Building the Future of Healthcare Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            All systems operational
          </div>
        </div>

        {/* ── Row 1: KPI Cards ─────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Overall Statistics</h2>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 130 }}
              size="small"
              options={[
                { value: 'lifetime', label: 'Life Time' },
                { value: 'monthly', label: 'This Month' },
                { value: 'weekly', label: 'This Week' },
                { value: 'today', label: 'Today' },
              ]}
            />
          </div>
          <div className="grid grid-cols-6 gap-3">
            <KpiCard label="Total Patients" value="24,000" sub="All-time registered" trend={8} icon={<UserOutlined />} iconBg="#EEF2FF" iconColor="#2C3E8C" />
            <KpiCard label="Active Patients" value={`${activeCount * 3600 + 400 |0}`} sub={`${activeCount} in sample`} trend={5} icon={<CheckCircleOutlined />} iconBg="#F0FDF4" iconColor="#22c55e" />
            <KpiCard label="Onboarding" value="2,000" sub="Awaiting full setup" trend={12} icon={<ClockCircleOutlined />} iconBg="#EFF6FF" iconColor="#3b82f6" />
            <KpiCard label="Plans Expiring" value="850" sub="Next 30 days" trend={-3} icon={<WarningOutlined />} iconBg="#FEF3C7" iconColor="#f59e0b" />
            <KpiCard label="Articles Live" value={`${liveArticles}/${articles.length}`} sub="Published content" trend={2} icon={<FileTextOutlined />} iconBg="#F5F3FF" iconColor="#8b5cf6" />
            <KpiCard label="Team Members" value={`${teamMembers.length}`} sub={`${activeDoctors} Doctors active`} icon={<TeamOutlined />} iconBg="#FFF1F2" iconColor="#f43f5e" />
          </div>
        </div>

        {/* ── Row 2: Patient Growth + Status Pie ───────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Area chart — patient growth over 6 months */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader
              title="Patient Stage Trends — 6 Months"
              action={<span className="text-xs text-gray-400">May – Oct 2022</span>}
            />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyPatientData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOnboarding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <ReTooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="active" name="Active" stroke="#22c55e" strokeWidth={2} fill="url(#gradActive)" dot={false} />
                <Area type="monotone" dataKey="onboarding" name="Onboarding" stroke="#3b82f6" strokeWidth={2} fill="url(#gradOnboarding)" dot={false} />
                <Area type="monotone" dataKey="expired" name="Plan Expired" stroke="#f87171" strokeWidth={2} fill="url(#gradExpired)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Pie */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader title="Patient Status Breakdown" />
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={patientStatusPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={65}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                >
                  {patientStatusPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
              {patientStatusPie.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-gray-500 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-gray-700 ml-auto">{(item.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Success Metrics + BMI Trend ───────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Success Metrics */}
          <div className="col-span-1 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader
              title="Success Metrics"
              action={
                <Tooltip title="Computed from active patient cohort">
                  <InfoCircleOutlined className="text-gray-300 cursor-pointer" />
                </Tooltip>
              }
            />
            <div className="space-y-4">
              {successMetrics.map(m => (
                <div key={m.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 font-medium">{m.label}</span>
                    <span className="text-xs font-bold" style={{ color: m.color }}>{m.value}{m.unit}</span>
                  </div>
                  <Progress
                    percent={m.value}
                    showInfo={false}
                    strokeColor={m.color}
                    trailColor="#F1F5F9"
                    size="small"
                    style={{ margin: 0 }}
                  />
                  <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BMI + Weight trend */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader
              title="Avg BMI & Weight Trend Across Cohort"
              action={<span className="text-xs text-gray-400">6-month rolling average</span>}
            />
            {/* Highlight stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-green-50 px-3 py-2">
                <p className="text-xs text-green-600 font-medium">Avg BMI Drop</p>
                <p className="text-lg font-bold text-green-700">-{avgBMIDrop.toFixed(1)}</p>
                <p className="text-xs text-green-500">per patient</p>
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-2">
                <p className="text-xs text-blue-600 font-medium">Avg Weight Lost</p>
                <p className="text-lg font-bold text-blue-700">-{avgWeightLoss.toFixed(1)} Kg</p>
                <p className="text-xs text-blue-500">per patient</p>
              </div>
              <div className="rounded-lg bg-purple-50 px-3 py-2">
                <p className="text-xs text-purple-600 font-medium">Cohort BMI Now</p>
                <p className="text-lg font-bold text-purple-700">25.8</p>
                <p className="text-xs text-purple-500">↓ from 29.4</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={bmiMonthlyTrend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="bmi" domain={[24, 31]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="wt" orientation="right" domain={[72, 86]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="bmi" type="monotone" dataKey="avgBMI" name="Avg BMI" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="wt" type="monotone" dataKey="avgWeight" name="Avg Weight (Kg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 4: Plan Distribution bar + Upcoming Tasks ────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Monthly new vs churned bar */}
          <div className="col-span-1 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader title="Monthly Patient Intake vs Churn" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={[
                  { month: 'May', intake: 1420, churn: 320 },
                  { month: 'Jun', intake: 1680, churn: 290 },
                  { month: 'Jul', intake: 1540, churn: 410 },
                  { month: 'Aug', intake: 1820, churn: 350 },
                  { month: 'Sep', intake: 1760, churn: 380 },
                  { month: 'Oct', intake: 2000, churn: 280 },
                ]}
                margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="intake" name="New Patients" fill="#2C3E8C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="churn" name="Churned" fill="#fca5a5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Tasks */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader
              title="Upcoming Tasks"
              action={
                <span className="text-xs text-brand-blue font-medium cursor-pointer hover:underline">
                  View all
                </span>
              }
            />
            <div className="space-y-2">
              {upcomingTasks.map(task => {
                const p = priorityConfig[task.priority as keyof typeof priorityConfig]
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    {/* Type icon */}
                    <span className="text-gray-400 text-sm flex-shrink-0">
                      {taskTypeIcon[task.type]}
                    </span>

                    {/* Title */}
                    <span className="flex-1 text-sm text-gray-700 min-w-0 truncate">{task.title}</span>

                    {/* Due */}
                    <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                      <ClockCircleOutlined style={{ fontSize: 10 }} />
                      {task.due}
                    </span>

                    {/* Priority badge */}
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0"
                      style={{ background: p.bg, color: p.color }}
                    >
                      {p.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Row 5: Doctor workload + Recent Articles ──────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Team workload */}
          <div className="col-span-1 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader title="Team Workload" />
            <div className="space-y-3">
              {teamMembers
                .filter(m => typeof m.assignedPatients === 'number')
                .map(m => {
                  const pct = Math.min(100, Math.round(((m.assignedPatients as number) / 20) * 100))
                  const isHigh = pct >= 80
                  return (
                    <div key={m.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-brand-blue">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 leading-none">{m.name}</p>
                            <p className="text-xs text-gray-400">{m.role}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${isHigh ? 'text-red-500' : 'text-gray-600'}`}>
                          {m.assignedPatients}/20
                        </span>
                      </div>
                      <Progress
                        percent={pct}
                        showInfo={false}
                        strokeColor={isHigh ? '#ef4444' : '#2C3E8C'}
                        trailColor="#F1F5F9"
                        size="small"
                        style={{ margin: 0 }}
                      />
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Recent Blogs */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <SectionHeader
              title="Recent Articles"
              action={
                <Link to="/articles" className="text-xs text-brand-blue font-medium hover:underline">
                  View all
                </Link>
              }
            />
            <div className="space-y-3">
              {recentBlogs.map((blog, idx) => (
                <div
                  key={blog.id}
                  className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-b-0 last:pb-0"
                >
                  {/* Rank */}
                  <span className="text-sm font-bold text-gray-200 w-5 text-center flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/articles/${blog.id}`}
                      className="text-sm font-medium text-gray-800 hover:text-brand-blue line-clamp-1 block"
                    >
                      {blog.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{blog.category}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{blog.readTime} read</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{blog.publishedDate}</span>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="text-right flex-shrink-0">
                    {blog.views > 0 ? (
                      <div className="flex items-center gap-1 justify-end">
                        <EyeOutlined className="text-gray-300 text-xs" />
                        <span className="text-xs font-medium text-gray-600">
                          {blog.views >= 1000 ? `${(blog.views / 1000).toFixed(1)}k` : blog.views}
                        </span>
                      </div>
                    ) : null}
                    <StatusBadge status={blog.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming blog section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Upcoming / Scheduled
              </p>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-yellow-50 border border-yellow-100 p-3">
                  <Badge status="warning" text={<span className="text-xs font-medium text-yellow-700">Draft</span>} />
                  <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                    Eating Earlier Can Reduce Hunger, Cravings, and Weight Gain
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Fact Check · Anchal Gupta</p>
                  <Link to="/articles/2" className="text-xs text-brand-blue hover:underline mt-1 block">
                    Continue editing →
                  </Link>
                </div>
                <div className="flex-1 rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <Badge status="default" text={<span className="text-xs font-medium text-gray-500">Unpublished</span>} />
                  <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                    Eating These Types of Grains Can Lower Your Heart Disease Risk
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Expert Advice · Anchal Gupta</p>
                  <Link to="/articles/5" className="text-xs text-brand-blue hover:underline mt-1 block">
                    Review & publish →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
