import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function TeacherContactPage() {
  const { data, setData } = useAppContext()
  const [channel, setChannel] = useState('微信收款')
  const [lessonUnitPrice, setLessonUnitPrice] = useState(String(data.lessonUnitPrice || 150))
  const [form, setForm] = useState({
    name: data.organizationContact?.name || '',
    phone: data.organizationContact?.phone || '',
    address: data.organizationContact?.address || ''
  })
  const paymentQrs = data.paymentQrs || []

  function handleSaveContact() {
    const normalizedPrice = Number(lessonUnitPrice)
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      window.alert('请填写有效的课时单价。')
      return
    }
    setData((prev) => ({
      ...prev,
      organizationContact: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      },
      lessonUnitPrice: normalizedPrice
    }))
    window.alert('联系方式已保存')
  }

  function handleUploadQr(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (paymentQrs.length >= 2) {
      window.alert('最多上传两个收款二维码。')
      event.target.value = ''
      return
    }
    const channelName = channel.trim()
    if (!channelName) {
      window.alert('请先填写收款渠道名称。')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setData((prev) => ({
        ...prev,
        paymentQr: String(reader.result || ''),
        paymentQrs: [
          ...(prev.paymentQrs || []),
          {
            id: Date.now(),
            channel: channelName,
            image: String(reader.result || '')
          }
        ]
      }))
      window.alert('收款二维码已上传')
    }
    reader.readAsDataURL(file)
  }

  function handleDeleteQr(id) {
    setData((prev) => ({
      ...prev,
      paymentQrs: (prev.paymentQrs || []).filter((item) => item.id !== id)
    }))
  }

  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">联系机构</span>
            <h2>联系方式管理</h2>
          </div>
        </div>
        <div className="teacher-contact-form">
          <label>
            <span>机构名称</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              type="text"
              value={form.name}
            />
          </label>
          <label>
            <span>联系电话</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              type="text"
              value={form.phone}
            />
          </label>
          <label>
            <span>课时单价（元）</span>
            <input
              onChange={(event) => setLessonUnitPrice(event.target.value)}
              type="number"
              value={lessonUnitPrice}
            />
          </label>
          <label>
            <span>联系地址</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              type="text"
              value={form.address}
            />
          </label>
          <button className="teacher-add-btn" onClick={handleSaveContact} type="button">
            保存联系方式
          </button>
        </div>
        <article className="teacher-contact-qr">
          <h3>收款二维码</h3>
          {(paymentQrs || []).length ? (
            <div className="teacher-qr-grid">
              {paymentQrs.map((item) => (
                <div key={item.id} className="teacher-qr-item">
                  <img alt={item.channel} className="teacher-contact-qr-image" src={item.image} />
                  <strong>{item.channel}</strong>
                  <button onClick={() => handleDeleteQr(item.id)} type="button">
                    删除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>暂未上传收款二维码</p>
          )}
          <label className="teacher-qr-channel">
            <span>收款渠道</span>
            <input
              onChange={(event) => setChannel(event.target.value)}
              placeholder="例如：微信收款/支付宝收款"
              type="text"
              value={channel}
            />
          </label>
          <label className="teacher-qr-upload">
            <input accept="image/*" onChange={handleUploadQr} type="file" />
            上传二维码（最多2个）
          </label>
        </article>
      </section>
    </main>
  )
}
