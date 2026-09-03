const FIXED = [
  { month: 1,  day: 1,  name: '신정' },
  { month: 3,  day: 1,  name: '삼일절' },
  { month: 5,  day: 5,  name: '어린이날' },
  { month: 6,  day: 6,  name: '현충일' },
  { month: 8,  day: 15, name: '광복절' },
  { month: 10, day: 3,  name: '개천절' },
  { month: 10, day: 9,  name: '한글날' },
  { month: 12, day: 25, name: '성탄절' },
]

const VARIABLE = {
  2024: [
    { month: 2,  day: 9,  name: '설날연휴' },
    { month: 2,  day: 10, name: '설날' },
    { month: 2,  day: 11, name: '설날연휴' },
    { month: 2,  day: 12, name: '대체공휴일' },
    { month: 4,  day: 10, name: '국회의원선거' },
    { month: 5,  day: 6,  name: '대체공휴일' },
    { month: 5,  day: 15, name: '부처님오신날' },
    { month: 9,  day: 16, name: '추석연휴' },
    { month: 9,  day: 17, name: '추석' },
    { month: 9,  day: 18, name: '추석연휴' },
  ],
  2025: [
    { month: 1,  day: 28, name: '설날연휴' },
    { month: 1,  day: 29, name: '설날' },
    { month: 1,  day: 30, name: '설날연휴' },
    { month: 3,  day: 3,  name: '대체공휴일' },
    { month: 5,  day: 5,  name: '부처님오신날' },
    { month: 5,  day: 6,  name: '대체공휴일' },
    { month: 10, day: 5,  name: '추석연휴' },
    { month: 10, day: 6,  name: '추석' },
    { month: 10, day: 7,  name: '추석연휴' },
    { month: 10, day: 8,  name: '대체공휴일' },
  ],
  2026: [
    { month: 2,  day: 16, name: '설날연휴' },
    { month: 2,  day: 17, name: '설날' },
    { month: 2,  day: 18, name: '설날연휴' },
    { month: 3,  day: 2,  name: '대체공휴일' },
    { month: 5,  day: 24, name: '부처님오신날' },
    { month: 5,  day: 25, name: '대체공휴일' },
    { month: 8,  day: 17, name: '대체공휴일' },
    { month: 9,  day: 24, name: '추석연휴' },
    { month: 9,  day: 25, name: '추석' },
    { month: 9,  day: 26, name: '추석연휴' },
    { month: 9,  day: 28, name: '대체공휴일' },
    { month: 10, day: 5,  name: '대체공휴일' },
  ],
  2027: [
    { month: 2,  day: 5,  name: '설날연휴' },
    { month: 2,  day: 6,  name: '설날' },
    { month: 2,  day: 7,  name: '설날연휴' },
    { month: 2,  day: 8,  name: '대체공휴일' },
    { month: 2,  day: 9,  name: '대체공휴일' },
    { month: 5,  day: 13, name: '부처님오신날' },
    { month: 8,  day: 16, name: '대체공휴일' },
    { month: 9,  day: 14, name: '추석연휴' },
    { month: 9,  day: 15, name: '추석' },
    { month: 9,  day: 16, name: '추석연휴' },
    { month: 10, day: 4,  name: '대체공휴일' },
    { month: 10, day: 11, name: '대체공휴일' },
    { month: 12, day: 27, name: '대체공휴일' },
  ],
}

export function getHoliday(year, month, day) {
  const variable = VARIABLE[year]?.find(h => h.month === month && h.day === day)
  if (variable) return variable.name
  return FIXED.find(h => h.month === month && h.day === day)?.name ?? null
}
