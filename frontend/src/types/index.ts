export interface AuthResponse {
  token: string
  name: string
  email: string
}

export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  isDefault: boolean
}

export interface Transaction {
  id: number
  amount: number
  type: 'income' | 'expense'
  description: string | null
  date: string
  categoryId: number
  categoryName: string
}

export interface Budget {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  month: number
  year: number
}

export interface TransactionSummary {
  month: number
  totalIncome: number
  totalExpenses: number
}
