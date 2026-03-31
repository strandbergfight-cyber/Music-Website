import { Link } from 'react-router-dom'

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

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">我的</span>
            <h2>个人中心</h2>
          </div>
          <img
            alt="学生头像"
            className="student-avatar"
            src={studentProfile.avatar}
          />
        </div>
        <div className="profile-action-row">
          <button className="profile-action-btn" onClick={handleEditProfile} type="button">
            修改个人信息
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
    </main>
  )
}
