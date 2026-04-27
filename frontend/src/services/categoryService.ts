import { api } from './api'
import { Category } from '../types'

export const categoryService = {
  list: () => api.get<Category[]>('/categories'),
}
