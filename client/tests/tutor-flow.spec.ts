import { expect, test } from '@playwright/test'

test('tutor workspace interactive features work smoothly', async ({ page }) => {
  await page.goto('/')

  // Verify enhanced welcome screen and academic branding
  await expect(page.getByText('EduVaani AI')).toBeVisible()
  await expect(page.getByText('Academic Tutor')).toBeVisible()
  await expect(page.getByText('Quiet Academic Multilingual AI Tutor')).toBeVisible()

  // Verify 4-tier Teaching Mode selector is visible on desktop
  await expect(page.getByRole('radio', { name: /Beginner/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Step-by-Step/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Standard/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Exam Prep/ })).toBeVisible()

  // Toggle teaching mode to Step-by-Step
  const stepByStepBtn = page.getByRole('radio', { name: /Step-by-Step/ })
  await stepByStepBtn.click()
  await expect(stepByStepBtn).toHaveClass(/active/)

  // Verify subject catalog cards
  await expect(page.getByRole('heading', { name: 'Database Systems' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Operating Systems' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Computer Networks' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data Structures & Algorithms' })).toBeVisible()

  // Click on Operating Systems subject card to launch study session
  await page.getByRole('heading', { name: 'Operating Systems' }).click()
  await expect(page.locator('header').getByText('Operating Systems')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ask your first Operating Systems question' })).toBeVisible()

  // Test conversation search input in sidebar
  const searchInput = page.getByPlaceholder('Search past sessions...')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('Operating')
  await expect(page.locator('.history-item-title').first()).toBeVisible()
})
