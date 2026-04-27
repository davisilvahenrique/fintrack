import { api } from './api'
import { Transaction, TransactionSummary } from '../types'

interface TransactionPayload {
  amount: number
  type: 'income' | 'expense'
  categoryId: number
  description: string | null
  date: string
}

export const transactionService = {
  list: (month: number, year: number) =>
    api.get<Transaction[]>(`/transactions?month=${month}&year=${year}`),

  summary: (year: number) =>
    api.get<TransactionSummary[]>(`/transactions/summary?year=${year}`),

  create: (payload: TransactionPayload) =>
    api.post<Transaction>('/transactions', payload),

  update: (id: number, payload: TransactionPayload) =>
    api.put<void>(`/transactions/${id}`, payload),

  delete: (id: number) =>
    api.delete<void>(`/transactions/${id}`),
}
