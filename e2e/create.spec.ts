import { test, expect } from '@playwright/test'

async function goToCreate(page: any) {
  await page.goto('/')
  const isLoggedIn = await page.locator('.home-nav-wrap').isVisible({ timeout: 5000 }).catch(() => false)
  if (!isLoggedIn) test.skip(true, '로그인 세션 없음 — TEST_USER_ID/TEST_USER_PASSWORD 환경변수를 설정하세요')
  await page.getByRole('button', { name: '모임' }).click()
  await page.getByRole('button', { name: '새로운 방 만들기' }).click()
  await expect(page.getByText('새 방 만들기')).toBeVisible()
}

test.describe('방 만들기 화면', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page)
  })

  test('"새 방 만들기" 타이틀 표시', async ({ page }) => {
    await expect(page.getByText('새 방 만들기')).toBeVisible()
  })

  test('방장 닉네임 안내 배너 표시', async ({ page }) => {
    await expect(page.getByText('으로 방장이 돼요')).toBeVisible()
  })

  test('모임 이름 입력 필드 표시', async ({ page }) => {
    const input = page.getByRole('textbox')
    await expect(input).toBeVisible()
    const maxLength = await input.getAttribute('maxlength')
    expect(maxLength).toBe('25')
  })

  test('빈 이름으로 "방 만들기" 클릭 → 버튼 비활성화', async ({ page }) => {
    const btn = page.getByRole('button', { name: /방 만들기/ })
    await expect(btn).toBeDisabled()
  })

  test('이름 입력 후 "방 만들기" 버튼 활성화', async ({ page }) => {
    await page.getByRole('textbox').fill('테스트 방')
    const btn = page.getByRole('button', { name: /방 만들기/ })
    await expect(btn).toBeEnabled()
  })

  test('뒤로가기 버튼 → 홈 화면', async ({ page }) => {
    await page.getByRole('button', { name: '' }).first().click() // TopBar 뒤로가기
    await expect(page.locator('.home-nav-wrap')).toBeVisible()
  })
})
