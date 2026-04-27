import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authService.register(name, email, password)
      login(res.token, { name: res.name, email: res.email })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">FinTrack</h1>
          <p className="text-slate-400 mt-1">Controle suas finanças</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Já tem conta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
