import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function TeacherContactPage() {
  const { data, setData, currentUser } = useAppContext()
  const [lessonUnitPrice, setLessonUnitPrice] = useState(String(data.lessonUnitPrice || 150))
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [form, setForm] = useState({
    name: data.organizationContact?.name || '',
    phone: data.organizationContact?.phone || '',
    address: data.organizationContact?.address || ''
  })
  const paymentQrs = data.paymentQrs || []
  const qrChannels = ['微信收款', '支付宝收款']

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

  function handleUploadQr(channelName, event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setData((prev) => ({
        ...prev,
        paymentQr: String(reader.result || ''),
        paymentQrs: [
          ...(prev.paymentQrs || []).filter((item) => item.channel !== channelName),
          { id: Date.now(), channel: channelName, image: String(reader.result || '') }
        ]
      }))
      window.alert('收款二维码已上传')
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  function handleDeleteQr(id) {
    setData((prev) => ({
      ...prev,
      paymentQrs: (prev.paymentQrs || []).filter((item) => item.id !== id)
    }))
  }

  function handleChangePassword() {
    if (!currentUser) {
      return
    }
    if (passwordForm.oldPassword !== currentUser.password) {
      window.alert('原密码错误。')
      return
    }
    if (!passwordForm.newPassword.trim()) {
      window.alert('新密码不能为空。')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      window.alert('两次输入的新密码不一致。')
      return
    }
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.map((item) =>
        item.id === currentUser.id ? { ...item, password: passwordForm.newPassword.trim() } : item
      )
    }))
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsPasswordModalOpen(false)
    window.alert('密码修改成功。')
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
          <p>为每个渠道单独上传收款二维码</p>
          <div className="teacher-qr-channel-grid">
            {qrChannels.map((channelName) => {
              const item = paymentQrs.find((qr) => qr.channel === channelName)
              return (
                <div key={channelName} className="teacher-qr-channel-card">
                  <strong className="teacher-qr-channel-title">{channelName}</strong>
                  {item?.image ? (
                    <img alt={channelName} className="teacher-contact-qr-image" src={item.image} />
                  ) : (
                    <div className="teacher-qr-empty">暂未上传</div>
                  )}
                  <div className="teacher-qr-actions">
                    <label className="teacher-qr-upload">
                      <input
                        accept="image/*"
                        onChange={(event) => handleUploadQr(channelName, event)}
                        type="file"
                      />
                      上传/更换
                    </label>
                    {item ? (
                      <button className="teacher-qr-delete" onClick={() => handleDeleteQr(item.id)} type="button">
                        删除
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </article>
        <article className="teacher-contact-qr">
          <h3>修改密码</h3>
          <button className="teacher-add-btn" onClick={() => setIsPasswordModalOpen(true)} type="button">
            打开修改密码表单
          </button>
        </article>
      </section>
      {isPasswordModalOpen && (
        <div className="teacher-modal-mask">
          <form
            className="teacher-modal-card"
            onSubmit={(event) => {
              event.preventDefault()
              handleChangePassword()
            }}
          >
            <h3>修改密码</h3>
            <label>
              <span>原密码</span>
              <input
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
                type="password"
                value={passwordForm.oldPassword}
              />
            </label>
            <label>
              <span>新密码</span>
              <input
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                type="password"
                value={passwordForm.newPassword}
              />
            </label>
            <label>
              <span>确认新密码</span>
              <input
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                type="password"
                value={passwordForm.confirmPassword}
              />
            </label>
            <div className="teacher-modal-actions">
              <button className="teacher-modal-cancel" onClick={() => setIsPasswordModalOpen(false)} type="button">
                取消
              </button>
              <button className="teacher-modal-confirm" type="submit">
                保存新密码
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
