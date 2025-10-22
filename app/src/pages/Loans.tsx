import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { Loan, Musician, Score } from '../types'
import Layout from '../components/Layout'
// import { httpsCallable } from 'firebase/functions'

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [musicians, setMusicians] = useState<Musician[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned'>('active')
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
      // const musician = musicians.find(m => m.id === formData.musicianId)
      // const score = scores.find(s => s.id === formData.scoreId)
      
      // if (!musician || !score) {
      //   alert('Wybierz muzyka i nuty')
      //   return
      // }

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
      /* 
      // TA SEKCJA JEST TYMCZASOWO WYŁĄCZONA - WYMAGA PLANU BLAZE
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
      */

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
      // const loan = loans.find(l => l.id === loanId)
      // if (!loan) return

      // const musician = musicians.find(m => m.id === loan.musicianId)
      // const score = scores.find(s => s.id === loan.scoreId)

      // Aktualizuj wypożyczenie
      await updateDoc(doc(db, 'loans', loanId), {
        returnDate: Timestamp.now(),
        status: 'returned'
      })

      // Wyślij email potwierdzenia zwrotu
      /*
      // TA SEKCJA JEST TYMCZASOWO WYŁĄCZONA - WYMAGA PLANU BLAZE
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
      */

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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pastel-gold border-t-pastel-burgundy"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">Wypożyczenia</h1>
          <button
            onClick={openAddModal}
            className="bg-pastel-burgundy text-white px-6 py-3 text-lg font-semibold rounded-xl hover:bg-opacity-90 shadow-lg transition-all"
          >
            + Nowe wypożyczenie
          </button>
        </div>

        {/* Filtry */}
        <div className="bg-pastel-peach p-6 rounded-xl shadow-lg border-2 border-pastel-gold">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-5 py-3 text-base font-semibold rounded-lg transition-all ${
                filterStatus === 'active'
                  ? 'bg-yellow-400 text-gray-900 shadow-md'
                  : 'bg-pastel-beige text-gray-700 hover:bg-pastel-gold'
              }`}
            >
              Aktywne ({loans.filter(l => l.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-5 py-3 text-base font-semibold rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-pastel-burgundy text-white shadow-md'
                  : 'bg-pastel-beige text-gray-700 hover:bg-pastel-gold'
              }`}
            >
              Wszystkie ({loans.length})
            </button>
            <button
              onClick={() => setFilterStatus('returned')}
              className={`px-5 py-3 text-base font-semibold rounded-lg transition-all ${
                filterStatus === 'returned'
                  ? 'bg-green-400 text-gray-900 shadow-md'
                  : 'bg-pastel-beige text-gray-700 hover:bg-pastel-gold'
              }`}
            >
              Zwrócone ({loans.filter(l => l.status === 'returned').length})
            </button>
          </div>
        </div>

        {/* Lista wypożyczeń - widok tabeli na większych ekranach */}
        <div className="hidden md:block bg-pastel-lavender shadow-lg rounded-xl overflow-hidden border-2 border-pastel-gold">
          <table className="min-w-full divide-y-2 divide-pastel-gold">
            <thead className="bg-pastel-beige">
              <tr>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Muzyk
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Nuty
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Data wypożyczenia
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Data zwrotu
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-800 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pastel-gold">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-600 text-lg">
                    Brak wypożyczeń
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-pastel-cream transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-base font-bold text-gray-900">
                        {getMusicianName(loan.musicianId)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base text-gray-800">
                        {getScoreInfo(loan.scoreId)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      {loan.loanDate.toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      {loan.returnDate ? loan.returnDate.toLocaleDateString('pl-PL') : '-'}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-2 inline-flex text-sm font-bold rounded-lg ${
                          loan.status === 'active'
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'bg-green-200 text-green-900'
                        }`}
                      >
                        {loan.status === 'active' ? 'Wypożyczone' : 'Zwrócone'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="text-green-700 hover:text-green-900 font-semibold"
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

        {/* Lista wypożyczeń - widok kart na małych ekranach */}
        <div className="md:hidden space-y-4">
          {filteredLoans.length === 0 ? (
            <div className="bg-pastel-peach rounded-xl shadow-lg p-8 text-center text-gray-600 text-lg border-2 border-pastel-gold">
              Brak wypożyczeń
            </div>
          ) : (
            filteredLoans.map((loan) => (
              <div key={loan.id} className="bg-pastel-lavender rounded-xl shadow-lg border-2 border-pastel-gold">
                <div className="p-5 space-y-3">
                  <div>
                    <span
                      className={`px-3 py-2 inline-flex text-sm font-bold rounded-lg float-right ${
                        loan.status === 'active'
                          ? 'bg-yellow-200 text-yellow-900'
                          : 'bg-green-200 text-green-900'
                      }`}
                    >
                      {loan.status === 'active' ? 'Wypożyczone' : 'Zwrócone'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 pr-24">{getMusicianName(loan.musicianId)}</h3>
                  </div>
                  <div className="text-base text-gray-700 space-y-2 pt-2">
                    <p><strong>Nuty:</strong> {getScoreInfo(loan.scoreId)}</p>
                    <p><strong>Wypożyczono:</strong> {loan.loanDate.toLocaleDateString('pl-PL')}</p>
                    <p><strong>Zwrócono:</strong> {loan.returnDate ? loan.returnDate.toLocaleDateString('pl-PL') : '-'}</p>
                  </div>
                </div>
                {loan.status === 'active' && (
                  <div className="bg-pastel-gold px-5 py-4 text-right rounded-b-xl">
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="text-base font-semibold text-green-800 hover:text-green-900"
                    >
                      Oznacz jako zwrócone
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal dodawania wypożyczenia */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

            <div className="inline-block align-bottom bg-pastel-peach rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 border-pastel-gold">
              <form onSubmit={handleSubmit}>
                <div className="bg-pastel-peach px-6 pt-6 pb-5 sm:p-8 sm:pb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">
                    Nowe wypożyczenie
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        Wybierz muzyka *
                      </label>
                      <select
                        required
                        value={formData.musicianId}
                        onChange={(e) => setFormData({ ...formData, musicianId: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
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
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        Wybierz nuty *
                      </label>
                      <select
                        required
                        value={formData.scoreId}
                        onChange={(e) => setFormData({ ...formData, scoreId: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      >
                        <option value="">-- Wybierz nuty --</option>
                        {scores.map((score) => (
                          <option key={score.id} value={score.id}>
                            {score.title} - {score.composer} ({score.part})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-base text-blue-900 font-medium">
                        ℹ️ Po dodaniu wypożyczenia, muzyk automatycznie otrzyma powiadomienie email.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-pastel-gold px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-xl border-2 border-pastel-burgundy shadow-lg px-6 py-3 bg-pastel-burgundy text-lg font-bold text-white hover:bg-opacity-90 focus:outline-none sm:w-auto transition-all"
                  >
                    Dodaj wypożyczenie
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border-2 border-gray-400 shadow-md px-6 py-3 bg-white text-lg font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none sm:mt-0 sm:w-auto transition-all"
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

