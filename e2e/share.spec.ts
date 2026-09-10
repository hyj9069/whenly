import { test, expect } from '@playwright/test'

const TEST_ROOM_CODE = process.env.TEST_ROOM_CODE

async function openShareModal(page: any) {
  await page.goto('/')
  const isLoggedIn = await page.locator('.home-nav-wrap').isVisible({ timeout: 5000 }).catch(() => false)
  if (!isLoggedIn) test.skip(true, '로그인 세션 없음')
  if (!TEST_ROOM_CODE) test.skip(true, 'TEST_ROOM_CODE 환경변수 필요')

  await page.getByRole('button', { name: '모임' }).click()
  await page.getByRole('button', { name: '방 코드로 참여하기' }).click()
  await page.getByRole('textbox').fill(TEST_ROOM_CODE!)
  await page.getByRole('button', { name: /참여하기/ }).click()
  await page.waitForSelector('.cal-header', { timeout: 10000 })

  // 공유 모달 열기
  await page.getByRole('button', { name: /링크로 친구 더 초대하기/ }).click()
  await expect(page.locator('.code-box')).toBeVisible()
}

test.describe('공유 모달', () => {
  test.beforeEach(async ({ page }) => { await openShareModal(page) })

  test('방 코드 대문자로 표시', async ({ page }) => {
    const codeText = await page.locator('.code-box').textContent()
    expect(codeText).toContain(TEST_ROOM_CODE!.toUpperCase())
  })

  test('공유 링크 URL 표시', async ({ page }) => {
    await expect(page.locator('.url-box')).toBeVisible()
    const urlText = await page.locator('.url-box').textContent()
    expect(urlText).toContain(`room=${TEST_ROOM_CODE}`)
  })

  test('"닫기" 버튼 클릭 → 모달 닫힘', async ({ page }) => {
    await page.getByRole('button', { name: '닫기' }).click()
    await expect(page.locator('.code-box')).not.toBeVisible()
  })

  test('오버레이 클릭 → 모달 닫힘', async ({ page }) => {
    await page.mouse.click(10, 10) // 모달 바깥 오버레이 영역
    await expect(page.locator('.code-box')).not.toBeVisible()
  })

  test('"카카오톡으로 공유하기" 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: /카카오톡으로 공유하기/ })).toBeVisible()
  })

  test('"링크 복사" 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: /링크 복사/ })).toBeVisible()
  })
})
