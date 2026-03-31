import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const dayTimeSlots = ['09:00 - 10:00', '11:00 - 12:00', '14:00 - 15:00', '16:00 - 17:00', '16:30 - 17:30']

function getMonday(baseDate = new Date()) {
  const date = new Date(baseDate)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatLabelDate(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function parseTimeRange(timeRange) {
  const [startTime, endTime] = String(timeRange).split('-').map((item) => item.trim())
  return { startTime, endTime }
}

function toMinutes(timeText) {
  const [h, m] = String(timeText).split(':').map((item) => Number(item))
  return h * 60 + m
}

export default function TeacherWeeklySchedulePage({
  weekLabel,
  weekDays,
  scheduleByDay,
  onPrevWeek,
  onNextWeek,
  onAddLesson,
  onDeleteLesson
}) {
  const { data, currentUser, userType, addAvailableSlot, deleteAvailableSlot, addBooking, setData } = useAppContext()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [courseName, setCourseName] = useState('')
  const [studentName, setStudentName] = useState('')
  const [lessonDate, setLessonDate] = useState('')
  const [lessonStartTime, setLessonStartTime] = useState('')
  const [lessonEndTime, setLessonEndTime] = useState('')
  const [localWeekOffset, setLocalWeekOffset] = useState(0)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleStartTime, setRescheduleStartTime] = useState('')
  const [rescheduleEndTime, setRescheduleEndTime] = useState('')

  const contextWeekDays = (() => {
    const monday = getMonday()
    monday.setDate(monday.getDate() + localWeekOffset * 7)
    return dayKeys.map((key, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return { key, name: dayNames[index], date: formatLabelDate(date), dateISO: formatISODate(date) }
    })
  })()
  const contextWeekLabel = `${contextWeekDays[0]?.date} - ${contextWeekDays[6]?.date}`
  const contextScheduleByDay = (() => {
    if (userType !== 'teacher' || !currentUser) {
      return Object.fromEntries(dayKeys.map((dayKey) => [dayKey, dayTimeSlots.map((time) => ({ id: `${dayKey}-${time}`, time, empty: true, course: '', student: '' }))]))
    }
    return Object.fromEntries(
      contextWeekDays.map((day) => [
        day.key,
        (() => {
          const teacherSlotsOnDay = data.availableSlots
            .filter((item) => item.teacherId === currentUser.id && item.date === day.dateISO)
            .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
          const slotMap = new Map(
            teacherSlotsOnDay.map((item) => [`${item.startTime}-${item.endTime}`, item])
          )
          const rows = dayTimeSlots.map((timeRange) => {
            const { startTime, endTime } = parseTimeRange(timeRange)
            const slot = slotMap.get(`${startTime}-${endTime}`)
            if (!slot) {
              return { id: `${day.key}-${timeRange}`, time: timeRange, empty: true, course: '', student: '' }
            }
            const booking = data.bookings.find((item) => item.slotId === slot.id)
            const student = booking ? data.students.find((item) => item.id === booking.studentId)?.name || '' : '可预约'
            return { id: slot.id, time: timeRange, empty: false, course: slot.courseName, student, available: !booking }
          })
          const extraRows = teacherSlotsOnDay
            .filter((item) => !dayTimeSlots.some((timeRange) => {
              const { startTime, endTime } = parseTimeRange(timeRange)
              return startTime === item.startTime && endTime === item.endTime
            }))
            .map((slot) => {
              const booking = data.bookings.find((item) => item.slotId === slot.id)
              const student = booking ? data.students.find((item) => item.id === booking.studentId)?.name || '' : '可预约'
              return {
                id: slot.id,
                time: `${slot.startTime} - ${slot.endTime}`,
                empty: false,
                course: slot.courseName,
                student,
                available: !booking
              }
            })
          return [...rows, ...extraRows].sort((a, b) => {
            const startA = parseTimeRange(a.time).startTime
            const startB = parseTimeRange(b.time).startTime
            return toMinutes(startA) - toMinutes(startB)
          })
        })()
      ])
    )
  })()
  const usingContext = !weekDays || !scheduleByDay

  function openAddModal(dayKey, time, course = '', student = '', slotId = null, dateISO = '') {
    const { startTime, endTime } = parseTimeRange(time)
    setSelectedSlot({ dayKey, time, hasLesson: Boolean(course), slotId })
    setCourseName(course)
    setStudentName(student)
    setLessonDate(dateISO || contextWeekDays.find((item) => item.key === dayKey)?.dateISO || '')
    setLessonStartTime(startTime || '')
    setLessonEndTime(endTime || '')
    setIsAddModalOpen(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!selectedSlot) {
      return
    }
    const normalizedCourse = courseName.trim()
    const normalizedStudent = studentName.trim()
    if (!normalizedCourse) {
      window.alert('请填写课程名称。')
      return
    }
    if (!lessonDate || !lessonStartTime || !lessonEndTime) {
      window.alert('请填写完整的日期和时间。')
      return
    }
    if (lessonStartTime >= lessonEndTime) {
      window.alert('结束时间必须晚于开始时间。')
      return
    }
    const payload = {
      dayKey: selectedSlot.dayKey,
      time: `${lessonStartTime} - ${lessonEndTime}`,
      course: normalizedCourse,
      student: normalizedStudent
    }
    if (onAddLesson) {
      onAddLesson(payload)
    } else if (userType === 'teacher' && currentUser) {
      const slotId = selectedSlot?.slotId || `${currentUser.id}-${lessonDate}-${lessonStartTime}-${lessonEndTime}`
      const booking = selectedSlot?.slotId ? data.bookings.find((item) => item.slotId === selectedSlot.slotId) : null
      if (selectedSlot?.slotId && selectedSlot.slotId !== slotId) {
        deleteAvailableSlot?.(selectedSlot.slotId)
      }
      deleteAvailableSlot?.(slotId)
      addAvailableSlot?.({
        id: slotId,
        date: lessonDate,
        startTime: lessonStartTime,
        endTime: lessonEndTime,
        courseName: payload.course,
        teacherId: currentUser.id,
        isBooked: Boolean(payload.student || booking)
      })
      if (booking && selectedSlot.slotId !== slotId) {
        setData?.((prev) => ({
          ...prev,
          bookings: prev.bookings.map((item) => (item.id === booking.id ? { ...item, slotId } : item))
        }))
      }
      if (payload.student && !booking) {
        const matchedStudent = data.students.find((item) => item.name === payload.student)
        if (matchedStudent) {
          addBooking?.({
            studentId: matchedStudent.id,
            slotId,
            courseName: payload.course
          })
          setData?.((prev) => ({
            ...prev,
            students: prev.students.map((item) =>
              item.id === matchedStudent.id ? { ...item, remainingLessons: Math.max(item.remainingLessons - 1, 0) } : item
            )
          }))
        }
      } else if (booking) {
        addAvailableSlot?.({
          id: slotId,
          date: lessonDate,
          startTime: lessonStartTime,
          endTime: lessonEndTime,
          courseName: payload.course,
          teacherId: currentUser.id,
          isBooked: true
        })
      }
    }
    setIsAddModalOpen(false)
  }

  function handleDeleteLesson() {
    if (!selectedSlot) {
      return
    }
    const confirmed = window.confirm(`确认删除 ${selectedSlot.time} 的课程吗？`)
    if (!confirmed) {
      return
    }
    if (onDeleteLesson) {
      onDeleteLesson({
        dayKey: selectedSlot.dayKey,
        time: selectedSlot.time
      })
    } else if (userType === 'teacher' && currentUser) {
      const day = contextWeekDays.find((item) => item.key === selectedSlot.dayKey)
      if (day) {
        const [startTime, endTime] = selectedSlot.time.split('-').map((item) => item.trim())
        const slotId = selectedSlot.slotId || `${currentUser.id}-${day.dateISO}-${startTime}-${endTime}`
        const booking = data.bookings.find((item) => item.slotId === slotId)
        deleteAvailableSlot?.(slotId)
        if (booking) {
          setData?.((prev) => ({
            ...prev,
            bookings: prev.bookings.filter((item) => item.id !== booking.id),
            students: prev.students.map((item) =>
              item.id === booking.studentId ? { ...item, remainingLessons: item.remainingLessons + 1 } : item
            )
          }))
        }
      }
    }
    setIsAddModalOpen(false)
  }

  function handleOpenRescheduleModal() {
    if (!selectedSlot?.slotId) {
      window.alert('当前课程暂不支持修改时间。')
      return
    }
    const slot = data.availableSlots.find((item) => item.id === selectedSlot.slotId)
    if (!slot) {
      window.alert('未找到课程数据，请刷新后重试。')
      return
    }
    setRescheduleDate(slot.date)
    setRescheduleStartTime(slot.startTime)
    setRescheduleEndTime(slot.endTime)
    setIsRescheduleOpen(true)
  }

  function handleSaveReschedule(event) {
    event.preventDefault()
    if (!selectedSlot?.slotId) {
      return
    }
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      window.alert('请填写完整的日期和时间。')
      return
    }
    if (rescheduleStartTime >= rescheduleEndTime) {
      window.alert('结束时间必须晚于开始时间。')
      return
    }
    const currentSlot = data.availableSlots.find((item) => item.id === selectedSlot.slotId)
    if (!currentSlot) {
      window.alert('课程不存在，请刷新后重试。')
      return
    }
    const hasConflict = data.availableSlots.some(
      (item) =>
        item.id !== currentSlot.id &&
        item.teacherId === currentSlot.teacherId &&
        item.date === rescheduleDate &&
        item.startTime === rescheduleStartTime &&
        item.endTime === rescheduleEndTime
    )
    if (hasConflict) {
      window.alert('该时间段已有课程，请更换时间。')
      return
    }
    setData?.((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.map((item) =>
        item.id === currentSlot.id
          ? { ...item, date: rescheduleDate, startTime: rescheduleStartTime, endTime: rescheduleEndTime }
          : item
      )
    }))
    setIsRescheduleOpen(false)
    setIsAddModalOpen(false)
    window.alert('课程时间已更新')
  }

  return (
    <main className="page-shell">
      <section className="teacher-panel">
        <div className="teacher-panel-header">
          <div className="teacher-header-main">
            <span className="teacher-tag">周课表</span>
            <h2>授课安排</h2>
          </div>
          <img
            alt="教师头像"
            className="teacher-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV2htHRsfqWSlEwotxDo4_k7RISuTx_es-OBfqF-555j5YycOelbpPulxHuCgnHWd0PHnGBDKy-lTouBgx-LkfmMNt67-CHocRNnqx81_jwU_w0pVoaoatblRw8T48NqdtiWPiKHm8Rxt14_DFEQ_Uyk7LmYvhE1VXAMDWvhtppVmexDolzrEbnm2ClVekf_G68SJeHB1_uesbZ2rzJvi8foBjeschbN2b1n1_AdZ_QS_TcD0IZ6zRAj_FGMku6byPpCNNKMPSPHva"
          />
        </div>
        <div className="teacher-week-head">
          <button onClick={onPrevWeek || (() => setLocalWeekOffset((prev) => prev - 1))} type="button">
            上一周
          </button>
          <strong>{usingContext ? contextWeekLabel : weekLabel}</strong>
          <button onClick={onNextWeek || (() => setLocalWeekOffset((prev) => prev + 1))} type="button">
            下一周
          </button>
        </div>
        <div className="teacher-week-grid">
          {(usingContext ? contextWeekDays : weekDays).map((day) => (
            <article key={day.key} className="teacher-day-column">
              <header>
                <strong>{day.name}</strong>
                <span>{day.date}</span>
              </header>
              <div className="teacher-day-slots">
                {(usingContext ? contextScheduleByDay[day.key] : scheduleByDay[day.key]).map((slot) => (
                  slot.empty ? (
                    <button
                      key={slot.id}
                      className="teacher-slot-card teacher-slot-empty"
                      onClick={() => openAddModal(day.key, slot.time, '', '', null, day.dateISO)}
                      type="button"
                    >
                      <strong>{slot.time}</strong>
                      <p className="teacher-slot-add-label">点击添加课程</p>
                    </button>
                  ) : (
                    <button
                      key={slot.id}
                      className="teacher-slot-card teacher-slot-editable"
                      onClick={() =>
                        openAddModal(day.key, slot.time, slot.course, slot.available ? '' : slot.student, slot.id, day.dateISO)
                      }
                      type="button"
                    >
                      <strong>{slot.time}</strong>
                      <p>{slot.course}</p>
                      <span>{slot.student}</span>
                    </button>
                  )
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      {isAddModalOpen && (
        <div className="teacher-modal-mask">
          <form className="teacher-modal-card" onSubmit={handleSubmit}>
            <h3>{selectedSlot?.hasLesson ? '编辑课程' : '添加课程'}</h3>
            <label>
              <span>日期</span>
              <input onChange={(event) => setLessonDate(event.target.value)} type="date" value={lessonDate} />
            </label>
            <div className="teacher-modal-time-row">
              <label>
                <span>开始时间</span>
                <input
                  onChange={(event) => setLessonStartTime(event.target.value)}
                  type="time"
                  value={lessonStartTime}
                />
              </label>
              <label>
                <span>结束时间</span>
                <input
                  onChange={(event) => setLessonEndTime(event.target.value)}
                  type="time"
                  value={lessonEndTime}
                />
              </label>
            </div>
            <label>
              <span>时段预览</span>
              <input disabled type="text" value={lessonStartTime && lessonEndTime ? `${lessonStartTime} - ${lessonEndTime}` : ''} />
            </label>
            <label>
              <span>课程名称</span>
              <input
                onChange={(event) => setCourseName(event.target.value)}
                placeholder="例如：钢琴课"
                type="text"
                value={courseName}
              />
            </label>
            <label>
              <span>学员姓名（可选）</span>
              <input
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="留空表示可预约时段"
                type="text"
                value={studentName}
              />
            </label>
            <div className="teacher-modal-actions">
              {selectedSlot?.hasLesson && (
                <button className="teacher-modal-secondary" onClick={handleOpenRescheduleModal} type="button">
                  修改时间
                </button>
              )}
              {selectedSlot?.hasLesson && (
                <button className="teacher-modal-danger" onClick={handleDeleteLesson} type="button">
                  删除课程
                </button>
              )}
              <button
                className="teacher-modal-cancel"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
              >
                取消
              </button>
              <button className="teacher-modal-confirm" type="submit">
                保存课程
              </button>
            </div>
          </form>
        </div>
      )}
      {isRescheduleOpen && (
        <div className="teacher-modal-mask">
          <form className="teacher-modal-card" onSubmit={handleSaveReschedule}>
            <h3>修改课时时间</h3>
            <label>
              <span>日期</span>
              <input onChange={(event) => setRescheduleDate(event.target.value)} type="date" value={rescheduleDate} />
            </label>
            <label>
              <span>开始时间</span>
              <input
                onChange={(event) => setRescheduleStartTime(event.target.value)}
                type="time"
                value={rescheduleStartTime}
              />
            </label>
            <label>
              <span>结束时间</span>
              <input
                onChange={(event) => setRescheduleEndTime(event.target.value)}
                type="time"
                value={rescheduleEndTime}
              />
            </label>
            <div className="teacher-modal-actions">
              <button className="teacher-modal-cancel" onClick={() => setIsRescheduleOpen(false)} type="button">
                取消
              </button>
              <button className="teacher-modal-confirm" type="submit">
                保存时间
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
