import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function StudentInstrumentsPage() {
  const { data, setData, currentUser } = useAppContext()
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const list = currentUser ? data.studentInstrumentsById?.[currentUser.id] || [] : []

  function handleAdd() {
    const name = draft.trim()
    if (!name || !currentUser) {
      return
    }
    setData((prev) => ({
      ...prev,
      studentInstrumentsById: {
        ...(prev.studentInstrumentsById || {}),
        [currentUser.id]: [...(prev.studentInstrumentsById?.[currentUser.id] || []), { id: Date.now(), name }]
      }
    }))
    setDraft('')
  }

  function handleDelete(id) {
    if (!currentUser) {
      return
    }
    setData((prev) => ({
      ...prev,
      studentInstrumentsById: {
        ...(prev.studentInstrumentsById || {}),
        [currentUser.id]: (prev.studentInstrumentsById?.[currentUser.id] || []).filter((item) => item.id !== id)
      }
    }))
  }

  function handleSaveEdit(id) {
    const name = editingName.trim()
    if (!name || !currentUser) {
      return
    }
    setData((prev) => ({
      ...prev,
      studentInstrumentsById: {
        ...(prev.studentInstrumentsById || {}),
        [currentUser.id]: (prev.studentInstrumentsById?.[currentUser.id] || []).map((item) =>
          item.id === id ? { ...item, name } : item
        )
      }
    }))
    setEditingId(null)
    setEditingName('')
  }

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">我的乐器</span>
            <h2>乐器管理</h2>
          </div>
        </div>
        <article className="feature-card instruments-editor">
          <div className="instruments-add-row">
            <input
              onChange={(event) => setDraft(event.target.value)}
              placeholder="输入乐器名称"
              type="text"
              value={draft}
            />
            <button onClick={handleAdd} type="button">
              新增
            </button>
          </div>
        </article>
        <div className="feature-list">
          {list.length ? (
            list.map((item) => (
              <article key={item.id} className="feature-card instruments-item">
                {editingId === item.id ? (
                  <div className="instruments-edit-row">
                    <input
                      onChange={(event) => setEditingName(event.target.value)}
                      type="text"
                      value={editingName}
                    />
                    <button onClick={() => handleSaveEdit(item.id)} type="button">
                      保存
                    </button>
                  </div>
                ) : (
                  <strong>{item.name}</strong>
                )}
                <div className="instruments-actions">
                  <button
                    onClick={() => {
                      setEditingId(item.id)
                      setEditingName(item.name)
                    }}
                    type="button"
                  >
                    编辑
                  </button>
                  <button onClick={() => handleDelete(item.id)} type="button">
                    删除
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="feature-card">
              <strong>暂无乐器</strong>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
