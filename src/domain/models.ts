export interface Profile {
  name: string
  phone: string
  birthDate: string
  city: string
}
export interface Slot {
  id: string
  specialty: string
  professional: string
  unit: string
  address: string
  date: string
  time: string
  available: boolean
}
export interface Appointment extends Omit<Slot, 'available'> {
  slotId: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
}
export interface Exam {
  id: string
  name: string
  laboratory: string
  date: string
  status: 'requested' | 'scheduled' | 'completed'
  notes: string
  createdAt: string
}
export interface Notice {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}
export interface PatientData {
  profile: Profile
  appointments: Appointment[]
  exams: Exam[]
  notices: Notice[]
}

export const emptyData = (name = ''): PatientData => ({
  profile: { name, phone: '', birthDate: '', city: '' },
  appointments: [],
  exams: [],
  notices: [],
})
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function validateProfile(profile: Profile) {
  if (profile.name.trim().length < 3)
    throw new Error('Informe seu nome completo.')
  if (profile.birthDate && profile.birthDate > localDate())
    throw new Error('A data de nascimento não pode estar no futuro.')
}
export function validateExam(exam: Exam) {
  if (!exam.name.trim()) throw new Error('Informe o nome do exame.')
  if (exam.status === 'scheduled' && !exam.date)
    throw new Error('Informe a data do exame agendado.')
}
export function futureDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return localDate(d)
}
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' },
): string {
  return new Intl.DateTimeFormat('pt-BR', options).format(
    new Date(`${date}T12:00:00`),
  )
}
export function slotIsFuture(
  slot: Pick<Slot, 'date' | 'time'>,
  now = Date.now(),
) {
  return new Date(`${slot.date}T${slot.time}:00`).getTime() > now
}
export function validateBooking(slot: Slot, appointments: Appointment[]) {
  if (!slot.available || !slotIsFuture(slot))
    throw new Error('Este horário não está mais disponível.')
  if (
    appointments.some(
      (a) =>
        a.status === 'confirmed' &&
        a.date === slot.date &&
        a.time === slot.time,
    )
  )
    throw new Error('Você já tem uma consulta nesse horário.')
}
export const demoSlots = (): Slot[] =>
  [
    'Clínica geral',
    'Cardiologia',
    'Dermatologia',
    'Ginecologia',
    'Oftalmologia',
    'Ortopedia',
  ].flatMap((specialty, index) =>
    [1, 2, 4, 7].flatMap((day) =>
      ['08:30', '10:00', '14:00'].map((time) => ({
        id: `demo-${index}-${day}-${time}`,
        specialty,
        professional: [
          'Dra. Helena Costa',
          'Dr. Rafael Lima',
          'Dra. Clara Nunes',
          'Dra. Marina Alves',
          'Dr. André Souza',
          'Dr. Pedro Santos',
        ][index],
        unit: 'Unidade Jardim — demonstração',
        address: 'Rua das Flores, 120 · endereço fictício',
        date: futureDate(day),
        time,
        available: true,
      })),
    ),
  )
export function initialDemo(): PatientData {
  const slot = demoSlots()[0]
  return {
    profile: {
      name: 'Ana Oliveira',
      phone: '',
      birthDate: '',
      city: 'Fortaleza',
    },
    appointments: [
      {
        ...slot,
        id: 'example-appointment',
        slotId: slot.id,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    ],
    exams: [
      {
        id: 'example-exam',
        name: 'Hemograma completo',
        laboratory: 'Laboratório de demonstração',
        date: futureDate(3),
        status: 'scheduled',
        notes: 'Registro fictício para conhecer o aplicativo.',
        createdAt: new Date().toISOString(),
      },
    ],
    notices: [
      {
        id: 'welcome',
        title: 'Que bom ter você por aqui',
        body: 'Este é seu espaço de demonstração. Pessoas, vagas e registros são fictícios.',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  }
}
