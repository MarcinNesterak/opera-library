import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { Score } from '../types'
import Layout from '../components/Layout'

// Lista instrumentów orkiestry symfonicznej
const ORCHESTRA_INSTRUMENTS = [
  { category: 'Smyczki', instruments: [
    'Skrzypce I pulpit 1', 'Skrzypce I pulpit 2', 'Skrzypce I pulpit 3', 'Skrzypce I pulpit 4',
    'Skrzypce I pulpit 5', 'Skrzypce I pulpit 6', 'Skrzypce I pulpit 7', 'Skrzypce I pulpit 8',
    'Skrzypce II pulpit 1', 'Skrzypce II pulpit 2', 'Skrzypce II pulpit 3', 'Skrzypce II pulpit 4',
    'Skrzypce II pulpit 5', 'Skrzypce II pulpit 6', 'Skrzypce II pulpit 7',
    'Altówka 1', 'Altówka 2', 'Altówka 3', 'Altówka 4', 'Altówka 5', 'Altówka 6',
    'Wiolonczela 1', 'Wiolonczela 2', 'Wiolonczela 3', 'Wiolonczela 4', 'Wiolonczela 5',
    'Kontrabas 1', 'Kontrabas 2', 'Kontrabas 3', 'Kontrabas 4',
  ]},
  { category: 'Dęte drewniane', instruments: [
    'Flet 1', 'Flet 2', 'Flet Piccolo',
    'Obój 1', 'Obój 2', 'Rożek angielski',
    'Klarnet 1', 'Klarnet 2', 'Klarnet basowy',
    'Fagot 1', 'Fagot 2', 'Kontrafagot',
  ]},
  { category: 'Dęte blaszane', instruments: [
    'Waltornia 1', 'Waltornia 2', 'Waltornia 3', 'Waltornia 4',
    'Trąbka 1', 'Trąbka 2', 'Trąbka 3',
    'Puzon 1', 'Puzon 2', 'Puzon 3', 'Puzon basowy',
    'Tuba',
  ]},
  { category: 'Perkusja', instruments: [
    'Kotły',
    'Perkusja 1',
    'Perkusja 2',
  ]},
  { category: 'Harfa', instruments: [
    'Harfa 1',
    'Harfa 2',
  ]},
  { category: 'Instrumenty klawiszowe', instruments: [
    'Fortepian',
    'Celesta',
    'Organy',
    'Klawesyn',
  ]},
  { category: 'Gitary', instruments: [
    'Gitara',
    'Gitara basowa',
  ]},
  { category: 'Inne', instruments: [
    'Partytura',
    'Wyciąg fortepianowy',
    'Inne',
  ]},
]

export default function Scores() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScoreIds, setSelectedScoreIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    composer: '',
    part: '',
    catalogNumber: ''
  })
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])

  useEffect(() => {
    loadScores()
  }, [])

  async function loadScores() {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'scores'))
      const scoresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Score[]
      setScores(scoresData.sort((a, b) => a.title.localeCompare(b.title)))
    } catch (error) {
      console.error('Błąd ładowania nut:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingScore(null)
    setFormData({ title: '', composer: '', part: '', catalogNumber: '' })
    setSelectedInstruments([])
    setShowModal(true)
  }

  function openEditModal(score: Score) {
    setEditingScore(score)
    setFormData({
      title: score.title,
      composer: score.composer,
      part: score.part,
      catalogNumber: score.catalogNumber || ''
    })
    setSelectedInstruments([])
    setShowModal(true)
  }

  function toggleInstrument(instrument: string) {
    setSelectedInstruments(prev => 
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    )
  }

  function toggleAllInCategory(category: string) {
    const categoryInstruments = ORCHESTRA_INSTRUMENTS.find(g => g.category === category)?.instruments || []
    const allSelected = categoryInstruments.every(inst => selectedInstruments.includes(inst))
    
    if (allSelected) {
      // Odznacz wszystkie z tej kategorii
      setSelectedInstruments(prev => prev.filter(i => !categoryInstruments.includes(i)))
    } else {
      // Zaznacz wszystkie z tej kategorii
      setSelectedInstruments(prev => [...new Set([...prev, ...categoryInstruments])])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      if (editingScore) {
        // Tryb edycji - edytujemy tylko jeden rekord
        await updateDoc(doc(db, 'scores', editingScore.id), {
          ...formData,
        })
      } else {
        // Tryb dodawania - dodajemy wiele rekordów jednocześnie
        if (selectedInstruments.length === 0) {
          alert('Wybierz przynajmniej jeden instrument')
          return
        }

        // Dodaj osobny rekord dla każdego wybranego instrumentu
        const promises = selectedInstruments.map(instrument => 
          addDoc(collection(db, 'scores'), {
            title: formData.title,
            composer: formData.composer,
            part: instrument,
            catalogNumber: formData.catalogNumber,
            createdAt: Timestamp.now()
          })
        )

        await Promise.all(promises)
      }
      setShowModal(false)
      loadScores()
    } catch (error) {
      console.error('Błąd zapisu nut:', error)
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć te nuty?')) return
    
    try {
      await deleteDoc(doc(db, 'scores', id))
      loadScores()
    } catch (error) {
      console.error('Błąd usuwania nut:', error)
      alert('Wystąpił błąd podczas usuwania')
    }
  }

  function toggleScoreSelection(scoreId: string) {
    setSelectedScoreIds(prev => 
      prev.includes(scoreId)
        ? prev.filter(id => id !== scoreId)
        : [...prev, scoreId]
    )
  }

  function toggleAllScores() {
    if (selectedScoreIds.length === filteredScores.length) {
      setSelectedScoreIds([])
    } else {
      setSelectedScoreIds(filteredScores.map(s => s.id))
    }
  }

  async function handleBulkDelete() {
    if (selectedScoreIds.length === 0) return
    
    try {
      // Sprawdź czy nuty są wypożyczone
      const loansSnapshot = await getDocs(
        query(collection(db, 'loans'), where('status', '==', 'active'))
      )
      
      const scoresWithLoans = selectedScoreIds.filter(scoreId =>
        loansSnapshot.docs.some(doc => doc.data().scoreId === scoreId)
      )

      if (scoresWithLoans.length > 0) {
        const scoreNames = scoresWithLoans.map(id => {
          const s = scores.find(score => score.id === id)
          return s ? `${s.title} - ${s.composer} (${s.part})` : 'Nieznane'
        }).join('\n')
        
        alert(
          `Nie można usunąć następujących nut, ponieważ są wypożyczone:\n\n${scoreNames}\n\nNajpierw zwróć wszystkie wypożyczenia tych nut.`
        )
        return
      }

      const confirmMsg = `Czy na pewno chcesz usunąć ${selectedScoreIds.length} ${
        selectedScoreIds.length === 1 ? 'nuty' : 
        selectedScoreIds.length < 5 ? 'nuty' : 'nut'
      }?`
      
      if (!confirm(confirmMsg)) return

      const batch = writeBatch(db)
      selectedScoreIds.forEach(id => {
        batch.delete(doc(db, 'scores', id))
      })
      await batch.commit()
      
      setSelectedScoreIds([])
      loadScores()
    } catch (error) {
      console.error('Błąd usuwania nut:', error)
      alert('Wystąpił błąd podczas usuwania')
    }
  }

  const filteredScores = scores.filter(s => {
    // Rozbij wyszukiwane wyrazy na pojedyncze słowa
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
    
    // Jeśli nie ma żadnego słowa do wyszukania, pokaż wszystko
    if (searchWords.length === 0) return true
    
    // Sprawdź czy każde słowo występuje w którymkolwiek polu
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
          <h1 className="text-4xl font-bold text-gray-900 text-center md:text-left">Nuty</h1>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto bg-pastel-burgundy text-white px-6 py-3 text-lg font-semibold rounded-xl hover:bg-opacity-90 shadow-lg transition-all"
          >
            + Dodaj nuty
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="bg-pastel-lavender p-6 rounded-xl shadow-lg border-2 border-pastel-gold">
          <input
            type="text"
            placeholder="🔍 Szukaj po wielu słowach, np. 'bolero puzon II' lub 'ravel flet'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-pastel-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
          />
        </div>

        {/* Lista nut - widok tabeli na większych ekranach */}
        <div className="hidden lg:block bg-pastel-peach shadow-lg rounded-xl overflow-hidden border-2 border-pastel-gold">
          <table className="min-w-full divide-y-2 divide-pastel-gold">
            <thead className="bg-pastel-beige">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={filteredScores.length > 0 && selectedScoreIds.length === filteredScores.length}
                    onChange={toggleAllScores}
                    className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer"
                    title="Zaznacz wszystkie"
                  />
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Tytuł
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Kompozytor
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Głos/Partia
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Nr katalogowy
                </th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-800 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pastel-gold">
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-600 text-lg">
                    Brak nut w bazie
                  </td>
                </tr>
              ) : (
                filteredScores.map((score) => (
                  <tr key={score.id} className="hover:bg-pastel-cream transition-colors">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedScoreIds.includes(score.id)}
                        onChange={() => toggleScoreSelection(score.id)}
                        className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base font-bold text-gray-900">
                        {score.title}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-base text-gray-700">
                      {score.composer}
                    </td>
                    <td className="px-6 py-5 text-base text-gray-700">
                      {score.part}
                    </td>
                    <td className="px-6 py-5 text-base text-gray-700">
                      {score.catalogNumber || '-'}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium space-x-3">
                      <button
                        onClick={() => openEditModal(score)}
                        className="text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        className="text-red-700 hover:text-red-900 font-semibold"
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lista nut - widok kart na małych ekranach */}
        <div className="lg:hidden space-y-4">
          {/* Checkbox "Zaznacz wszystkie" dla mobile */}
          {filteredScores.length > 0 && (
            <div className="bg-pastel-beige p-4 rounded-xl shadow-lg border-2 border-pastel-gold">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredScores.length > 0 && selectedScoreIds.length === filteredScores.length}
                  onChange={toggleAllScores}
                  className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer"
                />
                <span className="ml-3 text-base font-semibold text-gray-800">
                  Zaznacz wszystkie ({filteredScores.length})
                </span>
              </label>
            </div>
          )}

          {filteredScores.length === 0 ? (
            <div className="bg-pastel-lavender rounded-xl shadow-lg p-8 text-center text-gray-600 text-lg border-2 border-pastel-gold">
              Brak nut w bazie
            </div>
          ) : (
            filteredScores.map((score) => (
              <div key={score.id} className="bg-pastel-peach rounded-xl shadow-lg border-2 border-pastel-gold">
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedScoreIds.includes(score.id)}
                      onChange={() => toggleScoreSelection(score.id)}
                      className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{score.title}</h3>
                      <p className="text-base text-gray-700"><strong>Kompozytor:</strong> {score.composer}</p>
                      <p className="text-base text-gray-700"><strong>Głos/Partia:</strong> {score.part}</p>
                      <p className="text-base text-gray-700"><strong>Nr kat.:</strong> {score.catalogNumber || '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-pastel-gold px-5 py-4 flex justify-end space-x-4 rounded-b-xl">
                  <button
                    onClick={() => openEditModal(score)}
                    className="text-base font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(score.id)}
                    className="text-base font-semibold text-red-700 hover:text-red-900"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky bar z akcjami - pojawia się gdy coś jest zaznaczone */}
      {selectedScoreIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-pastel-burgundy text-white shadow-2xl border-t-4 border-pastel-gold z-40 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-lg font-bold">
                ✓ Zaznaczono: {selectedScoreIds.length} {
                  selectedScoreIds.length === 1 ? 'nuty' : 
                  selectedScoreIds.length < 5 ? 'nuty' : 'nut'
                }
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all shadow-lg text-base"
                >
                  🗑️ Usuń zaznaczone
                </button>
                <button
                  onClick={() => setSelectedScoreIds([])}
                  className="px-6 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-all shadow-lg text-base"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

            <div className="inline-block align-bottom bg-pastel-lavender rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 border-pastel-gold">
              <form onSubmit={handleSubmit}>
                <div className="bg-pastel-lavender px-6 pt-6 pb-5 sm:p-8 sm:pb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">
                    {editingScore ? 'Edytuj nuty' : 'Dodaj nuty'}
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Tytuł utworu *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                        placeholder="np. Bolero"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Kompozytor *</label>
                      <input
                        type="text"
                        required
                        value={formData.composer}
                        onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                        placeholder="np. Maurice Ravel"
                      />
                    </div>
                    
                    {editingScore ? (
                      // Tryb edycji - pokazujemy dropdown
                      <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">Instrument/Głos *</label>
                        <select
                          required
                          value={formData.part}
                          onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                          className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                        >
                          <option value="">-- Wybierz instrument --</option>
                          {ORCHESTRA_INSTRUMENTS.map((group) => (
                            <optgroup key={group.category} label={group.category}>
                              {group.instruments.map((instrument) => (
                                <option key={instrument} value={instrument}>
                                  {instrument}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    ) : (
                      // Tryb dodawania - pokazujemy checkboxy
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-base font-semibold text-gray-800">
                            Instrumenty/Głosy * ({selectedInstruments.length} wybrano)
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allInstruments = ORCHESTRA_INSTRUMENTS.flatMap(g => g.instruments)
                                setSelectedInstruments(allInstruments)
                              }}
                              className="text-sm px-3 py-1 bg-pastel-gold text-gray-800 rounded-lg hover:bg-opacity-80 font-medium"
                            >
                              Zaznacz wszystko
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedInstruments([])}
                              className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                              Odznacz wszystko
                            </button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto border-2 border-pastel-gold rounded-lg p-4 bg-white">
                          {ORCHESTRA_INSTRUMENTS.map((group) => {
                            const allSelected = group.instruments.every(inst => selectedInstruments.includes(inst))
                            const someSelected = group.instruments.some(inst => selectedInstruments.includes(inst))
                            
                            return (
                              <div key={group.category} className="mb-4 last:mb-0">
                                <div className="flex items-center mb-2 pb-2 border-b border-pastel-gold">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={() => toggleAllInCategory(group.category)}
                                    className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy"
                                  />
                                  <label className="ml-3 text-base font-bold text-gray-900 cursor-pointer" onClick={() => toggleAllInCategory(group.category)}>
                                    {group.category} {someSelected && !allSelected && '(częściowo)'}
                                  </label>
                                </div>
                                <div className="ml-8 space-y-2">
                                  {group.instruments.map((instrument) => (
                                    <div key={instrument} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id={instrument}
                                        checked={selectedInstruments.includes(instrument)}
                                        onChange={() => toggleInstrument(instrument)}
                                        className="w-4 h-4 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy"
                                      />
                                      <label htmlFor={instrument} className="ml-2 text-base text-gray-700 cursor-pointer">
                                        {instrument}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Numer katalogowy</label>
                      <input
                        type="text"
                        value={formData.catalogNumber}
                        onChange={(e) => setFormData({ ...formData, catalogNumber: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                        placeholder="np. OP-2024-001"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-pastel-gold px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-xl border-2 border-pastel-burgundy shadow-lg px-6 py-3 bg-pastel-burgundy text-lg font-bold text-white hover:bg-opacity-90 focus:outline-none sm:w-auto transition-all"
                  >
                    {editingScore 
                      ? 'Zapisz' 
                      : selectedInstruments.length > 0 
                        ? `Dodaj ${selectedInstruments.length} ${selectedInstruments.length === 1 ? 'głos' : selectedInstruments.length < 5 ? 'głosy' : 'głosów'}`
                        : 'Dodaj'
                    }
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

