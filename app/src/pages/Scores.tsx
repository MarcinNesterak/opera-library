import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { Score } from '../types'
import Layout from '../components/Layout'

export default function Scores() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    composer: '',
    part: '',
    catalogNumber: ''
  })

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
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      if (editingScore) {
        await updateDoc(doc(db, 'scores', editingScore.id), {
          ...formData,
        })
      } else {
        await addDoc(collection(db, 'scores'), {
          ...formData,
          createdAt: Timestamp.now()
        })
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

  const filteredScores = scores.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.composer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.part.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.catalogNumber && s.catalogNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
          <h1 className="text-4xl font-bold text-gray-900">Nuty</h1>
          <button
            onClick={openAddModal}
            className="bg-pastel-burgundy text-white px-6 py-3 text-lg font-semibold rounded-xl hover:bg-opacity-90 shadow-lg transition-all"
          >
            + Dodaj nuty
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="bg-pastel-lavender p-6 rounded-xl shadow-lg border-2 border-pastel-gold">
          <input
            type="text"
            placeholder="🔍 Szukaj po tytule, kompozytorze, głosie lub numerze katalogowym..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-pastel-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy"
          />
        </div>

        {/* Lista nut - widok tabeli na większych ekranach */}
        <div className="hidden md:block bg-pastel-peach shadow-lg rounded-xl overflow-hidden border-2 border-pastel-gold">
          <table className="min-w-full divide-y-2 divide-pastel-gold">
            <thead className="bg-pastel-beige">
              <tr>
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
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-600 text-lg">
                    Brak nut w bazie
                  </td>
                </tr>
              ) : (
                filteredScores.map((score) => (
                  <tr key={score.id} className="hover:bg-pastel-cream transition-colors">
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
        <div className="md:hidden space-y-4">
          {filteredScores.length === 0 ? (
            <div className="bg-pastel-lavender rounded-xl shadow-lg p-8 text-center text-gray-600 text-lg border-2 border-pastel-gold">
              Brak nut w bazie
            </div>
          ) : (
            filteredScores.map((score) => (
              <div key={score.id} className="bg-pastel-peach rounded-xl shadow-lg border-2 border-pastel-gold">
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">{score.title}</h3>
                  <p className="text-base text-gray-700"><strong>Kompozytor:</strong> {score.composer}</p>
                  <p className="text-base text-gray-700"><strong>Głos/Partia:</strong> {score.part}</p>
                  <p className="text-base text-gray-700"><strong>Nr kat.:</strong> {score.catalogNumber || '-'}</p>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingScore ? 'Edytuj nuty' : 'Dodaj nuty'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tytuł utworu *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        placeholder="np. Bolero"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kompozytor *</label>
                      <input
                        type="text"
                        required
                        value={formData.composer}
                        onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        placeholder="np. Maurice Ravel"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Głos/Partia *</label>
                      <input
                        type="text"
                        required
                        value={formData.part}
                        onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        placeholder="np. Trąbka 2, Skrzypce I"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Numer katalogowy</label>
                      <input
                        type="text"
                        value={formData.catalogNumber}
                        onChange={(e) => setFormData({ ...formData, catalogNumber: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        placeholder="np. OP-2024-001"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-900 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingScore ? 'Zapisz' : 'Dodaj'}
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

