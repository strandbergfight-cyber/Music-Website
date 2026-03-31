import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'

function formatRequestTime(item) {
  return `${item.date} ${item.startTime} - ${item.endTime}`
}

export default function TeacherBookingRequestsPage() {
  const { data, reviewCustomBookingRequest } = useAppContext()
  const [filter, setFilter] = useState('pending')
  const requests = data.customBookingRequests || []
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return requests
    }
    return requests.filter((item) => item.status === filter)
  }, [filter, requests])

  function handleReview(requestId, action) {
    const result = reviewCustomBookingRequest?.(requestId, action)
    if (result?.success) {
      window.alert(action === 'approve' ? '已同意预约请求' : '已拒绝预约请求')
      return
    }
    if (result?.message) {
      window.alert(result.message)
    }
  }

  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">预约管理</span>
            <h2>自定义预约请求</h2>
          </div>
        </div>
        <div className="teacher-request-filters">
          <button
            className={`teacher-request-filter-btn${filter === 'pending' ? ' active' : ''}`}
            onClick={() => setFilter('pending')}
            type="button"
          >
            待处理
          </button>
          <button
            className={`teacher-request-filter-btn${filter === 'approved' ? ' active' : ''}`}
            onClick={() => setFilter('approved')}
            type="button"
          >
            已同意
          </button>
          <button
            className={`teacher-request-filter-btn${filter === 'rejected' ? ' active' : ''}`}
            onClick={() => setFilter('rejected')}
            type="button"
          >
            已拒绝
          </button>
          <button
            className={`teacher-request-filter-btn${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
            type="button"
          >
            全部
          </button>
        </div>
        <div className="teacher-manager-grid">
          {filteredRequests.length ? (
            filteredRequests.map((item) => {
              const student = data.students.find((studentItem) => studentItem.id === item.studentId)
              const statusLabel =
                item.status === 'approved' ? '已同意' : item.status === 'rejected' ? '已拒绝' : '待处理'
              return (
                <article key={item.id} className="teacher-manager-card teacher-request-card">
                  <div className="teacher-manager-main">
                    <strong>{student?.name || '学员'}</strong>
                    <p>{formatRequestTime(item)}</p>
                    <p>留言：{item.message || '无'}</p>
                    <p>状态：{statusLabel}</p>
                  </div>
                  <div className="teacher-manager-actions">
                    <button
                      disabled={item.status !== 'pending'}
                      onClick={() => handleReview(item.id, 'approve')}
                      type="button"
                    >
                      同意
                    </button>
                    <button
                      disabled={item.status !== 'pending'}
                      onClick={() => handleReview(item.id, 'reject')}
                      type="button"
                    >
                      拒绝
                    </button>
                  </div>
                </article>
              )
            })
          ) : (
            <article className="teacher-manager-card">
              <div className="teacher-manager-main">
                <strong>当前筛选下暂无预约请求</strong>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
