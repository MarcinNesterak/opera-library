import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { Musician } from '../types'
import Layout from '../components/Layout'

export default function Musicians() {
  const [musicians, setMusicians] = useState<Musician[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMusician, setEditingMusician] = useState<Musician | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMusicianIds, setSelectedMusicianIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    instrument: ''
  })

  useEffect(() => {
    loadMusicians()
  }, [])

  async function loadMusicians() {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'musicians'))
      const musiciansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Musician[]
      setMusicians(musiciansData.sort((a, b) => a.lastName.localeCompare(b.lastName)))
    } catch (error) {
      console.error('Błąd ładowania muzyków:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingMusician(null)
    setFormData({ firstName: '', lastName: '', email: '', phone: '', instrument: '' })
    setShowModal(true)
  }

  function openEditModal(musician: Musician) {
    setEditingMusician(musician)
    setFormData({
      firstName: musician.firstName,
      lastName: musician.lastName,
      email: musician.email,
      phone: musician.phone || '',
      instrument: musician.instrument
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      if (editingMusician) {
        // Aktualizuj
        await updateDoc(doc(db, 'musicians', editingMusician.id), {
          ...formData,
        })
      } else {
        // Dodaj nowego
        await addDoc(collection(db, 'musicians'), {
          ...formData,
          createdAt: Timestamp.now()
        })
      }
      setShowModal(false)
      loadMusicians()
    } catch (error) {
      console.error('Błąd zapisu muzyka:', error)
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć tego muzyka?')) return
    
    try {
      await deleteDoc(doc(db, 'musicians', id))
      loadMusicians()
    } catch (error) {
      console.error('Błąd usuwania muzyka:', error)
      alert('Wystąpił błąd podczas usuwania')
    }
  }

  function toggleMusicianSelection(musicianId: string) {
    setSelectedMusicianIds(prev => 
      prev.includes(musicianId)
        ? prev.filter(id => id !== musicianId)
        : [...prev, musicianId]
    )
  }

  function toggleAllMusicians() {
    if (selectedMusicianIds.length === filteredMusicians.length) {
      setSelectedMusicianIds([])
    } else {
      setSelectedMusicianIds(filteredMusicians.map(m => m.id))
    }
  }

  async function handleBulkDelete() {
    if (selectedMusicianIds.length === 0) return
    
    try {
      // Sprawdź czy muzycy mają aktywne wypożyczenia
      const loansSnapshot = await getDocs(
        query(collection(db, 'loans'), where('status', '==', 'active'))
      )
      
      const musiciansWithLoans = selectedMusicianIds.filter(musicianId =>
        loansSnapshot.docs.some(doc => doc.data().musicianId === musicianId)
      )

      if (musiciansWithLoans.length > 0) {
        const musicianNames = musiciansWithLoans.map(id => {
          const m = musicians.find(musician => musician.id === id)
          return m ? `${m.firstName} ${m.lastName}` : 'Nieznany'
        }).join(', ')
        
        alert(
          `Nie można usunąć następujących muzyków, ponieważ mają aktywne wypożyczenia:\n\n${musicianNames}\n\nNajpierw zwróć wszystkie ich wypożyczenia.`
        )
        return
      }

      const confirmMsg = `Czy na pewno chcesz usunąć ${selectedMusicianIds.length} ${
        selectedMusicianIds.length === 1 ? 'muzyka' : 
        selectedMusicianIds.length < 5 ? 'muzyków' : 'muzyków'
      }?`
      
      if (!confirm(confirmMsg)) return

      const batch = writeBatch(db)
      selectedMusicianIds.forEach(id => {
        batch.delete(doc(db, 'musicians', id))
      })
      await batch.commit()
      
      setSelectedMusicianIds([])
      loadMusicians()
    } catch (error) {
      console.error('Błąd usuwania muzyków:', error)
      alert('Wystąpił błąd podczas usuwania')
    }
  }

  const filteredMusicians = musicians.filter(m => {
    // Rozbij wyszukiwane wyrazy na pojedyncze słowa
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
    
    // Jeśli nie ma żadnego słowa do wyszukania, pokaż wszystko
    if (searchWords.length === 0) return true
    
    // Sprawdź czy każde słowo występuje w którymkolwiek polu
    return searchWords.every(word => {
      const firstName = m.firstName.toLowerCase()
      const lastName = m.lastName.toLowerCase()
      const instrument = m.instrument.toLowerCase()
      const email = m.email.toLowerCase()
      const phone = m.phone ? m.phone.toLowerCase() : ''
      
      return firstName.includes(word) || 
             lastName.includes(word) || 
             instrument.includes(word) ||
             email.includes(word) ||
             phone.includes(word)
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
          <h1 className="text-4xl font-bold text-gray-900 text-center md:text-left">Muzycy</h1>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto bg-pastel-burgundy text-white px-6 py-3 text-lg font-semibold rounded-xl hover:bg-opacity-90 shadow-lg transition-all"
          >
            + Dodaj muzyka
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="bg-pastel-peach p-6 rounded-xl shadow-lg border-2 border-pastel-gold">
          <input
            type="text"
            placeholder="🔍 Szukaj po wielu słowach, np. 'Jan Kowalski' lub 'trąbka gmail'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-pastel-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
          />
        </div>

        {/* Lista muzyków - widok tabeli na większych ekranach */}
        <div className="hidden lg:block bg-pastel-beige shadow-lg rounded-xl overflow-hidden border-2 border-pastel-gold">
          <table className="min-w-full divide-y-2 divide-pastel-gold">
            <thead className="bg-pastel-lavender">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={filteredMusicians.length > 0 && selectedMusicianIds.length === filteredMusicians.length}
                    onChange={toggleAllMusicians}
                    className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer"
                    title="Zaznacz wszystkich"
                  />
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Imię i nazwisko
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-800 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-800 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pastel-gold">
              {filteredMusicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-600 text-lg">
                    Brak muzyków w bazie
                  </td>
                </tr>
              ) : (
                filteredMusicians.map((musician) => (
                  <tr key={musician.id} className="hover:bg-pastel-cream transition-colors">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedMusicianIds.includes(musician.id)}
                        onChange={() => toggleMusicianSelection(musician.id)}
                        className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-base font-bold text-gray-900">
                        {musician.firstName} {musician.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      {musician.instrument}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      {musician.email}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      {musician.phone || '-'}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium space-x-3">
                      <button
                        onClick={() => openEditModal(musician)}
                        className="text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(musician.id)}
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

        {/* Lista muzyków - widok kart na małych ekranach */}
        <div className="lg:hidden space-y-4">
          {/* Checkbox "Zaznacz wszystkich" dla mobile */}
          {filteredMusicians.length > 0 && (
            <div className="bg-pastel-beige p-4 rounded-xl shadow-lg border-2 border-pastel-gold">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredMusicians.length > 0 && selectedMusicianIds.length === filteredMusicians.length}
                  onChange={toggleAllMusicians}
                  className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer"
                />
                <span className="ml-3 text-base font-semibold text-gray-800">
                  Zaznacz wszystkich ({filteredMusicians.length})
                </span>
              </label>
            </div>
          )}

          {filteredMusicians.length === 0 ? (
            <div className="bg-pastel-peach rounded-xl shadow-lg p-8 text-center text-gray-600 text-lg border-2 border-pastel-gold">
              Brak muzyków w bazie
            </div>
          ) : (
            filteredMusicians.map((musician) => (
              <div key={musician.id} className="bg-pastel-beige rounded-xl shadow-lg border-2 border-pastel-gold">
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedMusicianIds.includes(musician.id)}
                      onChange={() => toggleMusicianSelection(musician.id)}
                      className="w-5 h-5 text-pastel-burgundy border-2 border-pastel-gold rounded focus:ring-2 focus:ring-pastel-burgundy cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{musician.firstName} {musician.lastName}</h3>
                      <p className="text-base text-gray-700"><strong>Instrument:</strong> {musician.instrument}</p>
                      <p className="text-base text-gray-700 truncate"><strong>Email:</strong> {musician.email}</p>
                      <p className="text-base text-gray-700"><strong>Telefon:</strong> {musician.phone || '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-pastel-gold px-5 py-4 flex justify-end space-x-4 rounded-b-xl">
                  <button
                    onClick={() => openEditModal(musician)}
                    className="text-base font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(musician.id)}
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
      {selectedMusicianIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-pastel-burgundy text-white shadow-2xl border-t-4 border-pastel-gold z-40 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-lg font-bold">
                ✓ Zaznaczono: {selectedMusicianIds.length} {
                  selectedMusicianIds.length === 1 ? 'muzyka' : 
                  selectedMusicianIds.length < 5 ? 'muzyków' : 'muzyków'
                }
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all shadow-lg text-base"
                >
                  🗑️ Usuń zaznaczonych
                </button>
                <button
                  onClick={() => setSelectedMusicianIds([])}
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

            <div className="inline-block align-bottom bg-pastel-beige rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 border-pastel-gold">
              <form onSubmit={handleSubmit}>
                <div className="bg-pastel-beige px-6 pt-6 pb-5 sm:p-8 sm:pb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">
                    {editingMusician ? 'Edytuj muzyka' : 'Dodaj muzyka'}
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Imię *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Nazwisko *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">Instrument *</label>
                      <input
                        type="text"
                        required
                        value={formData.instrument}
                        onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                        className="mt-1 block w-full border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
                        placeholder="np. Trąbka, Skrzypce"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-pastel-gold px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-xl border-2 border-pastel-burgundy shadow-lg px-6 py-3 bg-pastel-burgundy text-lg font-bold text-white hover:bg-opacity-90 focus:outline-none sm:w-auto transition-all"
                  >
                    {editingMusician ? 'Zapisz' : 'Dodaj'}
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

