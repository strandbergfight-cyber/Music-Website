export default function TeacherDashboardPage({
  todayLessonCount,
  totalStudentCount,
  todayLessons,
  syncLogs,
  onLogout
}) {
  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">Dashboard</span>
            <h2>教学概览</h2>
          </div>
          <img
            alt="教师头像"
            className="teacher-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV2htHRsfqWSlEwotxDo4_k7RISuTx_es-OBfqF-555j5YycOelbpPulxHuCgnHWd0PHnGBDKy-lTouBgx-LkfmMNt67-CHocRNnqx81_jwU_w0pVoaoatblRw8T48NqdtiWPiKHm8Rxt14_DFEQ_Uyk7LmYvhE1VXAMDWvhtppVmexDolzrEbnm2ClVekf_G68SJeHB1_uesbZ2rzJvi8foBjeschbN2b1n1_AdZ_QS_TcD0IZ6zRAj_FGMku6byPpCNNKMPSPHva"
          />
        </div>
        <div className="teacher-dashboard-actions">
          <button className="teacher-add-btn" onClick={onLogout} type="button">
            退出登录
          </button>
        </div>
        <div className="teacher-stats-grid">
          <article className="teacher-stat-card">
            <span>今日课程数</span>
            <strong>{todayLessonCount}</strong>
          </article>
          <article className="teacher-stat-card">
            <span>学员总数</span>
            <strong>{totalStudentCount}</strong>
          </article>
        </div>
        <div className="teacher-today-list">
          <h3>今日课程清单</h3>
          {todayLessons.length ? (
            todayLessons.map((lesson) => (
              <div key={lesson.id} className="teacher-today-item">
                <strong>{lesson.time}</strong>
                <p>
                  {lesson.course} · {lesson.student}
                </p>
              </div>
            ))
          ) : (
            <div className="teacher-today-item">
              <strong>今日暂无课程</strong>
            </div>
          )}
        </div>
        <div className="teacher-sync-list">
          <h3>最近同步记录</h3>
          {syncLogs.length ? (
            syncLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="teacher-sync-item">
                <strong>{log.message}</strong>
                <p>{log.time}</p>
              </div>
            ))
          ) : (
            <div className="teacher-sync-item">
              <strong>暂无同步记录</strong>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
