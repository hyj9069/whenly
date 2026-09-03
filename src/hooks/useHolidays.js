import { useState, useEffect } from 'react'
import { getHoliday as staticHoliday } from '../holidays'

const cache = new Map()
const API_KEY = import.meta.env.VITE_HOLIDAY_API_KEY

async function fetchHolidays(year, month) {
  const mo = String(month).padStart(2, '0')
  const url =
    `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo` +
    `?serviceKey=${API_KEY}&solYear=${year}&solMonth=${mo}&_type=json&numOfRows=50`
  const res  = await fetch(url)
  const data = await res.json()
  const raw  = data?.response?.body?.items?.item
  const list = raw ? (Array.isArray(raw) ? raw : [raw]) : []
  const map  = new Map()
  for (const item of list) {
    if (item.isHoliday === 'Y') {
      const day = item.locdate % 100
      map.set(day, item.dateName)
    }
  }
  return map
}

export function useHolidays(year, month) {
  const key = `${year}-${String(month).padStart(2, '0')}`
  const [dayMap, setDayMap] = useState(() => cache.get(key) ?? null)

  useEffect(() => {
    const cached = cache.get(key)
    if (cached !== undefined) { setDayMap(cached); return }
    if (!API_KEY) return

    fetchHolidays(year, month)
      .then(map => {
        const result = map.size > 0 ? map : null
        cache.set(key, result); setDayMap(result)
      })
      .catch(() => { cache.set(key, null) })
  }, [key, year, month])

  return (day) => {
    if (dayMap) return dayMap.get(day) ?? null
    return staticHoliday(year, month, day)
  }
}
