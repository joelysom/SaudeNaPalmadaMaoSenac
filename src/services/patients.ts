import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  validateBooking,
  type Appointment,
  type Exam,
  type Notice,
  type PatientData,
  type Profile,
  type Slot,
} from '@/domain/models'

export function subscribePatient(
  uid: string,
  receive: (part: Partial<PatientData>) => void,
  fail: (error: unknown) => void,
): Unsubscribe {
  const off = [
    onSnapshot(
      doc(db, 'patients', uid),
      (snap) => {
        if (snap.exists()) receive({ profile: snap.data() as Profile })
      },
      fail,
    ),
  ]
  for (const key of ['appointments', 'exams', 'notices'] as const)
    off.push(
      onSnapshot(
        collection(db, 'patients', uid, key),
        (snap) =>
          receive({
            [key]: snap.docs.map((item) => ({ ...item.data(), id: item.id })),
          }),
        fail,
      ),
    )
  return () => off.forEach((unsubscribe) => unsubscribe())
}
export async function getSlots(): Promise<Slot[]> {
  const snapshot = await getDocs(
    query(collection(db, 'slots'), where('available', '==', true)),
  )
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Slot)
}
export async function reserveSlot(
  uid: string,
  slot: Slot,
  appointments: Appointment[],
): Promise<Appointment> {
  validateBooking(slot, appointments)
  // Deterministic date/time document prevents two concurrent bookings for one patient.
  const id = `${slot.date}_${slot.time.replace(':', '-')}`
  const appointment: Appointment = {
    id,
    slotId: slot.id,
    specialty: slot.specialty,
    professional: slot.professional,
    unit: slot.unit,
    address: slot.address,
    date: slot.date,
    time: slot.time,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  const slotRef = doc(db, 'slots', slot.id)
  const appointmentRef = doc(db, 'patients', uid, 'appointments', id)
  await runTransaction(db, async (transaction) => {
    const live = await transaction.get(slotRef)
    const existing = await transaction.get(appointmentRef)
    if (!live.exists() || !live.data().available)
      throw new Error('Este horário acabou de ser reservado. Escolha outro.')
    if (existing.exists() && existing.data().status === 'confirmed')
      throw new Error('Você já tem uma consulta nesse horário.')
    const latest = { ...live.data(), id: live.id } as Slot
    validateBooking(latest, [])
    transaction.update(slotRef, {
      available: false,
      patientId: uid,
      appointmentId: id,
    })
    transaction.set(appointmentRef, {
      ...appointment,
      specialty: latest.specialty,
      professional: latest.professional,
      unit: latest.unit,
      address: latest.address,
    })
  })
  return appointment
}
export async function cancelAppointment(uid: string, appointment: Appointment) {
  await runTransaction(db, async (transaction) => {
    const slotRef = doc(db, 'slots', appointment.slotId)
    const appointmentRef = doc(
      db,
      'patients',
      uid,
      'appointments',
      appointment.id,
    )
    const liveSlot = await transaction.get(slotRef)
    const liveAppointment = await transaction.get(appointmentRef)
    if (
      !liveAppointment.exists() ||
      liveAppointment.data().status !== 'confirmed'
    )
      throw new Error('Esta consulta já foi cancelada.')
    if (
      !liveSlot.exists() ||
      liveSlot.data().patientId !== uid ||
      liveSlot.data().appointmentId !== appointment.id
    )
      throw new Error('Não foi possível liberar a vaga. Contate a unidade.')
    transaction.update(appointmentRef, { status: 'cancelled' })
    transaction.update(slotRef, {
      available: true,
      patientId: null,
      appointmentId: null,
    })
  })
}
export const saveProfile = (uid: string, profile: Profile) =>
  setDoc(doc(db, 'patients', uid), profile)
export const saveExam = (uid: string, exam: Exam) =>
  setDoc(doc(db, 'patients', uid, 'exams', exam.id), exam)
export const removeExam = (uid: string, id: string) =>
  deleteDoc(doc(db, 'patients', uid, 'exams', id))
export const saveNotice = (uid: string, notice: Notice) =>
  setDoc(doc(db, 'patients', uid, 'notices', notice.id), notice)
export const readNotice = (uid: string, id: string) =>
  updateDoc(doc(db, 'patients', uid, 'notices', id), { read: true })
