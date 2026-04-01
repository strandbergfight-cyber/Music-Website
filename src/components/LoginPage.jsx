import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').replace(/-/g, '')
}

async function hashPassword(rawPassword) {
  const value = String(rawPassword || '')
  if (!value) {
    return ''
  }
  const encoder = new TextEncoder()
  const buffer = encoder.encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('')
}

export default function LoginPage({ teacherAccount, studentAccounts, onLoginSuccess }) {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const defaultStudentAccount = studentAccounts[0]
  const [phone, setPhone] = useState(defaultStudentAccount?.phone || '')
  const [password, setPassword] = useState(defaultStudentAccount?.password || '')

  function switchRole(nextRole) {
    setRole(nextRole)
    if (nextRole === 'teacher') {
      setPhone(teacherAccount.phone)
      setPassword(teacherAccount.password)
      return
    }
    setPhone(defaultStudentAccount?.phone || '')
    setPassword(defaultStudentAccount?.password || '')
  }

  async function handleLogin(event) {
    event.preventDefault()
    const normalizedPhone = normalizePhone(phone)
    const normalizedPassword = String(password || '').trim()
    const normalizedPasswordHash = await hashPassword(normalizedPassword)
    let targetAccount = null
    if (role === 'teacher') {
      const teacherPlainPassword = String(teacherAccount.password || '').trim()
      const teacherHashPassword = String(teacherAccount.passwordHash || '')
      if (
        normalizedPhone === normalizePhone(teacherAccount.phone) &&
        (normalizedPassword === teacherPlainPassword || normalizedPasswordHash === teacherHashPassword)
      ) {
        targetAccount = teacherAccount
      }
    } else {
      targetAccount = studentAccounts.find(
        (account) =>
          account.enabled !== false &&
          (normalizePhone(account.phone) === normalizedPhone ||
            normalizePhone(account.username) === normalizedPhone) &&
          (String(account.password || '').trim() === normalizedPassword ||
            String(account.passwordHash || '') === normalizedPasswordHash ||
            (String(account.password || '').trim() === '' && normalizedPassword === '123456'))
      )
    }
    if (!targetAccount) {
      window.alert('手机号或密码错误。')
      return
    }
    onLoginSuccess?.({
      role,
      account: targetAccount
    })
    window.alert('登录成功')
    if (role === 'teacher') {
      navigate('/teacher')
      return
    }
    navigate('/student/home')
  }

  return (
    <main className="login-page-wrap">
      <section className="login-page-card">
        <div className="login-brand">
          <h1>ZiyangMusicStudio</h1>
          <p>专业音乐学习平台</p>
        </div>

        <div className="login-segment">
          <button
            className={`login-segment-btn${role === 'student' ? ' active' : ''}`}
            onClick={() => switchRole('student')}
            type="button"
          >
            学生登录
          </button>
          <button
            className={`login-segment-btn${role === 'teacher' ? ' active' : ''}`}
            onClick={() => switchRole('teacher')}
            type="button"
          >
            教师登录
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label>
            <span>手机号</span>
            <input
              onChange={(event) => setPhone(event.target.value)}
              placeholder="请输入手机号"
              type="tel"
              value={phone}
            />
          </label>
          <label>
            <span>密码</span>
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              type="password"
              value={password}
            />
          </label>
          <button className="login-submit-btn" type="submit">
            登录
          </button>
        </form>
      </section>
    </main>
  )
}
