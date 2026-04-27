import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import type { Transaction, Budget, TransactionSummary } from '../types'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PIE_COLORS = ['#818cf8', '#34d399', '#fb923c', '#f472b6', '#60a5fa', '#a78bfa', '#fbbf24', '#4ade80']

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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

  const barData = useMemo(() => {
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

  const selectClass = 'px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors'

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
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
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <SummaryCard label="Receitas" value={totalIncome} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-400/10" border="hover:border-emerald-500/30" />
        <SummaryCard label="Despesas" value={totalExpenses} icon={TrendingDown} color="text-rose-400" bg="bg-rose-400/10" border="hover:border-rose-500/30" />
        <SummaryCard
          label="Saldo do Mês"
          value={balance}
          icon={Wallet}
          color={balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}
          bg="bg-indigo-400/10"
          border="hover:border-indigo-500/30"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Visão Anual — {year}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={12} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                formatter={(v) => [fmt(Number(v))]}
              />
              <Bar dataKey="income" name="Receitas" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="#fb7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Gastos por Categoria
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Sem despesas no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="45%" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [fmt(Number(v))]}
                />
                <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Budget vs Actual */}
      {budgets.length > 0 && (
        <motion.div
          className="bg-slate-900 border border-slate-800/80 rounded-xl p-5"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
            Orçamentos — {MONTHS[month - 1]} {year}
          </h2>
          <div className="space-y-4">
            {budgets.map(b => {
              const spent = spentByCategory.get(b.categoryId) ?? 0
              const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0
              const over = spent > b.amount
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-200 font-medium">{b.categoryName}</span>
                    <span className={over ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                      {fmt(spent)} <span className="text-slate-700">/</span> {fmt(b.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
  label, value, icon: Icon, color, bg, border,
}: { label: string; value: number; icon: React.ElementType; color: string; bg: string; border: string }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center gap-4 transition-colors duration-200 ${border}`}
    >
      <div className={`${bg} p-3 rounded-xl shrink-0`}>
        <Icon className={color} size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold mt-1 ${color}`}>{fmt(value)}</p>
      </div>
    </motion.div>
  )
}
