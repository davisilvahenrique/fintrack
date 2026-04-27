import { api } from './api'
import { Budget } from '../types'

export const budgetService = {
  list: (month: number, year: number) =>
    api.get<Budget[]>(`/budgets?month=${month}&year=${year}`),
}
