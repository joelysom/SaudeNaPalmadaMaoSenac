import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useSession } from './Session'
import {
  emptyData,
  initialDemo,
  demoSlots,
  validateBooking,
  validateProfile,
  validateExam,
  slotIsFuture,
  type PatientData,
  type Profile,
  type Appointment,
  type Exam,
  type Slot,
} from '@/domain/models'
import * as api from '@/services/patients'
import { errorMessage } from '@/lib/firebase'

interface PatientContext extends PatientData {
  loading: boolean
  error: string
  slots: Slot[]
  reloadSlots: () => Promise<void>
  book: (slot: Slot) => Promise<void>
  cancel: (item: Appointment) => Promise<void>
  updateProfile: (profile: Profile) => Promise<void>
  upsertExam: (exam: Exam) => Promise<void>
  deleteExam: (id: string) => Promise<void>
  markRead: (id: string) => Promise<void>
}
const Context = createContext<PatientContext | null>(null)
export function PatientProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useSession()
  const [data, setData] = useState<PatientData>(() => {
    if (demo) {
      try {
        const saved = sessionStorage.getItem('snpdm-demo-data')
        if (saved) return JSON.parse(saved) as PatientData
      } catch {
        /* Reset an invalid demo session. */
      }
      return initialDemo()
    }
    return emptyData(user?.displayName || '')
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState('')
  useEffect(() => {
    if (demo) sessionStorage.setItem('snpdm-demo-data', JSON.stringify(data))
  }, [data, demo])
  useEffect(() => {
    if (demo || !user) return
    return api.subscribePatient(
      user.uid,
      (part) => {
        setData((previous) => ({ ...previous, ...part }))
        setLoading(false)
      },
      (e) => {
        setError(errorMessage(e))
        setLoading(false)
      },
    )
  }, [demo, user])
  async function reloadSlots() {
    setError('')
    try {
      setSlots(
        (demo ? demoSlots() : await api.getSlots()).filter((slot) =>
          slotIsFuture(slot),
        ),
      )
    } catch (e) {
      setError(errorMessage(e))
      throw e
    }
  }
  async function notify(title: string, body: string) {
    const notice = {
      id: crypto.randomUUID(),
      title,
      body,
      read: false,
      createdAt: new Date().toISOString(),
    }
    if (demo) setData((d) => ({ ...d, notices: [notice, ...d.notices] }))
    else if (user) {
      try {
        await api.saveNotice(user.uid, notice)
      } catch {
        setError('A operação foi salva, mas o aviso não pôde ser registrado.')
      }
    }
  }
  async function book(slot: Slot) {
    validateBooking(slot, data.appointments)
    if (demo) {
      const item: Appointment = {
        ...slot,
        id: crypto.randomUUID(),
        slotId: slot.id,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      }
      setData((d) => ({ ...d, appointments: [...d.appointments, item] }))
    } else if (user) await api.reserveSlot(user.uid, slot, data.appointments)
    else throw new Error('Entre novamente para continuar.')
    await notify(
      'Consulta marcada',
      `${slot.specialty} em ${slot.date.split('-').reverse().join('/')} às ${slot.time}.`,
    )
  }
  async function cancel(item: Appointment) {
    if (demo)
      setData((d) => ({
        ...d,
        appointments: d.appointments.map((a) =>
          a.id === item.id ? { ...a, status: 'cancelled' } : a,
        ),
      }))
    else if (user) await api.cancelAppointment(user.uid, item)
    await notify(
      'Consulta cancelada',
      `Seu agendamento de ${item.specialty} foi cancelado.`,
    )
  }
  async function updateProfile(profile: Profile) {
    validateProfile(profile)
    if (demo) setData((d) => ({ ...d, profile }))
    else if (user) await api.saveProfile(user.uid, profile)
  }
  async function upsertExam(exam: Exam) {
    validateExam(exam)
    if (demo)
      setData((d) => ({
        ...d,
        exams: [...d.exams.filter((e) => e.id !== exam.id), exam],
      }))
    else if (user) await api.saveExam(user.uid, exam)
  }
  async function deleteExam(id: string) {
    if (demo)
      setData((d) => ({ ...d, exams: d.exams.filter((e) => e.id !== id) }))
    else if (user) await api.removeExam(user.uid, id)
  }
  async function markRead(id: string) {
    if (demo)
      setData((d) => ({
        ...d,
        notices: d.notices.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }))
    else if (user) await api.readNotice(user.uid, id)
  }
  return (
    <Context.Provider
      value={{
        ...data,
        slots,
        error,
        loading,
        reloadSlots,
        book,
        cancel,
        updateProfile,
        upsertExam,
        deleteExam,
        markRead,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function usePatient() {
  const context = useContext(Context)
  if (!context) throw new Error('Dados indisponíveis.')
  return context
}
