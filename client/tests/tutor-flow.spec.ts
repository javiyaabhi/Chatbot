import { expect, test } from '@playwright/test'

test('tutor workspace interactive features work smoothly', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'What would you like to learn?' })).toBeVisible()
  await expect(page.getByText('EduVaani AI')).toBeVisible()
  await expect(page.getByText('Academic Tutor')).toBeVisible()

  await expect(page.getByRole('radio', { name: /Beginner/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Step-by-Step/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Standard/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Exam Prep/ })).toBeVisible()

  const stepByStepBtn = page.getByRole('radio', { name: /Step-by-Step/ })
  await stepByStepBtn.click()
  await expect(stepByStepBtn).toHaveClass(/active/)

  await page.getByRole('button', { name: /Specialized mode/ }).click()
  await page.getByLabel('Your subject').selectOption('Operating Systems')
  await expect(page.getByText('Answers will stay focused on Operating Systems.')).toBeVisible()

  await page.getByRole('button', { name: 'Start a new conversation' }).click()
  const sessionDialog = page.getByRole('dialog', { name: 'Set up a study session' })
  await sessionDialog.getByRole('button', { name: 'Start learning' }).click()
  await expect(page.locator('.subject-badge')).toContainText('Specialized · Operating Systems')
  await expect(page.getByRole('heading', { name: 'Ask your first Operating Systems question' })).toBeVisible()

  const searchInput = page.getByPlaceholder('Search past sessions...')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('Operating')
  await expect(page.locator('.history-item-title').first()).toBeVisible()
})
