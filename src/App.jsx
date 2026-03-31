import { useEffect, useMemo } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import TopNavigation from './components/TopNavigation'
import BottomNavigation from './components/BottomNavigation'
import PageFrame from './components/PageFrame'
import LoginPage from './components/LoginPage'
import StudentHomePage from './pages/StudentHomePage'
import StudentBookLessonPage from './pages/StudentBookLessonPage'
import StudentProfilePage from './pages/StudentProfilePage'
import StudentProfileFeaturePage from './pages/StudentProfileFeaturePage'
import StudentBuyLessonsPage from './pages/StudentBuyLessonsPage'
import StudentInstrumentsPage from './pages/StudentInstrumentsPage'
import StudentInstrumentShopPage from './pages/StudentInstrumentShopPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import TeacherManagementPage from './pages/TeacherManagementPage'
import TeacherStudentManagementPage from './pages/TeacherStudentManagementPage'
import TeacherWeeklySchedulePage from './pages/TeacherWeeklySchedulePage'
import TeacherContactPage from './pages/TeacherContactPage'
import TeacherBookingRequestsPage from './pages/TeacherBookingRequestsPage'
import TeacherInstrumentsManagementPage from './pages/TeacherInstrumentsManagementPage'
import { AppProvider, useAppContext } from './context/AppContext'
import { pageRoutes } from './routes'

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const dayTimeSlots = ['09:00 - 10:00', '11:00 - 12:00', '14:00 - 15:00', '16:00 - 17:00', '16:30 - 17:30']
const dayKeyToName = { mon: '周一', tue: '周二', wed: '周三', thu: '周四', fri: '周五', sat: '周六', sun: '周日' }
const dayNameToKey = { 周一: 'mon', 周二: 'tue', 周三: 'wed', 周四: 'thu', 周五: 'fri', 周六: 'sat', 周日: 'sun' }

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').replace(/-/g, '')
}

function getMonday(baseDate = new Date()) {
  const date = new Date(baseDate)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateText(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildWeekDays(weekOffset) {
  const monday = getMonday(new Date())
  monday.setDate(monday.getDate() + weekOffset * 7)
  return dayKeys.map((key, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return { key, dateISO: formatISODate(date), name: dayNames[index], date: formatDateText(date) }
  })
}

function splitTimeRange(timeRange) {
  const [startTime, endTime] = String(timeRange).split('-').map((item) => item.trim())
  return { startTime, endTime }
}

function AppShell() {
  const location = useLocation()
  const { sharedStore, setSharedStore, authState, setAuthState, studentProfile, setStudentProfile, instrumentList } =
    useAppContext()

  const students = sharedStore.students || []
  const teachers = sharedStore.teachers || []
  const availableSlots = sharedStore.availableSlots || []
  const bookings = sharedStore.bookings || []
  const lessonRecords = sharedStore.lessonRecords || []
  const syncLogs = sharedStore.syncLogs || []
  const currentStudentId = sharedStore.currentStudentId
  const currentTeacherId = sharedStore.currentTeacherId
  const teacherWeekOffset = sharedStore.teacherWeekOffset || 0

  const currentStudent = students.find((student) => student.id === currentStudentId) || students[0]
  const currentTeacher = teachers.find((teacher) => teacher.id === currentTeacherId) || teachers[0]
  const isSuperAdmin = currentTeacher?.role === '超级管理员'

  const isLoginRoute = location.pathname === '/'
  const isStudentRoute = location.pathname.startsWith('/student')
  const isTeacherRoute = location.pathname.startsWith('/teacher')
  const resolvedRole = useMemo(() => {
    if (!authState.isLoggedIn) {
      return authState.role
    }
    if (isStudentRoute) {
      return 'student'
    }
    if (isTeacherRoute) {
      return 'teacher'
    }
    return authState.role
  }, [authState.isLoggedIn, authState.role, isStudentRoute, isTeacherRoute])
  const containerClassName = `app-container${
    isTeacherRoute ? ' teacher-layout' : isStudentRoute ? ' student-layout' : ' login-layout'
  }`

  const studentRoutes = pageRoutes.filter((route) => route.role === '学生端' && route.showInNav)
  const teacherRoutes = pageRoutes.filter(
    (route) => route.role === '教师端' && (!route.requiresSuperAdmin || isSuperAdmin)
  )

  useEffect(() => {
    if (!authState.isLoggedIn) {
      return
    }
    if (resolvedRole !== authState.role) {
      setAuthState((prev) => ({ ...prev, role: resolvedRole }))
    }
  }, [authState.isLoggedIn, authState.role, resolvedRole, setAuthState])

  const remainingLessons = currentStudent?.remainingLessons || 0
  const totalLessons = currentStudent?.totalLessons || currentStudent?.remainingLessons || 0
  const lessonStats = {
    totalLessons,
    usedLessons: Math.max(totalLessons - remainingLessons, 0)
  }

  const teacherMap = new Map(teachers.map((teacher) => [teacher.id, teacher.name]))
  const studentMap = new Map(students.map((student) => [student.id, student]))

  const bookSlots = useMemo(
    () =>
      availableSlots.map((slot) => {
        const booking = bookings.find((item) => item.slotId === slot.id)
        const dayKey = dayNameToKey[new Date(slot.date).toLocaleDateString('zh-CN', { weekday: 'long' }).replace('星期', '周')] || dayKeys[new Date(slot.date).getDay() === 0 ? 6 : new Date(slot.date).getDay() - 1]
        const weekOffset = Math.round(
          (new Date(slot.date).setHours(0, 0, 0, 0) - getMonday().getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
        return {
          id: slot.id,
          dayKey,
          weekOffset,
          timeRange: `${slot.startTime} - ${slot.endTime}`,
          time: `${dayKeyToName[dayKey]} ${slot.startTime} - ${slot.endTime}`,
          teacher: teacherMap.get(slot.teacherId) || '',
          course: slot.courseName,
          cost: 1,
          booked: Boolean(booking)
        }
      }),
    [availableSlots, bookings, teacherMap]
  )

  const studentCourseSlots = useMemo(() => {
    const currentStudentBookings = bookings.filter((booking) => booking.studentId === currentStudent?.id)
    return currentStudentBookings
      .map((booking) => {
        const slot = availableSlots.find((item) => item.id === booking.slotId)
        if (!slot) {
          return null
        }
        const dayKey = dayKeys[new Date(slot.date).getDay() === 0 ? 6 : new Date(slot.date).getDay() - 1]
        const weekOffset = Math.round(
          (new Date(slot.date).setHours(0, 0, 0, 0) - getMonday().getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
        return {
          id: slot.id,
          dayKey,
          weekOffset,
          timeRange: `${slot.startTime} - ${slot.endTime}`,
          time: `${dayKeyToName[dayKey]} ${slot.startTime} - ${slot.endTime}`,
          teacher: teacherMap.get(slot.teacherId) || '',
          course: slot.courseName,
          cost: 1,
          booked: true
        }
      })
      .filter(Boolean)
  }, [bookings, availableSlots, currentStudent?.id, teacherMap])

  const teacherWeekDays = useMemo(() => buildWeekDays(teacherWeekOffset), [teacherWeekOffset])
  const scheduleByDay = useMemo(() => {
    const result = {}
    teacherWeekDays.forEach((day) => {
      result[day.key] = dayTimeSlots.map((timeRange) => {
        const { startTime, endTime } = splitTimeRange(timeRange)
        const slot = availableSlots.find(
          (item) =>
            item.teacherId === currentTeacher?.id &&
            item.date === day.dateISO &&
            item.startTime === startTime &&
            item.endTime === endTime
        )
        if (!slot) {
          return { id: `${day.key}-${timeRange}`, time: timeRange, course: '', student: '', empty: true }
        }
        const booking = bookings.find((item) => item.slotId === slot.id)
        const bookedStudentName = booking ? studentMap.get(booking.studentId)?.name || '' : '可预约'
        return {
          id: slot.id,
          time: `${slot.startTime} - ${slot.endTime}`,
          course: slot.courseName,
          student: bookedStudentName,
          available: !booking,
          empty: false
        }
      })
    })
    return result
  }, [teacherWeekDays, availableSlots, currentTeacher?.id, bookings, studentMap])

  const todayDayKey = dayKeys[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const todayDate = buildWeekDays(0).find((item) => item.key === todayDayKey)?.dateISO
  const todayLessonCount = bookings.filter((booking) => {
    const slot = availableSlots.find((item) => item.id === booking.slotId)
    return slot?.teacherId === currentTeacher?.id && slot?.date === todayDate
  }).length
  const totalStudentCount = students.length
  const todayLessons = bookings
    .map((booking) => {
      const slot = availableSlots.find((item) => item.id === booking.slotId)
      if (!slot || slot.teacherId !== currentTeacher?.id || slot.date !== todayDate) {
        return null
      }
      return {
        id: booking.id,
        time: `${slot.startTime} - ${slot.endTime}`,
        course: slot.courseName,
        student: studentMap.get(booking.studentId)?.name || ''
      }
    })
    .filter(Boolean)

  function appendSyncLog(message) {
    setSharedStore((prev) => ({
      ...prev,
      syncLogs: [
        { id: `sync-${Date.now()}`, message, time: new Date().toLocaleString('zh-CN') },
        ...(prev.syncLogs || [])
      ]
    }))
  }

  function appendLessonRecord(record) {
    setSharedStore((prev) => ({
      ...prev,
      lessonRecords: [
        { id: `record-${Date.now()}`, time: new Date().toLocaleString('zh-CN'), ...record },
        ...(prev.lessonRecords || [])
      ]
    }))
  }

  function handleBookSlot(slotId) {
    const slot = availableSlots.find((item) => item.id === slotId)
    if (!slot || slot.isBooked || !currentStudent) {
      window.alert('该时段已被预约')
      return
    }
    if (currentStudent.remainingLessons <= 0) {
      window.alert('剩余课时不足，无法预约该时段。')
      return
    }
    const confirmed = window.confirm(`确认预约 ${slot.startTime}-${slot.endTime} 吗？`)
    if (!confirmed) {
      return
    }
    setSharedStore((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.map((item) => (item.id === slotId ? { ...item, isBooked: true } : item)),
      bookings: [
        ...prev.bookings,
        { id: `booking-${Date.now()}`, studentId: currentStudent.id, slotId, courseName: slot.courseName }
      ],
      students: prev.students.map((item) =>
        item.id === currentStudent.id ? { ...item, remainingLessons: Math.max(item.remainingLessons - 1, 0) } : item
      )
    }))
    appendLessonRecord({
      title: `${slot.startTime}-${slot.endTime} ${slot.courseName} 预约`,
      delta: -1,
      remainingAfter: Math.max(currentStudent.remainingLessons - 1, 0)
    })
    appendSyncLog(`学生约课同步：${currentStudent.name} 预约 ${slot.courseName}`)
    window.alert('预约成功')
  }

  function handleCancelBooking(slotId) {
    if (!currentStudent) {
      return
    }
    const booking = bookings.find((item) => item.slotId === slotId && item.studentId === currentStudent.id)
    if (!booking) {
      return
    }
    const slot = availableSlots.find((item) => item.id === slotId)
    const confirmed = window.confirm(
      `确认取消 ${slot?.courseName || '该课程'}（${slot?.startTime || ''}-${slot?.endTime || ''}）吗？`
    )
    if (!confirmed) {
      return
    }
    setSharedStore((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.map((item) => (item.id === slotId ? { ...item, isBooked: false } : item)),
      bookings: prev.bookings.filter((item) => item.id !== booking.id),
      students: prev.students.map((item) =>
        item.id === currentStudent.id ? { ...item, remainingLessons: item.remainingLessons + 1 } : item
      )
    }))
    appendLessonRecord({
      title: `${slot?.startTime}-${slot?.endTime} ${slot?.courseName || ''} 取消`,
      delta: 1,
      remainingAfter: currentStudent.remainingLessons + 1
    })
    appendSyncLog(`学生取消预约同步：${currentStudent.name} 取消 ${slot?.courseName || ''}`)
    window.alert('取消预约成功，名额已恢复为可预约状态。')
  }

  function handlePurchaseLessons(plan) {
    if (!currentStudent) {
      return
    }
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        item.id === currentStudent.id
          ? {
              ...item,
              totalLessons: (item.totalLessons || item.remainingLessons) + plan.lessons,
              remainingLessons: item.remainingLessons + plan.lessons
            }
          : item
      )
    }))
    appendLessonRecord({
      title: `购买${plan.label}`,
      delta: plan.lessons,
      remainingAfter: currentStudent.remainingLessons + plan.lessons
    })
  }

  function handleAddTeacherStudent(payload) {
    const phone = normalizePhone(payload.phone)
    const name = payload.name.trim()
    if (!phone || !name) {
      window.alert('请填写学生姓名和手机号。')
      return
    }
    if (students.some((item) => normalizePhone(item.phone) === phone)) {
      window.alert('该手机号已存在。')
      return
    }
    setSharedStore((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        { id: `stu-${Date.now()}`, name, phone, password: '123456', remainingLessons: 20, totalLessons: 20 }
      ]
    }))
    appendSyncLog(`老师创建学生账号：${name}（${phone}）`)
    window.alert(`学生账号已创建：${phone}，初始密码 123456`)
  }

  function handleDeleteTeacherStudent(studentId) {
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.filter((item) => item.id !== studentId),
      bookings: prev.bookings.filter((item) => item.studentId !== studentId)
    }))
  }

  function handleAdjustTeacherStudentLessons(studentId, delta) {
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        item.id === studentId ? { ...item, remainingLessons: Math.max(item.remainingLessons + delta, 0) } : item
      )
    }))
  }

  function handleResetStudentPassword(studentId) {
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        item.id === studentId ? { ...item, password: '123456' } : item
      )
    }))
    window.alert('密码已重置为 123456')
  }

  function handleAddTeacherLesson(payload) {
    if (!currentTeacher) {
      return
    }
    const day = buildWeekDays(teacherWeekOffset).find((item) => item.key === payload.dayKey)
    if (!day) {
      return
    }
    const { startTime, endTime } = splitTimeRange(payload.time)
    const studentName = payload.student?.trim()
    const student = studentName ? students.find((item) => item.name === studentName) : null
    const slotId = `${currentTeacher.id}-${day.dateISO}-${startTime}-${endTime}`
    setSharedStore((prev) => {
      const withoutSlot = prev.availableSlots.filter((slot) => slot.id !== slotId)
      const nextSlots = [
        ...withoutSlot,
        {
          id: slotId,
          date: day.dateISO,
          startTime,
          endTime,
          courseName: payload.course,
          teacherId: currentTeacher.id,
          isBooked: Boolean(student)
        }
      ]
      const withoutBooking = prev.bookings.filter((booking) => booking.slotId !== slotId)
      const nextBookings = student
        ? [...withoutBooking, { id: `booking-${Date.now()}`, studentId: student.id, slotId, courseName: payload.course }]
        : withoutBooking
      const nextStudents = student
        ? prev.students.map((item) =>
            item.id === student.id ? { ...item, remainingLessons: Math.max(item.remainingLessons - 1, 0) } : item
          )
        : prev.students
      return { ...prev, availableSlots: nextSlots, bookings: nextBookings, students: nextStudents }
    })
  }

  function handleDeleteTeacherLesson(payload) {
    if (!currentTeacher) {
      return
    }
    const day = buildWeekDays(teacherWeekOffset).find((item) => item.key === payload.dayKey)
    if (!day) {
      return
    }
    const { startTime, endTime } = splitTimeRange(payload.time)
    const slotId = `${currentTeacher.id}-${day.dateISO}-${startTime}-${endTime}`
    setSharedStore((prev) => {
      const booking = prev.bookings.find((item) => item.slotId === slotId)
      return {
        ...prev,
        availableSlots: prev.availableSlots.filter((slot) => slot.id !== slotId),
        bookings: prev.bookings.filter((item) => item.slotId !== slotId),
        students: prev.students.map((item) =>
          booking && item.id === booking.studentId ? { ...item, remainingLessons: item.remainingLessons + 1 } : item
        )
      }
    })
  }

  function handleAddTeacherAccount(payload) {
    setSharedStore((prev) => ({
      ...prev,
      teachers: [
        ...prev.teachers,
        {
          id: `t-${Date.now()}`,
          name: payload.name,
          phone: '',
          password: '123456',
          role: payload.title || '老师'
        }
      ]
    }))
  }

  function handleUpdateTeacherAccount(payload) {
    setSharedStore((prev) => ({
      ...prev,
      teachers: prev.teachers.map((item) =>
        item.id === payload.id ? { ...item, name: payload.name, role: payload.title } : item
      )
    }))
  }

  function handleDeleteTeacherAccount(teacherId) {
    setSharedStore((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((item) => item.id !== teacherId)
    }))
  }

  function handleUpdateStudentProfile(payload) {
    if (!currentStudent) {
      return
    }
    const next = { ...studentProfile, ...payload }
    setStudentProfile(next)
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        item.id === currentStudent.id
          ? { ...item, name: next.name, phone: next.phone, password: next.password, avatar: next.avatar }
          : item
      )
    }))
    window.alert('个人信息已更新')
  }

  function handleLoginSuccess(payload) {
    setAuthState({ isLoggedIn: true, role: payload.role })
    if (payload.role === 'student') {
      const matched = students.find((item) => normalizePhone(item.phone) === normalizePhone(payload.account.phone))
      if (matched) {
        setSharedStore((prev) => ({ ...prev, currentStudentId: matched.id }))
        setStudentProfile({
          name: matched.name,
          phone: matched.phone,
          password: matched.password,
          avatar: matched.avatar || studentProfile.avatar
        })
      }
      return
    }
    const matchedTeacher = teachers.find((item) => normalizePhone(item.phone) === normalizePhone(payload.account.phone))
    if (matchedTeacher) {
      setSharedStore((prev) => ({ ...prev, currentTeacherId: matchedTeacher.id }))
    }
  }

  function handleLogout() {
    setAuthState({ isLoggedIn: false, role: null })
    window.alert('已退出登录')
  }

  const teacherWeekLabel = `${teacherWeekDays[0].date} - ${teacherWeekDays[teacherWeekDays.length - 1].date}`
  const teacherStudents = students.map((student) => ({
    id: student.id,
    name: student.name,
    phone: student.phone,
    course: student.course || '待分配课程',
    remainingLessons: student.remainingLessons,
    avatar: student.avatar || ''
  }))
  const teacherAccountsForView = teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    title: teacher.role || '老师'
  }))
  const teacherAccount = teachers.find((teacher) => teacher.role === '超级管理员') || teachers[0]

  return (
    <div className={containerClassName}>
      {!isLoginRoute && authState.isLoggedIn && resolvedRole === 'teacher' && isTeacherRoute && (
        <TopNavigation routes={teacherRoutes} />
      )}
      <Routes>
        {pageRoutes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={
              route.id === 'login' ? (
                <LoginPage
                  studentAccounts={students}
                  teacherAccount={teacherAccount}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : !authState.isLoggedIn ? (
                <Navigate replace to="/" />
              ) : resolvedRole === 'student' && route.role === '教师端' ? (
                <Navigate replace to="/student/home" />
              ) : resolvedRole === 'teacher' && route.role === '学生端' ? (
                <Navigate replace to="/teacher" />
              ) : route.id === 'student-home' ? (
                <StudentHomePage lessonStats={lessonStats} />
              ) : route.id === 'student-book' ? (
                <StudentBookLessonPage />
              ) : route.id === 'student-profile' ? (
                <StudentProfilePage studentProfile={studentProfile} onUpdateStudentProfile={handleUpdateStudentProfile} onLogout={handleLogout} />
              ) : route.id === 'student-buy-lessons' ? (
                <StudentBuyLessonsPage />
              ) : route.id === 'student-instruments' ? (
                <StudentInstrumentsPage />
              ) : route.id === 'student-instrument-shop' ? (
                <StudentInstrumentShopPage />
              ) : route.id === 'student-profile-courses' ? (
                <StudentProfileFeaturePage
                  featureType="courses"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onCancelBooking={handleCancelBooking}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'student-profile-records' ? (
                <StudentProfileFeaturePage
                  featureType="records"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'student-profile-purchase' ? (
                <StudentProfileFeaturePage
                  featureType="purchase"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'student-profile-instruments' ? (
                <StudentProfileFeaturePage
                  featureType="instruments"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'student-profile-invite' ? (
                <StudentProfileFeaturePage
                  featureType="invite"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'student-profile-settings' ? (
                <StudentProfileFeaturePage
                  featureType="settings"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'student-profile-contact' ? (
                <StudentProfileFeaturePage
                  featureType="contact"
                  lessonRecords={lessonRecords}
                  bookSlots={studentCourseSlots}
                  instrumentList={instrumentList}
                  onPurchaseLessons={handlePurchaseLessons}
                />
              ) : route.id === 'teacher-home' ? (
                <TeacherDashboardPage
                  onLogout={handleLogout}
                  syncLogs={syncLogs}
                  todayLessonCount={todayLessonCount}
                  totalStudentCount={totalStudentCount}
                  todayLessons={todayLessons}
                />
              ) : route.id === 'teacher-students' ? (
                <TeacherStudentManagementPage
                  students={teacherStudents}
                  onAddStudent={handleAddTeacherStudent}
                  onAdjustLessons={handleAdjustTeacherStudentLessons}
                  onDeleteStudent={handleDeleteTeacherStudent}
                  onResetPassword={handleResetStudentPassword}
                />
              ) : route.id === 'teacher-schedule' ? (
                <TeacherWeeklySchedulePage />
              ) : route.id === 'teacher-booking-requests' ? (
                <TeacherBookingRequestsPage />
              ) : route.id === 'teacher-contact' ? (
                <TeacherContactPage />
              ) : route.id === 'teacher-instruments' ? (
                <TeacherInstrumentsManagementPage />
              ) : route.id === 'teacher-management' ? (
                isSuperAdmin ? (
                  <TeacherManagementPage
                    teachers={teacherAccountsForView}
                    currentTeacherId={currentTeacherId}
                    onAddTeacher={handleAddTeacherAccount}
                    onUpdateTeacher={handleUpdateTeacherAccount}
                    onDeleteTeacher={handleDeleteTeacherAccount}
                  />
                ) : (
                  <Navigate replace to="/teacher" />
                )
              ) : (
                <PageFrame source={route.source} title={route.title} />
              )
            }
          />
        ))}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
      {!isLoginRoute && authState.isLoggedIn && resolvedRole === 'student' && isStudentRoute && (
        <BottomNavigation routes={studentRoutes} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
