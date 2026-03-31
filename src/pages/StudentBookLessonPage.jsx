import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'

const dayOrder = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7
}

function getTodayDayKey() {
  const day = new Date().getDay()
  if (day === 0) {
    return 'sun'
  }
  return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][day - 1]
}

function getMonday(baseDate = new Date()) {
  const date = new Date(baseDate)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export default function StudentBookLessonPage({ slots, onBookSlot, remainingLessons }) {
  const { data, currentUser, userType, authState, addBooking, addCustomBookingRequest } = useAppContext()
  const activeStudent =
    data.students.find((item) => item.id === data.currentStudentId) ||
    (userType === 'student' ? currentUser : null)
  const contextSlots = useMemo(() => {
    if (!data) {
      return []
    }
    return data.availableSlots.map((slot) => {
      const dayIndex = new Date(slot.date).getDay()
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayIndex]
      const normalizedDayKey = dayKey === 'sun' ? 'sun' : dayKey
      const weekOffset = Math.round(
        (new Date(slot.date).setHours(0, 0, 0, 0) - getMonday().getTime()) / (7 * 24 * 60 * 60 * 1000)
      )
      const teacher = data.teachers.find((item) => item.id === slot.teacherId)?.name || '老师'
      return {
        id: slot.id,
        dayKey: normalizedDayKey,
        weekOffset,
        timeRange: `${slot.startTime} - ${slot.endTime}`,
        time: `${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayIndex]} ${slot.startTime} - ${slot.endTime}`,
        teacher,
        course: slot.courseName,
        cost: 1,
        booked: Boolean(slot.isBooked)
      }
    })
  }, [data])
  const derivedSlots = slots || contextSlots
  const derivedRemaining =
    remainingLessons ?? (activeStudent ? activeStudent.remainingLessons || 0 : 0)

  function handleBook(slotId) {
    if (onBookSlot) {
      onBookSlot(slotId)
      return
    }
    if (userType !== 'student' || !currentUser) {
      window.alert('请先以学生身份登录')
      return
    }
    const slot = data.availableSlots.find((item) => item.id === slotId)
    if (!slot || slot.isBooked) {
      window.alert('该时段已被预约')
      return
    }
    addBooking({
      studentId: currentUser.id,
      slotId: slot.id,
      courseName: slot.courseName
    })
    window.alert('预约成功')
  }

  const [filterMode, setFilterMode] = useState('available')
  const [customDate, setCustomDate] = useState('')
  const [customStartTime, setCustomStartTime] = useState('')
  const [customEndTime, setCustomEndTime] = useState('')
  const todayDayKey = getTodayDayKey()
  const filteredSlots = useMemo(
    () => (filterMode === 'available' ? derivedSlots.filter((slot) => !slot.booked) : derivedSlots),
    [filterMode, derivedSlots]
  )
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    const weekDiff = (a.weekOffset ?? 0) - (b.weekOffset ?? 0)
    if (weekDiff !== 0) {
      return weekDiff
    }
    const dayDiff = (dayOrder[a.dayKey] || 99) - (dayOrder[b.dayKey] || 99)
    if (dayDiff !== 0) {
      return dayDiff
    }
    return String(a.timeRange || a.time).localeCompare(String(b.timeRange || b.time), 'zh-CN')
  })
  const groups = [
    {
      key: 'today',
      title: '今日可约',
      items: sortedSlots.filter((slot) => (slot.weekOffset ?? 0) === 0 && slot.dayKey === todayDayKey)
    },
    {
      key: 'thisWeek',
      title: '本周可约',
      items: sortedSlots.filter((slot) => (slot.weekOffset ?? 0) === 0 && slot.dayKey !== todayDayKey)
    },
    {
      key: 'nextWeek',
      title: '下周可约',
      items: sortedSlots.filter((slot) => (slot.weekOffset ?? 0) === 1)
    },
    {
      key: 'more',
      title: '更多时段',
      items: sortedSlots.filter((slot) => (slot.weekOffset ?? 0) !== 0 && (slot.weekOffset ?? 0) !== 1)
    }
  ]

  function handleSubmitCustomBooking(event) {
    event.preventDefault()
    if (!authState?.isLoggedIn || !activeStudent) {
      window.alert('请先登录学生账号。')
      return
    }
    if (!customDate || !customStartTime || !customEndTime) {
      window.alert('请填写完整的日期和时间段。')
      return
    }
    const defaultTeacher = data.teachers[0]
    if (!defaultTeacher) {
      window.alert('暂无可预约老师。')
      return
    }
    addCustomBookingRequest?.({
      studentId: activeStudent.id,
      teacherId: defaultTeacher.id,
      date: customDate,
      startTime: customStartTime,
      endTime: customEndTime,
      courseName: '自定义预约'
    })
    setCustomDate('')
    setCustomStartTime('')
    setCustomEndTime('')
    window.alert('自定义预约请求已提交，等待老师处理。')
  }

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">学生端约课页</span>
            <h2>可预约时段</h2>
          </div>
          <img
            alt="学生头像"
            className="student-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF3QQlR3yrJewXjJy3Sxz4DQFXtcGR9ean8N6CQSAOmRq2K0vhIyjDyR9TTvCeKy2TFzkFyECGI0gpTttjanwwxBXbLOv0o42feD6eADel0y-E0pTkgKvde6RRMjdGJUpRJ-UzIHCe0casZqEQ4ToJ6R46XuqvYPJpN-cUkjHjLKUeioaQKvbPqj4D-A9K8TLTRERs3dWw7NrligwJjKts4dHLqM3ZFQWViBNyvpahWuD4-2KGRwGhUWBrXCd1xXcGvMiDRhLAQl4H"
          />
        </div>
        <p className="booking-tip">当前剩余课时：{derivedRemaining} 节</p>
        {groups.map((group) =>
          group.items.length ? (
            <div key={group.key} className="booking-group">
              <h3>{group.title}</h3>
              <div className="booking-slot-list">
                {group.items.map((slot) => (
                  <button
                    key={slot.id}
                    className={`booking-slot${slot.booked ? ' booked' : ''}`}
                    onClick={() => handleBook(slot.id)}
                    type="button"
                  >
                    <div>
                      <strong>{slot.time}</strong>
                      <p>
                        {slot.teacher}
                        {slot.course ? ` · ${slot.course}` : ''}
                      </p>
                    </div>
                    <div className="slot-right">
                      <span>{slot.cost} 课时</span>
                      <span>{slot.booked ? '已预约' : '点击预约'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null
        )}
        <div className="booking-filter-bar">
          <button
            className={`booking-filter-btn${filterMode === 'available' ? ' active' : ''}`}
            onClick={() => setFilterMode('available')}
            type="button"
          >
            只看可预约
          </button>
          <button
            className={`booking-filter-btn${filterMode === 'all' ? ' active' : ''}`}
            onClick={() => setFilterMode('all')}
            type="button"
          >
            包含已预约
          </button>
        </div>
        <article className="feature-card custom-booking-card">
          <strong>自定义预约</strong>
          <form className="custom-booking-form" onSubmit={handleSubmitCustomBooking}>
            <label>
              <span>日期</span>
              <input onChange={(event) => setCustomDate(event.target.value)} type="date" value={customDate} />
            </label>
            <div className="custom-booking-time">
              <label>
                <span>开始时间</span>
                <input
                  onChange={(event) => setCustomStartTime(event.target.value)}
                  type="time"
                  value={customStartTime}
                />
              </label>
              <label>
                <span>结束时间</span>
                <input onChange={(event) => setCustomEndTime(event.target.value)} type="time" value={customEndTime} />
              </label>
            </div>
            <button className="feature-card-btn" type="submit">
              提交自定义预约
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}
