import { test, expect } from '@playwright/test'

test.describe('로그인 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('앱 타이틀과 부제목 표시', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '언제보꼬' })).toBeVisible()
    await expect(page.getByText('친구들이랑 만날 수 있는 날 같이 찾아봐요!')).toBeVisible()
  })

  test('Google로 시작하기 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Google로 시작하기/ })).toBeVisible()
  })

  test('아이디/비밀번호 입력 필드 렌더링', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: '아이디' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '비밀번호' })).toBeVisible()
  })

  test('아이디 기억하기 체크박스 표시', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: '아이디 기억하기' })).toBeVisible()
  })

  test('빈 입력으로 로그인 → 오류 메시지', async ({ page }) => {
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page.getByText('존재하지 않는 아이디예요.')).toBeVisible()
  })

  test('존재하지 않는 아이디 → 오류 메시지', async ({ page }) => {
    await page.getByRole('textbox', { name: '아이디' }).fill('doesnotexist_xyz_9')
    await page.getByRole('textbox', { name: '비밀번호' }).fill('wrongpass1')
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page.getByText('존재하지 않는 아이디예요.')).toBeVisible()
  })

  test('"회원가입" 클릭 → 회원가입 모드', async ({ page }) => {
    await page.getByRole('button', { name: '회원가입' }).click()
    await expect(page.getByRole('textbox', { name: '닉네임 (앱에서 표시되는 이름)' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '이메일 (비밀번호 찾기용)' })).toBeVisible()
  })

  test('"비밀번호 찾기" 클릭 → 비밀번호 찾기 모드', async ({ page }) => {
    await page.getByRole('button', { name: '비밀번호 찾기' }).click()
    await expect(page.getByText('비밀번호 찾기')).toBeVisible()
    await expect(page.getByRole('button', { name: '재설정 링크 전송' })).toBeVisible()
  })
})

test.describe('회원가입 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '회원가입' }).click()
  })

  test('아이디 4자 미만 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '아이디' }).fill('ab')
    await expect(page.getByText('4자 이상 입력해주세요')).toBeVisible()
  })

  test('아이디 특수문자 포함 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '아이디' }).fill('test!@#')
    await expect(page.getByText('영문·숫자만 사용 가능해요')).toBeVisible()
  })

  test('유효한 아이디 → "사용 가능" 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '아이디' }).fill('validuser1')
    await expect(page.getByText('사용 가능')).toBeVisible()
  })

  test('닉네임 2자 미만 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '닉네임 (앱에서 표시되는 이름)' }).fill('가')
    await expect(page.getByText('2자 이상 입력해주세요')).toBeVisible()
  })

  test('이메일 형식 오류 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '이메일 (비밀번호 찾기용)' }).fill('notanemail')
    await expect(page.getByText('이메일 형식이 아니에요')).toBeVisible()
  })

  test('비밀번호 8자 미만 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '비밀번호 (영문+숫자 조합 8자 이상)' }).fill('abc1')
    await expect(page.getByText('8자 이상 입력해주세요')).toBeVisible()
  })

  test('비밀번호 숫자 없음 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '비밀번호 (영문+숫자 조합 8자 이상)' }).fill('weakpassword')
    await expect(page.getByText('숫자를 포함해야 해요')).toBeVisible()
  })

  test('비밀번호 영문 없음 → 오류 힌트', async ({ page }) => {
    await page.getByRole('textbox', { name: '비밀번호 (영문+숫자 조합 8자 이상)' }).fill('12345678')
    await expect(page.getByText('영문을 포함해야 해요')).toBeVisible()
  })

  test('유효하지 않은 상태에서 "회원가입" 클릭 → 모든 필드 오류 표시', async ({ page }) => {
    await page.getByRole('button', { name: '회원가입' }).click()
    await expect(page.getByText('아이디를 입력해주세요')).toBeVisible()
    await expect(page.getByText('닉네임을 입력해주세요')).toBeVisible()
    await expect(page.getByText('이메일을 입력해주세요')).toBeVisible()
    await expect(page.getByText('비밀번호를 입력해주세요')).toBeVisible()
  })

  test('"로그인" 클릭 → 로그인 모드 전환', async ({ page }) => {
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page.getByRole('button', { name: '비밀번호 찾기' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: '아이디 기억하기' })).toBeVisible()
  })
})

test.describe('비밀번호 찾기 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '비밀번호 찾기' }).click()
  })

  test('아이디 입력 필드와 전송 버튼 렌더링', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: '아이디' })).toBeVisible()
    await expect(page.getByRole('button', { name: '재설정 링크 전송' })).toBeVisible()
    await expect(page.getByRole('button', { name: '로그인으로 돌아가기' })).toBeVisible()
  })

  test('빈 아이디 제출 → 오류 메시지', async ({ page }) => {
    await page.getByRole('button', { name: '재설정 링크 전송' }).click()
    await expect(page.getByText('아이디를 입력해주세요.')).toBeVisible()
  })

  test('존재하지 않는 아이디 → 오류 메시지', async ({ page }) => {
    await page.getByRole('textbox', { name: '아이디' }).fill('nonexistentxxx')
    await page.getByRole('button', { name: '재설정 링크 전송' }).click()
    await expect(page.getByText('존재하지 않는 아이디예요.')).toBeVisible()
  })

  test('"로그인으로 돌아가기" → 로그인 모드', async ({ page }) => {
    await page.getByRole('button', { name: '로그인으로 돌아가기' }).click()
    await expect(page.getByRole('button', { name: '비밀번호 찾기' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: '아이디 기억하기' })).toBeVisible()
  })
})
