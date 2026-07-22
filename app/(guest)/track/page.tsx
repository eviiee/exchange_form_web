import TrackForm from './TrackForm'

export default function TrackPage() {
  return (
    <div>
      <h1 className="text-lg font-bold text-ink-900 mb-1">진행상황 조회</h1>
      <p className="text-sm text-ink-600 mb-6">신청 시 입력한 이름과 비밀번호를 입력해주세요</p>
      <TrackForm />
    </div>
  )
}