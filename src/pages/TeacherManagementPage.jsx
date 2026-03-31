import { useMemo, useState } from 'react'

export default function TeacherManagementPage({
  teachers,
  currentTeacherId,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')

  const sortedTeachers = useMemo(
    () =>
      [...teachers].sort((a, b) => {
        if (a.id === currentTeacherId) {
          return -1
        }
        if (b.id === currentTeacherId) {
          return 1
        }
        return a.name.localeCompare(b.name, 'zh-CN')
      }),
    [teachers, currentTeacherId]
  )

  function openCreateModal() {
    setEditingTeacher(null)
    setName('')
    setTitle('')
    setIsModalOpen(true)
  }

  function openEditModal(teacher) {
    setEditingTeacher(teacher)
    setName(teacher.name)
    setTitle(teacher.title)
    setIsModalOpen(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedTitle = title.trim()
    if (!normalizedName || !normalizedTitle) {
      window.alert('请填写老师姓名和职称。')
      return
    }
    if (editingTeacher) {
      onUpdateTeacher({
        id: editingTeacher.id,
        name: normalizedName,
        title: normalizedTitle
      })
    } else {
      onAddTeacher({
        name: normalizedName,
        title: normalizedTitle
      })
    }
    setIsModalOpen(false)
  }

  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">老师管理</span>
            <h2>老师列表</h2>
          </div>
          <button className="teacher-add-btn" onClick={openCreateModal} type="button">
            添加老师
          </button>
        </div>
        <div className="teacher-manager-grid">
          {sortedTeachers.map((teacher) => (
            <article key={teacher.id} className="teacher-manager-card">
              <div className="teacher-manager-main">
                <strong>{teacher.name}</strong>
                <p>{teacher.title}</p>
              </div>
              <div className="teacher-manager-actions">
                <button onClick={() => openEditModal(teacher)} type="button">
                  编辑
                </button>
                <button
                  disabled={teacher.id === currentTeacherId}
                  onClick={() => onDeleteTeacher(teacher.id)}
                  type="button"
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      {isModalOpen && (
        <div className="teacher-modal-mask">
          <form className="teacher-modal-card" onSubmit={handleSubmit}>
            <h3>{editingTeacher ? '编辑老师' : '添加老师'}</h3>
            <label>
              <span>老师姓名</span>
              <input
                onChange={(event) => setName(event.target.value)}
                placeholder="请输入老师姓名"
                type="text"
                value={name}
              />
            </label>
            <label>
              <span>职称</span>
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：钢琴主讲老师"
                type="text"
                value={title}
              />
            </label>
            <div className="teacher-modal-actions">
              <button className="teacher-modal-cancel" onClick={() => setIsModalOpen(false)} type="button">
                取消
              </button>
              <button className="teacher-modal-confirm" type="submit">
                保存
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
