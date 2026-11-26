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

test('guest tutor works without login and has no horizontal overflow', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByText('What would you like to understand?')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Create your account' })).toHaveCount(0)

    const appOverflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }))
    expect(appOverflow.documentWidth, `workspace overflow at ${viewport.width}px`).toBeLessThanOrEqual(appOverflow.viewportWidth)
  }
})

test('mobile navigation is keyboard and screen-reader accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  await expect(page.getByText('What would you like to understand?')).toBeVisible()

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
  await expect(page.getByText('Ask your first DBMS question')).toBeVisible()
  await page.reload()
  const conversation = page.getByRole('button', { name: /New learning conversation/ })
  await expect(conversation).toBeVisible()
  await conversation.click()
  await expect(page.getByText('Ask your first DBMS question')).toBeVisible()
})
