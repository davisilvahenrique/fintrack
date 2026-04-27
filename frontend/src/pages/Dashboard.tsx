import { useState, useEffect, useMemo, useRef } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { motion, animate, type Variants } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import type { Transaction, Budget, TransactionSummary } from '../types'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PIE_COLORS = ['#818cf8', '#34d399', '#fb923c', '#f472b6', '#60a5fa', '#a78bfa', '#fbbf24', '#4ade80']

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtAxis(v: number) {
  if (v === 0) return 'R$0'
  if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`
  return `R$${v}`
}

function AnimatedValue({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const from = prev.current
    prev.current = value
    const controls = animate(from, value, {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { node.textContent = fmt(v) },
    })
    return () => controls.stop()
  }, [value])

  return <span ref={ref}>{fmt(value)}</span>
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Dashboard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [annualSummary, setAnnualSummary] = useState<TransactionSummary[]>([])

  useEffect(() => {
    transactionService.list(month, year).then(setTransactions).catch(() => {})
    budgetService.list(month, year).then(setBudgets).catch(() => {})
  }, [month, year])

  useEffect(() => {
    transactionService.summary(year).then(setAnnualSummary).catch(() => {})
  }, [year])

  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const totalExpenses = useMemo(
    () => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const balance = totalIncome - totalExpenses

  const areaData = useMemo(() => {
    const map = new Map(annualSummary.map(s => [s.month, s]))
    return MONTHS.map((label, i) => {
      const s = map.get(i + 1)
      return { label, income: s?.totalIncome ?? 0, expenses: s?.totalExpenses ?? 0 }
    })
  }, [annualSummary])

  const pieData = useMemo(() => {
    const map = new Map<string, number>()
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.categoryName, (map.get(t.categoryName) ?? 0) + t.amount)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const spentByCategory = useMemo(() => {
    const map = new Map<number, number>()
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount)
    })
    return map
  }, [transactions])

  const selectClass = 'px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors'

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">{MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
      >
        <SummaryCard
          label="Receitas"
          value={totalIncome}
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-400/10"
          ring="hover:border-emerald-500/40"
          glow="hover:shadow-emerald-500/8"
        />
        <SummaryCard
          label="Despesas"
          value={totalExpenses}
          icon={TrendingDown}
          color="text-rose-400"
          bg="bg-rose-400/10"
          ring="hover:border-rose-500/40"
          glow="hover:shadow-rose-500/8"
        />
        <SummaryCard
          label="Saldo do Mês"
          value={balance}
          icon={Wallet}
          color={balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}
          bg={balance >= 0 ? 'bg-indigo-400/10' : 'bg-rose-400/10'}
          ring="hover:border-indigo-500/40"
          glow="hover:shadow-indigo-500/8"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Area chart */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Visão Anual</h2>
              <p className="text-slate-600 text-xs mt-0.5">{year}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />Receitas
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />Despesas
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData} margin={{ top: 5, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtAxis}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
                formatter={(v, name) => [fmt(Number(v)), name === 'income' ? 'Receitas' : 'Despesas']}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#gradIncome)"
                dot={false}
                activeDot={{ r: 4, fill: '#34d399', stroke: '#0f172a', strokeWidth: 2 }}
                animationDuration={900}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#fb7185"
                strokeWidth={2}
                fill="url(#gradExpenses)"
                dot={false}
                activeDot={{ r: 4, fill: '#fb7185', stroke: '#0f172a', strokeWidth: 2 }}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
            Gastos por Categoria
          </h2>
          <p className="text-slate-600 text-xs mb-4">{MONTHS[month - 1]} {year}</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-slate-600 text-sm">
              Sem despesas no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="42%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                  formatter={(v) => [fmt(Number(v))]}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  formatter={v => <span style={{ color: '#64748b', fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Budget vs Actual */}
      {budgets.length > 0 && (
        <motion.div
          className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Orçamentos</h2>
          <p className="text-slate-600 text-xs mb-5">{MONTHS[month - 1]} {year}</p>
          <div className="space-y-5">
            {budgets.map(b => {
              const spent = spentByCategory.get(b.categoryId) ?? 0
              const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0
              const over = spent > b.amount
              const warn = !over && pct > 80
              return (
                <div key={b.id}>
                  <div className="flex justify-between items-baseline text-sm mb-2">
                    <span className="text-slate-300 font-medium">{b.categoryName}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={over ? 'text-rose-400 font-semibold' : 'text-slate-200 font-medium'}>
                        {fmt(spent)}
                      </span>
                      <span className="text-slate-700 text-xs">/</span>
                      <span className="text-slate-500 text-xs">{fmt(b.amount)}</span>
                      <span className={`text-xs font-medium tabular-nums ${over ? 'text-rose-400' : warn ? 'text-amber-400' : 'text-slate-600'}`}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${over ? 'bg-rose-500' : warn ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SummaryCard({
  label, value, icon: Icon, color, bg, ring, glow,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
  ring: string
  glow: string
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={`bg-slate-900/70 border border-slate-800/80 ${ring} rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-xl ${glow} hover:-translate-y-0.5`}
    >
      <div className={`${bg} p-3 rounded-xl shrink-0`}>
        <Icon className={color} size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold mt-1 tabular-nums ${color}`}>
          <AnimatedValue value={value} />
        </p>
      </div>
    </motion.div>
  )
}
