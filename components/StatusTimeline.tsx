import { STATUS_LABELS, STATUS_STEPS } from '@/lib/status-labels'

export default function StatusTimeline({ status }: { status: string }) {
  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-danger" />
        <span className="text-sm font-medium text-danger">{STATUS_LABELS.rejected}</span>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number])

  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, index) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                index <= currentIndex ? 'bg-primary' : 'bg-line-200'
              }`}
            />
            <span
              className={`text-[11px] whitespace-nowrap ${
                index <= currentIndex ? 'text-ink-900 font-medium' : 'text-ink-400'
              }`}
            >
              {STATUS_LABELS[step]}
            </span>
          </div>
          {index < STATUS_STEPS.length - 1 && (
            <div
              className={`h-[2px] flex-1 mx-1 -mt-4 transition-colors duration-300 ${
                index < currentIndex ? 'bg-primary' : 'bg-line-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}