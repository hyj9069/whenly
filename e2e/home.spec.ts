import { test, expect } from '@playwright/test'

async function requireAuth(page: any) {
  await page.goto('/')
  const isLoggedIn = await page.locator('.home-nav-wrap').isVisible({ timeout: 5000 }).catch(() => false)
  if (!isLoggedIn) test.skip(true, '로그인 세션 없음 — TEST_USER_ID/TEST_USER_PASSWORD 환경변수를 설정하세요')
}

test.describe('홈 화면 — 하단 네비게이션', () => {
  test.beforeEach(async ({ page }) => {
    await requireAuth(page)
  })

  test('홈/모임/내 정보 탭 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: '홈' })).toBeVisible()
    await expect(page.getByRole('button', { name: '모임' })).toBeVisible()
    await expect(page.getByRole('button', { name: '내 정보' })).toBeVisible()
  })

  test('FAB(+) 버튼 표시', async ({ page }) => {
    await expect(page.locator('.home-nav-fab')).toBeVisible()
  })

  test('"모임" 탭 클릭 → 모임 탭 콘텐츠 표시', async ({ page }) => {
    await page.getByRole('button', { name: '모임' }).click()
    await expect(page.getByRole('button', { name: '새로운 방 만들기' })).toBeVisible()
    await expect(page.getByRole('button', { name: '방 코드로 참여하기' })).toBeVisible()
  })

  test('"내 정보" 탭 클릭 → 프로필 탭 콘텐츠 표시', async ({ page }) => {
    await page.getByRole('button', { name: '내 정보' }).click()
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()
  })

  test('"홈" 탭 다시 클릭 → 달력 탭 복귀', async ({ page }) => {
    await page.getByRole('button', { name: '모임' }).click()
    await page.getByRole('button', { name: '홈' }).click()
    await expect(page.locator('.home-month-label')).toBeVisible()
  })
})

test.describe('홈 화면 — 캘린더 탭', () => {
  test.beforeEach(async ({ page }) => {
    await requireAuth(page)
  })

  test('인사말 표시', async ({ page }) => {
    await expect(page.locator('.home-greeting')).toBeVisible()
  })

  test('이전/다음 월 버튼 표시', async ({ page }) => {
    const prevBtn = page.locator('.home-month-nav .cal-month-btn').first()
    const nextBtn = page.locator('.home-month-nav .cal-month-btn').last()
    await expect(prevBtn).toBeVisible()
    await expect(nextBtn).toBeVisible()
  })

  test('이전 월 이동', async ({ page }) => {
    const label = page.locator('.home-month-label')
    const before = await label.textContent()
    await page.locator('.home-month-nav .cal-month-btn').first().click()
    const after = await label.textContent()
    expect(after).not.toBe(before)
  })

  test('다음 월 이동', async ({ page }) => {
    const label = page.locator('.home-month-label')
    const before = await label.textContent()
    await page.locator('.home-month-nav .cal-month-btn').last().click()
    const after = await label.textContent()
    expect(after).not.toBe(before)
  })

  test('달력 날짜 셀 클릭 → DaySheet 열림', async ({ page }) => {
    const cells = page.locator('.home-cal-cell')
    await cells.first().click()
    await expect(page.locator('.day-sheet')).toBeVisible()
  })

  test('DaySheet: "일정" / "모임" 탭 버튼 표시', async ({ page }) => {
    await page.locator('.home-cal-cell').first().click()
    await expect(page.locator('.day-sheet-tab', { hasText: '일정' })).toBeVisible()
    await expect(page.locator('.day-sheet-tab', { hasText: '모임' })).toBeVisible()
  })

  test('DaySheet: 오버레이 클릭 → 닫힘', async ({ page }) => {
    await page.locator('.home-cal-cell').first().click()
    await expect(page.locator('.day-sheet')).toBeVisible()
    // DaySheet는 88dvh (≈742px). 뷰포트 상단 ~50px은 오버레이만 존재하므로 직접 좌표 클릭
    await page.mouse.click(195, 50)
    await expect(page.locator('.day-sheet')).not.toBeVisible()
  })

  test('같은 날짜 재클릭 → DaySheet 닫힘', async ({ page }) => {
    const cell = page.locator('.home-cal-cell').first()
    await cell.click()
    await expect(page.locator('.day-sheet')).toBeVisible()
    // DaySheet가 88dvh를 차지해 달력이 가려지므로 dispatchEvent로 클릭 이벤트 발생
    await cell.dispatchEvent('click')
    await expect(page.locator('.day-sheet')).not.toBeVisible()
  })
})

test.describe('홈 화면 — 모임 탭', () => {
  test.beforeEach(async ({ page }) => {
    await requireAuth(page)
    await page.getByRole('button', { name: '모임' }).click()
  })

  test('"새로운 방 만들기" 버튼 클릭 → 방 만들기 화면', async ({ page }) => {
    await page.getByRole('button', { name: '새로운 방 만들기' }).click()
    await expect(page.getByText('새 방 만들기')).toBeVisible()
    await expect(page.getByRole('textbox', { name: /모임 이름|예:/ })).toBeVisible()
  })

  test('"방 코드로 참여하기" 버튼 클릭 → 코드 참여 화면', async ({ page }) => {
    await page.getByRole('button', { name: '방 코드로 참여하기' }).click()
    await expect(page.getByText('방 코드로 참여')).toBeVisible()
    await expect(page.getByRole('textbox', { name: /예: AB1C2D/ })).toBeVisible()
  })
})

test.describe('홈 화면 — 내 정보 탭', () => {
  test.beforeEach(async ({ page }) => {
    await requireAuth(page)
    await page.getByRole('button', { name: '내 정보' }).click()
  })

  test('닉네임과 이메일 표시', async ({ page }) => {
    await expect(page.locator('.profile-name')).toBeVisible()
    await expect(page.locator('.profile-email')).toBeVisible()
  })

  test('"수정" 클릭 → 입력 필드 열림', async ({ page }) => {
    await page.getByRole('button', { name: '수정' }).click()
    await expect(page.getByRole('textbox', { name: '표시 이름 입력' })).toBeVisible()
    await expect(page.getByRole('button', { name: '저장' })).toBeVisible()
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible()
  })

  test('"취소" 클릭 → 편집 모드 종료', async ({ page }) => {
    await page.getByRole('button', { name: '수정' }).click()
    await page.getByRole('button', { name: '취소' }).click()
    await expect(page.getByRole('button', { name: '수정' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '표시 이름 입력' })).not.toBeVisible()
  })

  test('"로그아웃" 클릭 → 로그인 화면', async ({ page }) => {
    await page.getByRole('button', { name: '로그아웃' }).click()
    await expect(page.getByRole('heading', { name: '언제보꼬' })).toBeVisible()
  })
})
