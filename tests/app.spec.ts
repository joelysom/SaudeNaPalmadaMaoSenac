import { expect, test, type Page } from '@playwright/test'

async function enterDemo(page: Page) {
  await page.goto('/entrar')
  await page.getByRole('button', { name: 'Explorar demonstração' }).click()
  await expect(page.getByRole('heading', { name: /Ana/ })).toBeVisible()
}
test('rotas privadas e formulários de acesso', async ({ page }) => {
  await page.goto('/exames')
  await expect(page).toHaveURL(/entrar/)
  await page.getByRole('button', { name: 'Cadastre-se', exact: true }).click()
  await expect(page.getByLabel('Nome completo')).toBeVisible()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await page.getByRole('button', { name: 'Voltar para entrar' }).click()
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click()
  await expect(
    page.getByRole('button', { name: 'Enviar instruções' }),
  ).toBeVisible()
})
test('agendar, exportar agenda e cancelar consulta', async ({ page }) => {
  await enterDemo(page)
  await page.getByRole('link', { name: 'Marcar consulta', exact: true }).click()
  await page
    .getByRole('button', { name: 'Cardiologia Ver horários disponíveis' })
    .click()
  await page.locator('.date-options button').first().click()
  await page.locator('.slot').first().click()
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
  await expect(
    page.getByRole('heading', { name: 'Seu próximo cuidado está marcado.' }),
  ).toBeVisible()
  await page
    .getByRole('link', { name: 'Ver minhas consultas', exact: true })
    .click()
  const record = page.locator('.appointment-card').filter({
    has: page.getByRole('heading', { name: 'Cardiologia', exact: true }),
  })
  await expect(record).toBeVisible()
  const download = page.waitForEvent('download')
  await record.getByRole('button', { name: 'Adicionar à agenda' }).click()
  await expect((await download).suggestedFilename()).toBe('minha-consulta.ics')
  await record.getByRole('button', { name: 'Cancelar consulta' }).click()
  await page.getByRole('button', { name: 'Sim, cancelar' }).click()
  await expect(record).toHaveCount(0)
  await page.getByRole('button', { name: 'Canceladas', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Cardiologia', exact: true }),
  ).toBeVisible()
})
test('exames: criar, editar, filtrar, persistir na sessão e excluir', async ({
  page,
}) => {
  await enterDemo(page)
  await page.goto('/exames')
  await page.getByRole('button', { name: 'Adicionar exame' }).click()
  await page.getByLabel('Nome do exame').fill('Ultrassonografia de teste')
  await page.getByLabel('Laboratório ou unidade').fill('Laboratório teste')
  await page.getByRole('button', { name: 'Salvar exame' }).click()
  const record = page.locator('.exam-card').filter({
    has: page.getByRole('heading', {
      name: 'Ultrassonografia de teste',
      exact: true,
    }),
  })
  await expect(record).toBeVisible()
  await record.getByRole('button', { name: 'Editar registro' }).click()
  await page
    .getByRole('combobox', { name: 'Situação', exact: true })
    .selectOption('completed')
  await page.getByRole('button', { name: 'Salvar exame' }).click()
  await page.reload()
  await expect(record.getByText('Realizado', { exact: true })).toBeVisible()
  await page.getByLabel('Filtrar situação').selectOption('requested')
  await expect(record).toHaveCount(0)
  await page.getByLabel('Filtrar situação').selectOption('all')
  await record
    .getByRole('button', { name: 'Excluir Ultrassonografia de teste' })
    .click()
  await page
    .getByRole('button', { name: 'Excluir registro', exact: true })
    .click()
  await expect(record).toHaveCount(0)
})
test('perfil, notificações, acessibilidade e saída', async ({
  page,
  isMobile,
}) => {
  await enterDemo(page)
  await page.goto('/perfil')
  await page.getByLabel('Nome completo').fill('Ana Silva')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('atualizados')
  await page.goto('/notificacoes')
  await page.getByRole('button', { name: 'Marcar todas como lidas' }).click()
  await page.getByRole('button', { name: 'Não lidas (0)' }).click()
  await expect(
    page.getByRole('heading', { name: 'Tudo tranquilo por aqui' }),
  ).toBeVisible()
  if (isMobile) await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page
    .getByRole('button', { name: 'Acessibilidade', exact: true })
    .first()
    .click()
  await page.getByLabel('Texto ampliado').check()
  await page.getByLabel('Alto contraste').check()
  await expect(page.locator('html')).toHaveClass(/large-text/)
  await expect(page.locator('html')).toHaveClass(/high-contrast/)
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await page.getByRole('button', { name: 'Sair da demonstração' }).click()
  await expect(page).toHaveURL(/entrar/)
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('snpdm-demo-data')))
    .toBeNull()
})
test('páginas não ultrapassam a largura da tela', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await enterDemo(page)
  for (const path of [
    '/',
    '/consultas',
    '/consultas/nova',
    '/exames',
    '/notificacoes',
    '/perfil',
    '/ajuda',
  ]) {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow, path).toBe(false)
    if (path === '/')
      await page.screenshot({
        path: testInfo.outputPath('inicio.png'),
        fullPage: true,
      })
  }
  expect(errors).toEqual([])
})

test('PWA: manifesto, service worker e abertura offline', async ({
  page,
  context,
}) => {
  test.skip(
    process.env.TEST_PRODUCTION !== '1',
    'Service worker só é gerado no build.',
  )
  await enterDemo(page)
  const manifest = await page.request.get('/manifest.webmanifest')
  expect(manifest.ok()).toBeTruthy()
  expect(await manifest.json()).toMatchObject({
    name: 'Saúde na Palma da Mão',
    display: 'standalone',
  })
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: /Ana/ })).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: /Ana/ })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('offline')
  await context.setOffline(false)
})
