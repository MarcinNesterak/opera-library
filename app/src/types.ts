// Typy danych dla aplikacji

export interface Musician {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  instrument: string
  createdAt: Date
}

export interface Score {
  id: string
  title: string
  composer: string
  part: string  // np. "Trąbka 2", "Skrzypce I"
  catalogNumber?: string
  createdAt: Date
}

export interface Loan {
  id: string
  musicianId: string
  scoreId: string
  loanDate: Date
  returnDate: Date | null
  status: 'active' | 'returned'
  notes?: string  // Uwagi do wypożyczenia (np. nietypowe instrumenty)
  createdAt: Date
}

// Rozszerzone typy z danymi powiązanymi
export interface LoanWithDetails extends Loan {
  musician?: Musician
  score?: Score
}

export interface AppSettings {
  reminderIntervalDays: number
  emailEnabled: boolean
}

