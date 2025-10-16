import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { Loan } from '../types'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [activeLoansCount, setActiveLoansCount] = useState(0)
  const [musiciansCount, setMusiciansCount] = useState(0)
  const [scoresCount, setScoresCount] = useState(0)
  const [recentLoans, setRecentLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)

      // Pobierz liczbę aktywnych wypożyczeń
      const activeLoansQuery = query(
        collection(db, 'loans'),
        where('status', '==', 'active')
      )
      const activeLoansSnapshot = await getDocs(activeLoansQuery)
      setActiveLoansCount(activeLoansSnapshot.size)

      // Pobierz liczbę muzyków
      const musiciansSnapshot = await getDocs(collection(db, 'musicians'))
      setMusiciansCount(musiciansSnapshot.size)

      // Pobierz liczbę nut
      const scoresSnapshot = await getDocs(collection(db, 'scores'))
      setScoresCount(scoresSnapshot.size)

      // Pobierz ostatnie wypożyczenia
      const recentLoansQuery = query(
        collection(db, 'loans'),
        orderBy('loanDate', 'desc'),
        limit(5)
      )
      const recentLoansSnapshot = await getDocs(recentLoansQuery)
      const loans = recentLoansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loanDate: doc.data().loanDate?.toDate(),
        returnDate: doc.data().returnDate?.toDate() || null,
        createdAt: doc.data().createdAt?.toDate(),
      })) as Loan[]
      setRecentLoans(loans)

    } catch (error) {
      console.error('Błąd ładowania danych:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel główny</h1>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-4xl">📋</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aktywne wypożyczenia
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {activeLoansCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link to="/loans" className="text-sm text-gray-700 hover:text-gray-900">
                Zobacz wszystkie →
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-4xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Muzycy
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {musiciansCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link to="/musicians" className="text-sm text-gray-700 hover:text-gray-900">
                Zarządzaj →
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-4xl">🎵</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Nuty w bazie
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {scoresCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link to="/scores" className="text-sm text-gray-700 hover:text-gray-900">
                Przeglądaj →
              </Link>
            </div>
          </div>
        </div>

        {/* Ostatnie wypożyczenia */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ostatnie wypożyczenia</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentLoans.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                Brak wypożyczeń
              </div>
            ) : (
              recentLoans.map((loan) => (
                <div key={loan.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Wypożyczenie #{loan.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {loan.loanDate.toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.status === 'active'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {loan.status === 'active' ? 'Aktywne' : 'Zwrócone'}
                  </span>
                </div>
              ))
            )}
          </div>
          {recentLoans.length > 0 && (
            <div className="px-6 py-3 bg-gray-50">
              <Link to="/loans" className="text-sm text-gray-700 hover:text-gray-900">
                Zobacz wszystkie wypożyczenia →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

