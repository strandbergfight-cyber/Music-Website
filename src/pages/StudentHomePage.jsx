export default function StudentHomePage({ lessonStats }) {
  const remainingLessons = Math.max(lessonStats.totalLessons - lessonStats.usedLessons, 0)
  const usedPercent = lessonStats.totalLessons
    ? Math.min((lessonStats.usedLessons / lessonStats.totalLessons) * 100, 100)
    : 0

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">学生端首页</span>
            <h2>课时总览</h2>
          </div>
          <img
            alt="学生头像"
            className="student-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF3QQlR3yrJewXjJy3Sxz4DQFXtcGR9ean8N6CQSAOmRq2K0vhIyjDyR9TTvCeKy2TFzkFyECGI0gpTttjanwwxBXbLOv0o42feD6eADel0y-E0pTkgKvde6RRMjdGJUpRJ-UzIHCe0casZqEQ4ToJ6R46XuqvYPJpN-cUkjHjLKUeioaQKvbPqj4D-A9K8TLTRERs3dWw7NrligwJjKts4dHLqM3ZFQWViBNyvpahWuD4-2KGRwGhUWBrXCd1xXcGvMiDRhLAQl4H"
          />
        </div>
        <div className="lesson-stats-grid">
          <article className="lesson-stat-card">
            <span>剩余课时</span>
            <strong>{remainingLessons}</strong>
          </article>
          <article className="lesson-stat-card">
            <span>已用课时</span>
            <strong>{lessonStats.usedLessons}</strong>
          </article>
          <article className="lesson-stat-card">
            <span>总课时</span>
            <strong>{lessonStats.totalLessons}</strong>
          </article>
        </div>
        <div className="lesson-progress-block">
          <div className="lesson-progress-meta">
            <span>课时进度</span>
            <span>{usedPercent.toFixed(0)}%</span>
          </div>
          <div className="lesson-progress-track">
            <div className="lesson-progress-fill" style={{ width: `${usedPercent}%` }} />
          </div>
        </div>
      </section>
    </main>
  )
}
