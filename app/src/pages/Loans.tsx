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
    notes: '',
  })
  const [musicianSearch, setMusicianSearch] = useState('')
  const [scoreSearch, setScoreSearch] = useState('')
  const [loanSearch, setLoanSearch] = useState('')

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
    setFormData({ musicianId: '', scoreId: '', notes: '' })
    setMusicianSearch('')
    setScoreSearch('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Walidacja - upewnij się że muzyk i nuty zostały wybrane
    if (!formData.musicianId || !formData.scoreId) {
      alert('Wybierz muzyka i nuty przed dodaniem wypożyczenia')
      return
    }
    
    try {
      // Dodaj wypożyczenie
      await addDoc(collection(db, 'loans'), {
        musicianId: formData.musicianId,
        scoreId: formData.scoreId,
        loanDate: Timestamp.now(),
        returnDate: null,
        status: 'active',
        notes: formData.notes.trim() || undefined,  // Dodaj uwagi jeśli nie są puste
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
    // Filtrowanie po statusie
    if (filterStatus === 'active' && loan.status !== 'active') return false
    if (filterStatus === 'returned' && loan.status !== 'returned') return false
    
    // Filtrowanie po wyszukiwaniu
    if (loanSearch.trim().length > 0) {
      const searchWords = loanSearch.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
      
      // Pobierz informacje o muzyku i nutach
      const musician = musicians.find(m => m.id === loan.musicianId)
      const score = scores.find(s => s.id === loan.scoreId)
      
      // Sprawdź czy wszystkie słowa występują w jakimkolwiek polu
      const matchesSearch = searchWords.every(word => {
        // Sprawdź w danych muzyka
        const musicianMatch = musician && (
          musician.firstName.toLowerCase().includes(word) ||
          musician.lastName.toLowerCase().includes(word) ||
          musician.instrument.toLowerCase().includes(word)
        )
        
        // Sprawdź w danych nut
        const scoreMatch = score && (
          score.title.toLowerCase().includes(word) ||
          score.composer.toLowerCase().includes(word) ||
          score.part.toLowerCase().includes(word)
        )
        
        // Sprawdź w dacie
        const dateMatch = loan.loanDate.toLocaleDateString('pl-PL').includes(word)
        
        return musicianMatch || scoreMatch || dateMatch
      })
      
      if (!matchesSearch) return false
    }
    
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

  // Filtrowanie muzyków z wielosłownym wyszukiwaniem
  const filteredMusicians = musicians.filter(m => {
    const searchWords = musicianSearch.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
    if (searchWords.length === 0) return true
    
    return searchWords.every(word => {
      const firstName = m.firstName.toLowerCase()
      const lastName = m.lastName.toLowerCase()
      const instrument = m.instrument.toLowerCase()
      const email = m.email.toLowerCase()
      
      return firstName.includes(word) || 
             lastName.includes(word) || 
             instrument.includes(word) ||
             email.includes(word)
    })
  })

  // Filtrowanie nut z wielosłownym wyszukiwaniem
  const filteredScores = scores.filter(s => {
    const searchWords = scoreSearch.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
    if (searchWords.length === 0) return true
    
    return searchWords.every(word => {
      const title = s.title.toLowerCase()
      const composer = s.composer.toLowerCase()
      const part = s.part.toLowerCase()
      const catalog = s.catalogNumber ? s.catalogNumber.toLowerCase() : ''
      
      return title.includes(word) || 
             composer.includes(word) || 
             part.includes(word) || 
             catalog.includes(word)
    })
  })

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center items-center gap-4">
          <h1 className="text-4xl font-bold text-gray-900 text-center md:text-left">Wypożyczenia</h1>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto bg-pastel-burgundy text-white px-6 py-3 text-lg font-semibold rounded-xl hover:bg-opacity-90 shadow-lg transition-all"
          >
            + Nowe wypożyczenie
          </button>
        </div>

        {/* Wyszukiwarka wypożyczeń */}
        <div className="bg-pastel-lavender p-4 rounded-xl shadow-lg border-2 border-pastel-gold">
          <input
            type="text"
            placeholder="🔍 Szukaj wypożyczeń po muzyku, utworze, instrumencie..."
            value={loanSearch}
            onChange={(e) => setLoanSearch(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-pastel-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
          />
        </div>

        {/* Filtry */}
        <div className="bg-pastel-peach p-3 md:p-4 rounded-xl shadow-lg border-2 border-pastel-gold">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('active')}
              className={`flex-1 min-w-[100px] px-3 py-2 text-sm md:text-base font-semibold rounded-lg transition-all ${
                filterStatus === 'active'
                  ? 'bg-yellow-400 text-gray-900 shadow-md'
                  : 'bg-pastel-beige text-gray-700 hover:bg-pastel-gold'
              }`}
            >
              Aktywne ({loans.filter(l => l.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 min-w-[100px] px-3 py-2 text-sm md:text-base font-semibold rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-pastel-burgundy text-white shadow-md'
                  : 'bg-pastel-beige text-gray-700 hover:bg-pastel-gold'
              }`}
            >
              Wszystkie ({loans.length})
            </button>
            <button
              onClick={() => setFilterStatus('returned')}
              className={`flex-1 min-w-[100px] px-3 py-2 text-sm md:text-base font-semibold rounded-lg transition-all ${
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
        <div className="hidden lg:block bg-pastel-lavender shadow-lg rounded-xl overflow-hidden border-2 border-pastel-gold">
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
                      {loan.notes && (
                        <div className="mt-1 text-sm text-gray-600 italic">
                          💬 {loan.notes}
                        </div>
                      )}
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

        {/* Lista wypożyczeń - widok kart na małych i średnich ekranach */}
        <div className="lg:hidden space-y-4">
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
                    {loan.notes && (
                      <p className="text-sm text-gray-600 italic bg-pastel-cream px-3 py-2 rounded-lg">
                        💬 <strong>Uwagi:</strong> {loan.notes}
                      </p>
                    )}
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
                    {/* Wyszukiwarka muzyka */}
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        Wybierz muzyka * {formData.musicianId && '✓'}
                      </label>
                      <input
                        type="text"
                        value={musicianSearch}
                        onChange={(e) => setMusicianSearch(e.target.value)}
                        placeholder="🔍 Szukaj po imieniu, nazwisku lub instrumencie..."
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      />
                      {formData.musicianId && (
                        <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded-lg">
                          <p className="text-sm font-medium text-green-900">
                            Wybrano: {getMusicianName(formData.musicianId)}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, musicianId: '' })
                              setMusicianSearch('')
                            }}
                            className="text-xs text-red-600 hover:text-red-800 mt-1"
                          >
                            Wyczyść wybór
                          </button>
                        </div>
                      )}
                      <div className="mt-2 max-h-48 overflow-y-auto border-2 border-pastel-gold rounded-lg bg-white">
                        {filteredMusicians.length === 0 ? (
                          <p className="text-center text-gray-500 py-4 text-sm">Brak muzyków spełniających kryteria</p>
                        ) : (
                          filteredMusicians.slice(0, 10).map((musician) => (
                            <button
                              key={musician.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, musicianId: musician.id })
                                setMusicianSearch('')
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-pastel-cream border-b border-pastel-gold last:border-b-0 transition-colors ${
                                formData.musicianId === musician.id ? 'bg-pastel-gold font-bold' : ''
                              }`}
                            >
                              <p className="font-semibold text-gray-900">{musician.firstName} {musician.lastName}</p>
                              <p className="text-sm text-gray-600">{musician.instrument} • {musician.email}</p>
                            </button>
                          ))
                        )}
                        {filteredMusicians.length > 10 && (
                          <p className="text-center text-gray-500 py-2 text-xs bg-gray-50">
                            ...i {filteredMusicians.length - 10} więcej. Doprecyzuj wyszukiwanie.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Wyszukiwarka nut */}
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        Wybierz nuty * {formData.scoreId && '✓'}
                      </label>
                      <input
                        type="text"
                        value={scoreSearch}
                        onChange={(e) => setScoreSearch(e.target.value)}
                        placeholder="🔍 Szukaj po tytule, kompozytorze, głosie..."
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      />
                      {formData.scoreId && (
                        <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded-lg">
                          <p className="text-sm font-medium text-green-900">
                            Wybrano: {getScoreInfo(formData.scoreId)}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, scoreId: '' })
                              setScoreSearch('')
                            }}
                            className="text-xs text-red-600 hover:text-red-800 mt-1"
                          >
                            Wyczyść wybór
                          </button>
                        </div>
                      )}
                      <div className="mt-2 max-h-48 overflow-y-auto border-2 border-pastel-gold rounded-lg bg-white">
                        {filteredScores.length === 0 ? (
                          <p className="text-center text-gray-500 py-4 text-sm">Brak nut spełniających kryteria</p>
                        ) : (
                          filteredScores.slice(0, 10).map((score) => (
                            <button
                              key={score.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, scoreId: score.id })
                                setScoreSearch('')
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-pastel-cream border-b border-pastel-gold last:border-b-0 transition-colors ${
                                formData.scoreId === score.id ? 'bg-pastel-gold font-bold' : ''
                              }`}
                            >
                              <p className="font-semibold text-gray-900">{score.title}</p>
                              <p className="text-sm text-gray-600">{score.composer} • {score.part}</p>
                            </button>
                          ))
                        )}
                        {filteredScores.length > 10 && (
                          <p className="text-center text-gray-500 py-2 text-xs bg-gray-50">
                            ...i {filteredScores.length - 10} więcej. Doprecyzuj wyszukiwanie.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pole uwagi */}
                    <div>
                      <label htmlFor="notes" className="block text-base font-semibold text-gray-800 mb-2">
                        Uwagi (opcjonalne)
                      </label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Np. nietypowy instrument (klarnet es), dodatkowe informacje..."
                        rows={3}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy resize-none"
                      />
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

