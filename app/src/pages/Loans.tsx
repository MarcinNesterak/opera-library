import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db, functions } from '../firebase'
import { Loan, Musician, Score } from '../types'
import Layout from '../components/Layout'
import { httpsCallable } from 'firebase/functions'

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [musicians, setMusicians] = useState<Musician[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned'>('all')
  const [formData, setFormData] = useState({
    musicianId: '',
    scoreId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      
      // Pobierz wypożyczenia
      const loansSnapshot = await getDocs(collection(db, 'loans'))
      const loansData = loansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loanDate: doc.data().loanDate?.toDate(),
        returnDate: doc.data().returnDate?.toDate() || null,
        createdAt: doc.data().createdAt?.toDate(),
      })) as Loan[]
      setLoans(loansData.sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime()))

      // Pobierz muzyków
      const musiciansSnapshot = await getDocs(collection(db, 'musicians'))
      const musiciansData = musiciansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Musician[]
      setMusicians(musiciansData.sort((a, b) => a.lastName.localeCompare(b.lastName)))

      // Pobierz nuty
      const scoresSnapshot = await getDocs(collection(db, 'scores'))
      const scoresData = scoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Score[]
      setScores(scoresData.sort((a, b) => a.title.localeCompare(b.title)))

    } catch (error) {
      console.error('Błąd ładowania danych:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setFormData({ musicianId: '', scoreId: '' })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const musician = musicians.find(m => m.id === formData.musicianId)
      const score = scores.find(s => s.id === formData.scoreId)
      
      if (!musician || !score) {
        alert('Wybierz muzyka i nuty')
        return
      }

      // Dodaj wypożyczenie
      await addDoc(collection(db, 'loans'), {
        musicianId: formData.musicianId,
        scoreId: formData.scoreId,
        loanDate: Timestamp.now(),
        returnDate: null,
        status: 'active',
        createdAt: Timestamp.now()
      })

      // Wyślij email powiadomienia
      try {
        const sendLoanEmail = httpsCallable(functions, 'sendLoanNotification')
        await sendLoanEmail({
          musicianEmail: musician.email,
          musicianName: `${musician.firstName} ${musician.lastName}`,
          scoreTitle: score.title,
          scoreComposer: score.composer,
          scorePart: score.part,
          type: 'loan'
        })
      } catch (emailError) {
        console.error('Błąd wysyłania emaila:', emailError)
        // Kontynuuj mimo błędu emaila
      }

      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Błąd dodawania wypożyczenia:', error)
      alert('Wystąpił błąd podczas dodawania wypożyczenia')
    }
  }

  async function handleReturn(loanId: string) {
    if (!confirm('Czy na pewno chcesz oznaczyć to wypożyczenie jako zwrócone?')) return
    
    try {
      const loan = loans.find(l => l.id === loanId)
      if (!loan) return

      const musician = musicians.find(m => m.id === loan.musicianId)
      const score = scores.find(s => s.id === loan.scoreId)

      // Aktualizuj wypożyczenie
      await updateDoc(doc(db, 'loans', loanId), {
        returnDate: Timestamp.now(),
        status: 'returned'
      })

      // Wyślij email potwierdzenia zwrotu
      if (musician && score) {
        try {
          const sendLoanEmail = httpsCallable(functions, 'sendLoanNotification')
          await sendLoanEmail({
            musicianEmail: musician.email,
            musicianName: `${musician.firstName} ${musician.lastName}`,
            scoreTitle: score.title,
            scoreComposer: score.composer,
            scorePart: score.part,
            type: 'return'
          })
        } catch (emailError) {
          console.error('Błąd wysyłania emaila:', emailError)
        }
      }

      loadData()
    } catch (error) {
      console.error('Błąd zwrotu wypożyczenia:', error)
      alert('Wystąpił błąd podczas zwrotu')
    }
  }

  const filteredLoans = loans.filter(loan => {
    if (filterStatus === 'active') return loan.status === 'active'
    if (filterStatus === 'returned') return loan.status === 'returned'
    return true
  })

  function getMusicianName(musicianId: string) {
    const musician = musicians.find(m => m.id === musicianId)
    return musician ? `${musician.firstName} ${musician.lastName}` : 'Nieznany'
  }

  function getScoreInfo(scoreId: string) {
    const score = scores.find(s => s.id === scoreId)
    return score ? `${score.title} - ${score.composer} (${score.part})` : 'Nieznane'
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Wypożyczenia</h1>
          <button
            onClick={openAddModal}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
          >
            + Nowe wypożyczenie
          </button>
        </div>

        {/* Filtry */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Wszystkie ({loans.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'active'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aktywne ({loans.filter(l => l.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('returned')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'returned'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Zwrócone ({loans.filter(l => l.status === 'returned').length})
            </button>
          </div>
        </div>

        {/* Lista wypożyczeń */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Muzyk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nuty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data wypożyczenia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data zwrotu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Brak wypożyczeń
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getMusicianName(loan.musicianId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getScoreInfo(loan.scoreId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.loanDate.toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.returnDate ? loan.returnDate.toLocaleDateString('pl-PL') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          loan.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {loan.status === 'active' ? 'Wypożyczone' : 'Zwrócone'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Oznacz jako zwrócone
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal dodawania wypożyczenia */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Nowe wypożyczenie
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wybierz muzyka *
                      </label>
                      <select
                        required
                        value={formData.musicianId}
                        onChange={(e) => setFormData({ ...formData, musicianId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="">-- Wybierz muzyka --</option>
                        {musicians.map((musician) => (
                          <option key={musician.id} value={musician.id}>
                            {musician.firstName} {musician.lastName} ({musician.instrument})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wybierz nuty *
                      </label>
                      <select
                        required
                        value={formData.scoreId}
                        onChange={(e) => setFormData({ ...formData, scoreId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="">-- Wybierz nuty --</option>
                        {scores.map((score) => (
                          <option key={score.id} value={score.id}>
                            {score.title} - {score.composer} ({score.part})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        ℹ️ Po dodaniu wypożyczenia, muzyk automatycznie otrzyma powiadomienie email.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-900 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Dodaj wypożyczenie
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

