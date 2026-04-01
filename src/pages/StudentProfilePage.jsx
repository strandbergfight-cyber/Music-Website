import { useState } from 'react'
import { Link } from 'react-router-dom'

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDF3QQlR3yrJewXjJy3Sxz4DQFXtcGR9ean8N6CQSAOmRq2K0vhIyjDyR9TTvCeKy2TFzkFyECGI0gpTttjanwwxBXbLOv0o42feD6eADel0y-E0pTkgKvde6RRMjdGJUpRJ-UzIHCe0casZqEQ4ToJ6R46XuqvYPJpN-cUkjHjLKUeioaQKvbPqj4D-A9K8TLTRERs3dWw7NrligwJjKts4dHLqM3ZFQWViBNyvpahWuD4-2KGRwGhUWBrXCd1xXcGvMiDRhLAQl4H'

function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result || '')
      const image = new Image()
      image.onload = () => {
        const maxSide = 720
        const ratio = Math.min(maxSide / image.width, maxSide / image.height, 1)
        const width = Math.max(Math.round(image.width * ratio), 1)
        const height = Math.max(Math.round(image.height * ratio), 1)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          resolve(raw)
          return
        }
        context.drawImage(image, 0, 0, width, height)
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const compressed = canvas.toDataURL(mime, 0.82)
        resolve(compressed || raw)
      }
      image.onerror = () => resolve(raw)
      image.src = raw
    }
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(file)
  })
}

const profileMenuItems = [
  { key: 'courses', label: '我的课程表', path: '/student/profile/courses', note: '查看已安排课程' },
  { key: 'records', label: '课时消费记录', path: '/student/profile/records', note: '查看每次课时扣减' },
  { key: 'purchase', label: '购买课时', path: '/student/buy-lessons', note: '进入购买入口' },
  { key: 'instrument-shop', label: '乐器购买', path: '/student/instrument-shop', note: '查看乐器商品' },
  { key: 'instruments', label: '我的乐器', path: '/student/instruments', note: '管理乐器信息' },
  { key: 'invite', label: '邀请好友', path: '/student/profile/invite', note: '邀请新学员' },
  { key: 'settings', label: '设置', path: '/student/profile/settings', note: '账户偏好设置' },
  { key: 'contact', label: '联系机构', path: '/student/profile/contact', note: '查看联系方式' }
]

export default function StudentProfilePage({ studentProfile, onUpdateStudentProfile, onLogout }) {
  const avatarSrc = studentProfile.avatar || DEFAULT_AVATAR
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  async function handleUploadAvatar(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    try {
      const result = await compressAvatar(file)
      if (!result) {
        return
      }
      onUpdateStudentProfile({
        avatar: result
      })
    } finally {
      event.target.value = ''
    }
  }

  function handleResetAvatar() {
    onUpdateStudentProfile({
      avatar: ''
    })
  }

  function handleEditProfile() {
    const nextName = window.prompt('请输入新的姓名', studentProfile.name)
    if (nextName === null) {
      return
    }
    const nextPhone = window.prompt('请输入新的手机号', studentProfile.phone)
    if (nextPhone === null) {
      return
    }
    const nextPassword = window.prompt('请输入新的密码', studentProfile.password)
    if (nextPassword === null) {
      return
    }
    const nextAvatar = window.prompt('请输入新的头像 URL（可选）', studentProfile.avatar)
    if (nextAvatar === null) {
      return
    }
    onUpdateStudentProfile({
      name: nextName.trim() || studentProfile.name,
      phone: nextPhone.trim() || studentProfile.phone,
      password: nextPassword.trim() || studentProfile.password,
      avatar: nextAvatar.trim() || studentProfile.avatar
    })
  }

  function handleChangePassword() {
    if (passwordForm.oldPassword !== studentProfile.password) {
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
    onUpdateStudentProfile({
      password: passwordForm.newPassword.trim()
    })
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsPasswordModalOpen(false)
    window.alert('密码修改成功，请使用新密码登录。')
  }

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">我的</span>
            <h2>个人中心</h2>
          </div>
          <div className="student-avatar-block">
            <label className="student-avatar-upload">
              <img alt="学生头像" className="student-avatar" src={avatarSrc} />
              <input accept="image/*" onChange={handleUploadAvatar} type="file" />
            </label>
            <div className="student-avatar-actions">
              <label className="student-avatar-btn">
                更换头像
                <input accept="image/*" onChange={handleUploadAvatar} type="file" />
              </label>
              <button className="student-avatar-btn danger" onClick={handleResetAvatar} type="button">
                恢复默认
              </button>
            </div>
          </div>
        </div>
        <div className="profile-action-row">
          <button className="profile-action-btn" onClick={handleEditProfile} type="button">
            修改个人信息
          </button>
          <button className="profile-action-btn" onClick={() => setIsPasswordModalOpen(true)} type="button">
            修改密码
          </button>
          <button className="profile-action-btn danger" onClick={onLogout} type="button">
            退出登录
          </button>
        </div>
        <div className="profile-menu-list">
          {profileMenuItems.map((item) => (
            <Link key={item.key} className="profile-menu-item" to={item.path}>
              <div>
                <strong>{item.label}</strong>
                <p>{item.note}</p>
              </div>
              <span>›</span>
            </Link>
          ))}
        </div>
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
