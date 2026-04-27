import { api } from './api'
import type { Category } from '../types'

export const categoryService = {
  list: () => api.get<Category[]>('/categories'),
}
