import { test, expect } from '@playwright/test'

const TEST_ROOM_CODE = process.env.TEST_ROOM_CODE

async function goToCalendar(page: any) {
  await page.goto('/')
  const isLoggedIn = await page.locator('.home-nav-wrap').isVisible({ timeout: 5000 }).catch(() => false)
  if (!isLoggedIn) test.skip(true, '로그인 세션 없음')
  if (!TEST_ROOM_CODE) test.skip(true, 'TEST_ROOM_CODE 환경변수 필요')

  // 방 코드로 참여 (이미 참여 중이면 중복 없이 달력으로 이동)
  await page.getByRole('button', { name: '모임' }).click()
  await page.getByRole('button', { name: '방 코드로 참여하기' }).click()
  await page.getByRole('textbox').fill(TEST_ROOM_CODE!)
  await page.getByRole('button', { name: /참여하기/ }).click()
  await page.waitForSelector('.cal-header', { timeout: 10000 })
}

test.describe('달력 화면 — 헤더', () => {
  test.beforeEach(async ({ page }) => { await goToCalendar(page) })

  test('방 이름과 참여 인원 수 표시', async ({ page }) => {
    await expect(page.locator('.cal-room-name')).toBeVisible()
    await expect(page.locator('.cal-member-count')).toContainText('명 참여')
  })

  test('"방 나가기" 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: '방 나가기' })).toBeVisible()
  })

  test('"방 나가기" 클릭 → 확인 모달 표시', async ({ page }) => {
    await page.getByRole('button', { name: '방 나가기' }).click()
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible()
    await expect(page.getByRole('button', { name: '확인' })).toBeVisible()
  })

  test('"방 나가기" 모달 취소 → 달력 유지', async ({ page }) => {
    await page.getByRole('button', { name: '방 나가기' }).click()
    await page.getByRole('button', { name: '취소' }).click()
    await expect(page.locator('.cal-header')).toBeVisible()
    await expect(page.locator('.modal')).not.toBeVisible()
  })
})

test.describe('달력 화면 — 내 스케쥴 카드', () => {
  test.beforeEach(async ({ page }) => { await goToCalendar(page) })

  test('내 이름 + 안되는 날 카드 표시', async ({ page }) => {
    await expect(page.locator('.cal-my-card')).toBeVisible()
    await expect(page.locator('.cal-my-name')).toContainText('안되는 날')
  })

  test('"선택하기/수정하기" 클릭 → 편집 모드', async ({ page }) => {
    const editBtn = page.locator('.cal-edit-start')
    await editBtn.click()
    await expect(page.locator('.cal-edit-done')).toBeVisible()
    await expect(page.locator('.cal-my-hint')).toContainText('날짜를 눌러 선택')
  })

  test('편집 모드에서 카드 테두리 활성화', async ({ page }) => {
    await page.locator('.cal-edit-start').click()
    await expect(page.locator('.cal-my-card.edit')).toBeVisible()
  })

  test('"완료" 클릭 → 뷰 모드 복귀', async ({ page }) => {
    await page.locator('.cal-edit-start').click()
    await page.locator('.cal-edit-done').click()
    await expect(page.locator('.cal-edit-start')).toBeVisible()
    await expect(page.locator('.cal-edit-done')).not.toBeVisible()
  })

  test('편집 모드에서 "다른 방 일정 불러오기" 버튼 표시', async ({ page }) => {
    await page.locator('.cal-edit-start').click()
    await expect(page.locator('.cal-import-btn')).toBeVisible()
  })
})

test.describe('달력 화면 — 달력 그리드', () => {
  test.beforeEach(async ({ page }) => { await goToCalendar(page) })

  test('월 이동 버튼 표시', async ({ page }) => {
    await expect(page.locator('.cal-month-nav .cal-month-btn').first()).toBeVisible()
    await expect(page.locator('.cal-month-nav .cal-month-btn').last()).toBeVisible()
  })

  test('이전 월 이동', async ({ page }) => {
    const label = page.locator('.cal-month-label')
    const before = await label.textContent()
    await page.locator('.cal-month-nav .cal-month-btn').first().click()
    expect(await label.textContent()).not.toBe(before)
  })

  test('다음 월 이동', async ({ page }) => {
    const label = page.locator('.cal-month-label')
    const before = await label.textContent()
    await page.locator('.cal-month-nav .cal-month-btn').last().click()
    expect(await label.textContent()).not.toBe(before)
  })

  test('날짜 셀 클릭 (뷰 모드) → 날짜 상세 팝업', async ({ page }) => {
    // 미래 날짜 셀 찾기 (past 클래스 없는 것)
    const cell = page.locator('.day-cell:not(.past):not(.empty)').first()
    await cell.click()
    await expect(page.locator('.detail-header')).toBeVisible()
    await expect(page.locator('.detail-date')).toBeVisible()
  })

  test('날짜 셀 재클릭 → 상세 팝업 닫힘', async ({ page }) => {
    const cell = page.locator('.day-cell:not(.past):not(.empty)').first()
    await cell.click()
    await expect(page.locator('.detail-header')).toBeVisible()
    await cell.dispatchEvent('click')
    await expect(page.locator('.detail-header')).not.toBeVisible()
  })

  test('편집 모드에서 날짜 클릭 → 상세 팝업 아닌 토글', async ({ page }) => {
    await page.locator('.cal-edit-start').click()
    const cell = page.locator('.day-cell:not(.past):not(.empty)').first()
    await cell.click()
    // 편집 모드에서는 detail-header가 없어야 함
    await expect(page.locator('.detail-header')).not.toBeVisible()
  })
})

test.describe('달력 화면 — 참여자 현황', () => {
  test.beforeEach(async ({ page }) => { await goToCalendar(page) })

  test('참여자 현황 카드와 헤더 표시', async ({ page }) => {
    await expect(page.locator('.member-section-header')).toContainText('참여자 현황')
  })

  test('본인 이름에 "(나)" 표시', async ({ page }) => {
    await expect(page.locator('.member-name', { hasText: '(나)' })).toBeVisible()
  })

  test('"링크로 친구 더 초대하기" 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: /링크로 친구 더 초대하기/ })).toBeVisible()
  })

  test('"링크로 친구 더 초대하기" 클릭 → 공유 모달 열림', async ({ page }) => {
    await page.getByRole('button', { name: /링크로 친구 더 초대하기/ }).click()
    await expect(page.locator('.code-box')).toBeVisible()
    await expect(page.locator('.url-box')).toBeVisible()
  })
})

test.describe('달력 화면 — 하단 네비게이션', () => {
  test.beforeEach(async ({ page }) => { await goToCalendar(page) })

  test('"달력" 탭이 활성 상태로 표시', async ({ page }) => {
    await expect(page.locator('.cal-nav')).toBeVisible()
  })

  test('"홈" 탭 클릭 → 홈 화면 이동', async ({ page }) => {
    await page.locator('.cal-nav-btn', { hasText: '홈' }).click()
    await expect(page.locator('.home-nav-wrap')).toBeVisible()
  })

  test('"모임" 탭 클릭 → 홈 화면 모임 탭', async ({ page }) => {
    await page.locator('.cal-nav-btn', { hasText: '모임' }).click()
    await expect(page.getByRole('button', { name: '새로운 방 만들기' })).toBeVisible()
  })
})
