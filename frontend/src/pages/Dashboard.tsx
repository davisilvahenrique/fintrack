import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import { Transaction, Budget, TransactionSummary } from '../types'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PIE_COLORS = ['#818cf8', '#34d399', '#fb923c', '#f472b6', '#60a5fa', '#a78bfa', '#fbbf24', '#4ade80']

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Receitas" value={totalIncome} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-400/10" />
        <SummaryCard label="Despesas" value={totalExpenses} icon={TrendingDown} color="text-rose-400" bg="bg-rose-400/10" />
        <SummaryCard label="Saldo do Mês" value={balance} icon={Wallet} color={balance >= 0 ? 'text-indigo-400' : 'text-rose-400'} bg="bg-indigo-400/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Visão Anual — {year}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                formatter={(v: number) => [fmt(v)]}
              />
              <Bar dataKey="income" name="Receitas" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="#fb7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Gastos por Categoria
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">Sem despesas no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v: number) => [fmt(v)]}
                />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget vs Actual */}
      {budgets.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Orçamentos — {MONTHS[month - 1]} {year}
          </h2>
          <div className="space-y-4">
            {budgets.map(b => {
              const spent = spentByCategory.get(b.categoryId) ?? 0
              const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0
              const over = spent > b.amount
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-200 font-medium">{b.categoryName}</span>
                    <span className={over ? 'text-rose-400' : 'text-slate-400'}>
                      {fmt(spent)} <span className="text-slate-600">/</span> {fmt(b.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label, value, icon: Icon, color, bg,
}: { label: string; value: number; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon className={color} size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${color}`}>{fmt(value)}</p>
      </div>
    </div>
  )
}
