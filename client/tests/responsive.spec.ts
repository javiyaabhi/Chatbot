import { expect, test } from '@playwright/test'

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

test('learning mode selection fits supported viewports without horizontal overflow', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'What would you like to learn?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Create your account' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Regular mode/ })).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', { name: /Specialized mode/ }).click()
    await page.getByLabel('Your subject').selectOption('Mathematics')
    await expect(page.getByText('Answers will stay focused on Mathematics.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Type your academic question' })).toHaveAttribute('placeholder', /Mathematics/)

    const appOverflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }))
    expect(appOverflow.documentWidth, `workspace overflow at ${viewport.width}px`).toBeLessThanOrEqual(appOverflow.viewportWidth)
  }
})

test('specialized session saves subject and rejects missing subject', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'What would you like to learn?' })).toBeVisible()

  const invalidSessionStatus = await page.evaluate(async () => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'specialized', language: 'gu' }),
    })
    return response.status
  })
  expect(invalidSessionStatus).toBe(400)

  await page.getByRole('button', { name: 'Start a new conversation' }).click()
  const dialog = page.getByRole('dialog', { name: 'Set up a study session' })
  await dialog.getByRole('button', { name: 'Specialized', exact: true }).click()
  await dialog.getByLabel('Subject').selectOption('Mathematics')
  await dialog.getByRole('button', { name: 'Start learning' }).click()
  await expect(page.getByText('Specialized · Mathematics')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Type your academic question' })).toHaveAttribute('placeholder', /Mathematics/)

  await page.reload()
  await expect(page.getByRole('button', { name: /Mathematics/ })).toBeVisible()
})

test('mobile navigation is keyboard and screen-reader accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'What would you like to learn?' })).toBeVisible()

  const menu = page.getByRole('button', { name: 'Open navigation' })
  await menu.focus()
  await menu.press('Enter')
  await expect(page.getByRole('complementary', { name: 'Main navigation' }).getByRole('button', { name: 'Close navigation' })).toBeVisible()
  await page.getByRole('complementary', { name: 'Main navigation' }).getByRole('button', { name: 'Close navigation' }).press('Enter')
  await expect(menu).toBeVisible()
})

test('guest conversation history survives a page reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start a new conversation' }).click()
  await page.getByRole('dialog', { name: 'Set up a study session' }).getByRole('button', { name: 'Start learning' }).click()
  await expect(page.getByText('Ask anything to get started')).toBeVisible()
  await page.reload()
  const conversation = page.getByRole('button', { name: /New learning conversation/ })
  await expect(conversation).toBeVisible()
  await conversation.click()
  await expect(page.getByText('Ask anything to get started')).toBeVisible()
})
