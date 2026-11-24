import { expect, test } from '@playwright/test'
import {
  validateBooking,
  slotIsFuture,
  type Slot,
  type Appointment,
} from '../src/domain/models'

const slot: Slot = {
  id: 'slot-test',
  specialty: 'Clínica geral',
  professional: 'Profissional de teste',
  unit: 'Unidade teste',
  address: 'Endereço teste',
  date: '2099-01-15',
  time: '10:00',
  available: true,
}
test('recusa vagas vencidas, ocupadas e conflito de horário do paciente', () => {
  expect(slotIsFuture({ date: '2000-01-01', time: '10:00' })).toBe(false)
  expect(() => validateBooking({ ...slot, available: false }, [])).toThrow(
    /disponível/,
  )
  expect(() => validateBooking({ ...slot, date: '2000-01-01' }, [])).toThrow(
    /disponível/,
  )
  const other: Appointment = {
    ...slot,
    id: 'other',
    slotId: 'other-slot',
    specialty: 'Cardiologia',
    status: 'confirmed',
    createdAt: '',
  }
  expect(() => validateBooking(slot, [other])).toThrow(/nesse horário/)
  expect(() =>
    validateBooking(slot, [{ ...other, status: 'cancelled' }]),
  ).not.toThrow()
})
