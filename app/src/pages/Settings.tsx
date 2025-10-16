import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { AppSettings } from '../types'
import Layout from '../components/Layout'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    reminderIntervalDays: 7,
    emailEnabled: true
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const settingsDoc = await getDoc(doc(db, 'settings', 'app'))
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as AppSettings)
      }
    } catch (error) {
      console.error('Błąd ładowania ustawień:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      setSaving(true)
      await setDoc(doc(db, 'settings', 'app'), settings)
      setSuccessMessage('Ustawienia zostały zapisane')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Błąd zapisywania ustawień:', error)
      alert('Wystąpił błąd podczas zapisywania ustawień')
    } finally {
      setSaving(false)
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
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Ustawienia</h1>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">✓ {successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Powiadomienia email</h2>
            <p className="mt-1 text-sm text-gray-500">
              Konfiguracja automatycznych przypomnień dla muzyków
            </p>
          </div>

          <div className="px-6 py-4 space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={settings.emailEnabled}
                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label htmlFor="emailEnabled" className="ml-3 block text-sm font-medium text-gray-700">
                Włącz powiadomienia email
              </label>
            </div>

            <div>
              <label htmlFor="reminderInterval" className="block text-sm font-medium text-gray-700 mb-2">
                Interwał przypomnień (w dniach)
              </label>
              <input
                type="number"
                id="reminderInterval"
                min="1"
                max="30"
                value={settings.reminderIntervalDays}
                onChange={(e) => setSettings({ ...settings, reminderIntervalDays: parseInt(e.target.value) })}
                className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                disabled={!settings.emailEnabled}
              />
              <p className="mt-2 text-sm text-gray-500">
                Przypomnienia będą wysyłane co {settings.reminderIntervalDays} {settings.reminderIntervalDays === 1 ? 'dzień' : 'dni'} do muzyków z aktywnymi wypożyczeniami
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Jak działają powiadomienia?</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Przy dodaniu wypożyczenia - muzyk dostaje email z potwierdzeniem</li>
                <li>Co X dni (według ustawień) - muzyk dostaje przypomnienie o zwrot nut</li>
                <li>Przy zwrocie - muzyk dostaje potwierdzenie zwrotu</li>
              </ul>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 disabled:opacity-50"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </button>
          </div>
        </form>

        {/* Informacje o aplikacji */}
        <div className="bg-white shadow rounded-lg px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">O aplikacji</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Wersja:</dt>
              <dd className="text-gray-900 font-medium">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Typ aplikacji:</dt>
              <dd className="text-gray-900 font-medium">PWA (Progressive Web App)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Backend:</dt>
              <dd className="text-gray-900 font-medium">Firebase</dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  )
}

