import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function StudentBuyLessonsPage() {
  const { data } = useAppContext()
  const [quickLessons, setQuickLessons] = useState(4)
  const [customLessons, setCustomLessons] = useState('')
  const lessonUnitPrice = Number(data.lessonUnitPrice || 150)
  const selectedLessons = customLessons.trim() ? Number(customLessons) : quickLessons
  const totalPrice = useMemo(
    () => (Number.isFinite(selectedLessons) && selectedLessons > 0 ? selectedLessons * lessonUnitPrice : 0),
    [selectedLessons, lessonUnitPrice]
  )
  const paymentQrs =
    (Array.isArray(data.paymentQrs) && data.paymentQrs.length
      ? data.paymentQrs
      : data.paymentQr
        ? [{ id: 'legacy-qr', channel: '收款码', image: data.paymentQr }]
        : []) || []

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">购买课时</span>
            <h2>扫码购买</h2>
          </div>
        </div>
        <article className="feature-card buy-lessons-card">
          <div className="buy-lessons-pricing">
            <strong>课时单价：¥{lessonUnitPrice}</strong>
            <div className="buy-lessons-lesson-options">
              {[4, 8, 12].map((count) => (
                <button
                  key={count}
                  className={`buy-lessons-option${!customLessons && quickLessons === count ? ' active' : ''}`}
                  onClick={() => {
                    setCustomLessons('')
                    setQuickLessons(count)
                  }}
                  type="button"
                >
                  {count} 节
                </button>
              ))}
              <input
                min="1"
                onChange={(event) => setCustomLessons(event.target.value)}
                placeholder="自定义节数"
                type="number"
                value={customLessons}
              />
            </div>
            <p>总价：¥{totalPrice}</p>
          </div>
          {paymentQrs.length ? (
            <div className="buy-lessons-qr-grid">
              {paymentQrs.map((item) => (
                <div key={item.id} className="buy-lessons-qr-item">
                  <img alt={item.channel} className="buy-lessons-qr" src={item.image} />
                  <span>{item.channel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="buy-lessons-empty">老师暂未上传收款二维码</div>
          )}
          <p>扫描二维码购买课时，购买后联系老师确认开通</p>
        </article>
      </section>
    </main>
  )
}
