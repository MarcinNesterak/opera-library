import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Loan, LoanWithDetails, Musician, Score } from '../types'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [activeLoansCount, setActiveLoansCount] = useState(0)
  const [musiciansCount, setMusiciansCount] = useState(0)
  const [scoresCount, setScoresCount] = useState(0)
  const [recentLoans, setRecentLoans] = useState<LoanWithDetails[]>([])
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
      
      const loansWithDetails = await Promise.all(
        loans.map(async (loan) => {
          const loanDetails: LoanWithDetails = { ...loan };

          if (loan.musicianId) {
            const musicianDoc = await getDoc(doc(db, 'musicians', loan.musicianId));
            if (musicianDoc.exists()) {
              loanDetails.musician = { id: musicianDoc.id, ...musicianDoc.data() } as Musician;
            }
          }

          if (loan.scoreId) {
            const scoreDoc = await getDoc(doc(db, 'scores', loan.scoreId));
            if (scoreDoc.exists()) {
              loanDetails.score = { id: scoreDoc.id, ...scoreDoc.data() } as Score;
            }
          }
          
          return loanDetails;
        })
      );
      setRecentLoans(loansWithDetails)

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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pastel-gold border-t-pastel-burgundy"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Panel główny</h1>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-pastel-peach overflow-hidden shadow-lg rounded-xl border-2 border-pastel-gold">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-5xl">📋</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-700 truncate">
                      Aktywne wypożyczenia
                    </dt>
                    <dd className="text-4xl font-bold text-gray-900 mt-1">
                      {activeLoansCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-pastel-gold px-6 py-4">
              <Link to="/loans" className="text-base text-gray-800 hover:text-gray-900 font-medium">
                Zobacz wszystkie →
              </Link>
            </div>
          </div>

          <div className="bg-pastel-lavender overflow-hidden shadow-lg rounded-xl border-2 border-pastel-gold">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-5xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-700 truncate">
                      Muzycy
                    </dt>
                    <dd className="text-4xl font-bold text-gray-900 mt-1">
                      {musiciansCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-pastel-gold px-6 py-4">
              <Link to="/musicians" className="text-base text-gray-800 hover:text-gray-900 font-medium">
                Zarządzaj →
              </Link>
            </div>
          </div>

          <div className="bg-pastel-beige overflow-hidden shadow-lg rounded-xl border-2 border-pastel-gold">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-5xl">🎵</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-700 truncate">
                      Nuty w bazie
                    </dt>
                    <dd className="text-4xl font-bold text-gray-900 mt-1">
                      {scoresCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-pastel-gold px-6 py-4">
              <Link to="/scores" className="text-base text-gray-800 hover:text-gray-900 font-medium">
                Przeglądaj →
              </Link>
            </div>
          </div>
        </div>

        {/* Ostatnie wypożyczenia */}
        <div className="bg-pastel-peach shadow-lg rounded-xl border-2 border-pastel-gold">
          <div className="px-6 py-5 border-b-2 border-pastel-gold">
            <h2 className="text-2xl font-bold text-gray-900">Ostatnie wypożyczenia</h2>
          </div>
          <div className="divide-y-2 divide-pastel-gold">
            {recentLoans.length === 0 ? (
              <div className="px-6 py-6 text-center text-gray-600 text-lg">
                Brak wypożyczeń
              </div>
            ) : (
              recentLoans.map((loan) => (
                <div key={loan.id} className="px-6 py-5 flex items-center justify-between hover:bg-pastel-cream transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {loan.musician ? `${loan.musician.firstName} ${loan.musician.lastName}` : 'Nieznany muzyk'}
                    </p>
                    <p className="text-base text-gray-700 mt-1">
                      {loan.score ? `${loan.score.title} - ${loan.score.part}` : 'Nieznane nuty'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {loan.loanDate.toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-2 text-sm font-semibold rounded-lg ${
                      loan.status === 'active'
                        ? 'bg-yellow-200 text-yellow-900'
                        : 'bg-green-200 text-green-900'
                    }`}
                  >
                    {loan.status === 'active' ? 'Aktywne' : 'Zwrócone'}
                  </span>
                </div>
              ))
            )}
          </div>
          {recentLoans.length > 0 && (
            <div className="px-6 py-4 bg-pastel-gold">
              <Link to="/loans" className="text-base text-gray-800 hover:text-gray-900 font-medium">
                Zobacz wszystkie wypożyczenia →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

