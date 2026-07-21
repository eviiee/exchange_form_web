export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  if (!digits) return ''

  // 대표번호: 0으로 시작하지 않는 15xx/16xx/18xx 등 8자리 (예: 1588-1234)
  if (/^1[5-9]/.test(digits)) {
    if (digits.length <= 4) return digits
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`
  }

  // 안심번호: 0505/0502 등 050X 4자리 prefix
  if (/^050\d/.test(digits)) {
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`
  }

  // 서울: 02 (2자리 지역번호)
  if (digits.startsWith('02')) {
    if (digits.length < 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`
  }

  // 휴대전화(010/011 등), 인터넷전화(070), 그 외 3자리 지역번호(031~064)
  if (digits.length < 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}