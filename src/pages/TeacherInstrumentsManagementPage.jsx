import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

function resolveImage(item) {
  return item.image || item.imageUrl || item.imageData || ''
}

function resolveImages(item) {
  if (Array.isArray(item.images) && item.images.length) {
    return item.images.filter(Boolean).slice(0, 4)
  }
  const single = resolveImage(item)
  return single ? [single] : []
}

export default function TeacherInstrumentsManagementPage() {
  const { data, setData } = useAppContext()
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    images: []
  })
  const [editingId, setEditingId] = useState(null)

  function handleUploadImage(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if ((form.images || []).length >= 4) {
      window.alert('最多上传4张图片。')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), String(reader.result || '')].slice(0, 4)
      }))
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  function handleDeleteImage(index) {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const name = form.name.trim()
    const price = Number(form.price)
    if (!name || !Number.isFinite(price) || price <= 0) {
      window.alert('请填写有效的乐器名称和价格。')
      return
    }
    const payload = {
      id: editingId || Date.now(),
      name,
      price,
      description: form.description.trim(),
      image: form.images?.[0] || '',
      imageData: form.images?.[0] || '',
      images: (form.images || []).slice(0, 4)
    }
    setData((prev) => ({
      ...prev,
      instrumentProducts: editingId
        ? (prev.instrumentProducts || []).map((item) => (item.id === editingId ? payload : item))
        : [...(prev.instrumentProducts || []), payload]
    }))
    setEditingId(null)
    setForm({ name: '', price: '', description: '', images: [] })
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      price: String(item.price || ''),
      description: item.description || '',
      images: resolveImages(item)
    })
  }

  function handleDelete(id) {
    setData((prev) => ({
      ...prev,
      instrumentProducts: (prev.instrumentProducts || []).filter((item) => item.id !== id)
    }))
  }

  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">乐器管理</span>
            <h2>上架乐器商品</h2>
          </div>
        </div>
        <form className="teacher-contact-form" onSubmit={handleSubmit}>
          <label>
            <span>乐器名称</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              type="text"
              value={form.name}
            />
          </label>
          <label>
            <span>乐器价格（元）</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              type="number"
              value={form.price}
            />
          </label>
          <label>
            <span>乐器描述（可选）</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              type="text"
              value={form.description}
            />
          </label>
          <label className="teacher-qr-upload">
            <input accept="image/*" onChange={handleUploadImage} type="file" />
            添加图片（最多4张）
          </label>
          {form.images?.length ? (
            <div className="instrument-upload-preview">
              {form.images.map((img, index) => (
                <div key={`${img.slice(0, 16)}-${index}`} className="instrument-upload-item">
                  <img alt={`图片${index + 1}`} className="instrument-upload-thumb" src={img} />
                  <button onClick={() => handleDeleteImage(index)} type="button">
                    删除
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <button className="teacher-add-btn" type="submit">
            {editingId ? '保存修改' : '添加商品'}
          </button>
        </form>
        <div className="teacher-manager-grid">
          {(data.instrumentProducts || []).length ? (
            data.instrumentProducts.map((item) => (
              <article key={item.id} className="teacher-manager-card instrument-product-card">
                <div className="teacher-manager-main">
                  {resolveImages(item).length ? (
                    <div className="instrument-product-gallery">
                      {resolveImages(item).map((img, index) => (
                        <img key={`${item.id}-${index}`} alt={`${item.name}-${index + 1}`} className="instrument-product-image" src={img} />
                      ))}
                    </div>
                  ) : null}
                  <strong>{item.name}</strong>
                  <p>¥{item.price}</p>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
                <div className="teacher-manager-actions">
                  <button onClick={() => handleEdit(item)} type="button">
                    编辑
                  </button>
                  <button onClick={() => handleDelete(item.id)} type="button">
                    删除
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="teacher-manager-card">
              <div className="teacher-manager-main">
                <strong>暂无乐器商品</strong>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
