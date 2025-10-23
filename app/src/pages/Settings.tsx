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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pastel-burgundy"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 text-center md:text-left">Ustawienia</h1>

        {successMessage && (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-5 shadow-lg">
            <p className="text-base text-green-900 font-semibold">✓ {successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-pastel-peach shadow-lg rounded-xl border-2 border-pastel-gold">
          <div className="px-6 py-5 border-b-2 border-pastel-gold">
            <h2 className="text-2xl font-bold text-gray-900">📧 Powiadomienia email</h2>
            <p className="mt-2 text-base text-gray-700">
              Konfiguracja automatycznych przypomnień dla muzyków
            </p>
          </div>

          <div className="px-6 py-6 space-y-6 bg-white">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={settings.emailEnabled}
                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                className="h-6 w-6 text-pastel-burgundy focus:ring-2 focus:ring-pastel-burgundy border-2 border-pastel-gold rounded"
              />
              <label htmlFor="emailEnabled" className="block text-base font-semibold text-gray-800 cursor-pointer">
                Włącz powiadomienia email
              </label>
            </div>

            <div>
              <label htmlFor="reminderInterval" className="block text-base font-semibold text-gray-800 mb-3">
                Interwał przypomnień (w dniach)
              </label>
              <input
                type="number"
                id="reminderInterval"
                min="1"
                max="30"
                value={settings.reminderIntervalDays}
                onChange={(e) => setSettings({ ...settings, reminderIntervalDays: parseInt(e.target.value) })}
                className="block w-full max-w-xs border-2 border-pastel-gold rounded-lg shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-pastel-burgundy focus:border-pastel-burgundy disabled:opacity-50 disabled:bg-gray-100"
                disabled={!settings.emailEnabled}
              />
              <p className="mt-3 text-base text-gray-700">
                Przypomnienia będą wysyłane co {settings.reminderIntervalDays} {settings.reminderIntervalDays === 1 ? 'dzień' : 'dni'} do muzyków z aktywnymi wypożyczeniami
              </p>
            </div>

            <div className="bg-pastel-lavender border-2 border-pastel-gold rounded-xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">ℹ️ Jak działają powiadomienia?</h3>
              <ul className="text-base text-gray-800 space-y-2 list-disc list-inside">
                <li>Przy dodaniu wypożyczenia - muzyk dostaje email z potwierdzeniem</li>
                <li>Co X dni (według ustawień) - muzyk dostaje przypomnienie o zwrot nut</li>
                <li>Przy zwrocie - muzyk dostaje potwierdzenie zwrotu</li>
              </ul>
            </div>
          </div>

          <div className="px-6 py-5 bg-pastel-beige border-t-2 border-pastel-gold rounded-b-xl">
            <button
              type="submit"
              disabled={saving}
              className="bg-pastel-burgundy text-white px-8 py-3 text-lg font-semibold rounded-xl hover:bg-opacity-90 disabled:opacity-50 shadow-lg transition-all w-full md:w-auto"
            >
              {saving ? 'Zapisywanie...' : '💾 Zapisz ustawienia'}
            </button>
          </div>
        </form>

        {/* Informacje o aplikacji */}
        <div className="bg-pastel-lavender shadow-lg rounded-xl px-6 py-6 border-2 border-pastel-gold">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">📱 O aplikacji</h2>
          <dl className="space-y-4 text-base">
            <div className="flex justify-between items-center py-3 border-b border-pastel-gold">
              <dt className="text-gray-700 font-medium">Wersja:</dt>
              <dd className="text-gray-900 font-bold">1.0.0</dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-pastel-gold">
              <dt className="text-gray-700 font-medium">Typ aplikacji:</dt>
              <dd className="text-gray-900 font-bold">PWA (Progressive Web App)</dd>
            </div>
            <div className="flex justify-between items-center py-3">
              <dt className="text-gray-700 font-medium">Backend:</dt>
              <dd className="text-gray-900 font-bold">Firebase</dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  )
}

