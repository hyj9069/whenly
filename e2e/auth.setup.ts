import { test as setup } from '@playwright/test'
import { STORAGE_STATE } from '../playwright.config'
import fs from 'fs'
import path from 'path'

const TEST_ID = process.env.TEST_USER_ID
const TEST_PW = process.env.TEST_USER_PASSWORD

setup('로그인 세션 저장', async ({ page }) => {
  if (!TEST_ID || !TEST_PW) {
    // 빈 storageState 저장 (authenticated 테스트들이 skip 처리할 것)
    const dir = path.dirname(STORAGE_STATE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  await page.goto('/')
  await page.getByRole('textbox', { name: '아이디' }).fill(TEST_ID)
  await page.getByRole('textbox', { name: '비밀번호' }).fill(TEST_PW)
  await page.getByRole('button', { name: '로그인' }).click()

  // 홈 화면 렌더링 대기
  await page.waitForSelector('.home-nav-wrap', { timeout: 15000 })

  await page.context().storageState({ path: STORAGE_STATE })
})
