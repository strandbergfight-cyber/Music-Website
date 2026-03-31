import { useMemo, useState } from 'react'

export default function TeacherStudentManagementPage({
  students,
  onAdjustLessons,
  onAddStudent,
  onDeleteStudent,
  onResetPassword
}) {
  const [keyword, setKeyword] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentPhone, setNewStudentPhone] = useState('')

  const filteredStudents = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) {
      return students
    }
    return students.filter((student) => student.name.toLowerCase().includes(normalized))
  }, [keyword, students])

  function handleSubmitNewStudent(event) {
    event.preventDefault()
    if (!newStudentName.trim() || !newStudentPhone.trim()) {
      window.alert('请填写有效的学员姓名和手机号。')
      return
    }
    onAddStudent({
      name: newStudentName,
      phone: newStudentPhone
    })
    setIsAddModalOpen(false)
    setNewStudentName('')
    setNewStudentPhone('')
  }

  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">学员管理</span>
            <h2>学员列表</h2>
          </div>
          <img
            alt="教师头像"
            className="teacher-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV2htHRsfqWSlEwotxDo4_k7RISuTx_es-OBfqF-555j5YycOelbpPulxHuCgnHWd0PHnGBDKy-lTouBgx-LkfmMNt67-CHocRNnqx81_jwU_w0pVoaoatblRw8T48NqdtiWPiKHm8Rxt14_DFEQ_Uyk7LmYvhE1VXAMDWvhtppVmexDolzrEbnm2ClVekf_G68SJeHB1_uesbZ2rzJvi8foBjeschbN2b1n1_AdZ_QS_TcD0IZ6zRAj_FGMku6byPpCNNKMPSPHva"
          />
        </div>
        <div className="teacher-search-wrap">
          <input
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索学员姓名..."
            type="text"
            value={keyword}
          />
          <button className="teacher-add-btn" onClick={() => setIsAddModalOpen(true)} type="button">
            添加学员
          </button>
        </div>
        <div className="teacher-student-grid">
          {filteredStudents.length ? (
            filteredStudents.map((student) => (
              <article key={student.id} className="teacher-student-card">
                <div className="teacher-student-head">
                  <img
                    alt={student.name}
                    className="teacher-student-avatar"
                    src={
                      student.avatar ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCS3gPAOt8iPz9CYx60q4phdpPMTlZAVxfZ3F_zH8AHqcTgmpT1UyQS_khs0oO8WDIN00CcV8qFUZIm1pG38LHfKYAvguDCk_hkMupOCG5plslCaYNqHdhWcs8uVBcdCgcRNAhDsj41yTvLN6r1txgLgu4oosvUh83-r39soiU913-9BNcfTxhc18t9UbBT994ibh0dlF3ZrM3TooWbLBK-TSCLYY88jk38uNBFtE0TWzcX-Th9sDj9ppjX1SWsuEIZ14fyKYZLzrNm'
                    }
                  />
                  <div>
                    <strong>{student.name}</strong>
                    <p>{student.course}</p>
                    {student.phone && <p>{student.phone}</p>}
                  </div>
                </div>
                <div className="teacher-lesson-adjust">
                  <button onClick={() => onAdjustLessons(student.id, -1)} type="button">
                    -1
                  </button>
                  <span>剩余课时：{student.remainingLessons}</span>
                  <button onClick={() => onAdjustLessons(student.id, 1)} type="button">
                    +1
                  </button>
                  <button onClick={() => onResetPassword(student.id)} type="button">
                    重置密码
                  </button>
                  <button
                    className="teacher-delete-btn"
                    onClick={() => onDeleteStudent(student.id)}
                    type="button"
                  >
                    删除学员
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="teacher-student-card empty">
              <strong>未找到匹配学员</strong>
              <p>请尝试输入其他姓名关键词</p>
            </article>
          )}
        </div>
      </section>
      {isAddModalOpen && (
        <div className="teacher-modal-mask">
          <form className="teacher-modal-card" onSubmit={handleSubmitNewStudent}>
            <h3>添加学员</h3>
            <label>
              <span>学员姓名</span>
              <input
                onChange={(event) => setNewStudentName(event.target.value)}
                placeholder="请输入学员姓名"
                type="text"
                value={newStudentName}
              />
            </label>
            <label>
              <span>手机号</span>
              <input
                onChange={(event) => setNewStudentPhone(event.target.value)}
                placeholder="请输入手机号"
                type="tel"
                value={newStudentPhone}
              />
            </label>
            <div className="teacher-modal-actions">
              <button
                className="teacher-modal-cancel"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
              >
                取消
              </button>
              <button className="teacher-modal-confirm" type="submit">
                确认添加
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
