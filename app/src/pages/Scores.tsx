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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Nuty</h1>
          <button
            onClick={openAddModal}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
          >
            + Dodaj nuty
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Szukaj po tytule, kompozytorze, głosie lub numerze katalogowym..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Lista nut */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tytuł
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kompozytor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Głos/Partia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nr katalogowy
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Brak nut w bazie
                  </td>
                </tr>
              ) : (
                filteredScores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {score.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {score.composer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {score.part}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {score.catalogNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(score)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        className="text-red-600 hover:text-red-900"
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

