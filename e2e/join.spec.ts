import { test, expect } from '@playwright/test'

async function goToJoin(page: any) {
  await page.goto('/')
  const isLoggedIn = await page.locator('.home-nav-wrap').isVisible({ timeout: 5000 }).catch(() => false)
  if (!isLoggedIn) test.skip(true, '로그인 세션 없음 — TEST_USER_ID/TEST_USER_PASSWORD 환경변수를 설정하세요')
  await page.getByRole('button', { name: '모임' }).click()
  await page.getByRole('button', { name: '방 코드로 참여하기' }).click()
  await expect(page.getByText('방 코드로 참여')).toBeVisible()
}

test.describe('방 코드 참여 화면', () => {
  test.beforeEach(async ({ page }) => {
    await goToJoin(page)
  })

  test('"방 코드로 참여" 타이틀 표시', async ({ page }) => {
    await expect(page.getByText('방 코드로 참여')).toBeVisible()
  })

  test('6자리 코드 입력 필드 표시', async ({ page }) => {
    const input = page.getByRole('textbox')
    await expect(input).toBeVisible()
    const maxLength = await input.getAttribute('maxlength')
    expect(maxLength).toBe('6')
  })

  test('6자 미만 입력 → "참여하기" 버튼 비활성화', async ({ page }) => {
    await page.getByRole('textbox').fill('ABC')
    await expect(page.getByRole('button', { name: /참여하기/ })).toBeDisabled()
  })

  test('6자 입력 → "참여하기" 버튼 활성화', async ({ page }) => {
    await page.getByRole('textbox').fill('ABCDEF')
    await expect(page.getByRole('button', { name: /참여하기/ })).toBeEnabled()
  })

  test('소문자 입력 → 대문자로 변환', async ({ page }) => {
    await page.getByRole('textbox').fill('abcdef')
    const val = await page.getByRole('textbox').inputValue()
    expect(val).toBe('ABCDEF')
  })

  test('존재하지 않는 코드 → 오류(토스트 메시지)', async ({ page }) => {
    await page.getByRole('textbox').fill('XXXXXX')
    await page.getByRole('button', { name: /참여하기/ }).click()
    // 토스트 메시지 또는 화면에 오류 표시 확인
    await expect(page.getByText('방을 찾을 수 없어요')).toBeVisible({ timeout: 5000 })
  })

  test('뒤로가기 버튼 → 홈 화면', async ({ page }) => {
    await page.getByRole('button', { name: '' }).first().click()
    await expect(page.locator('.home-nav-wrap')).toBeVisible()
  })
})
