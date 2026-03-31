import React, { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext()
const STORAGE_KEY = 'lessonSystemState'
const STORAGE_VERSION = 1

function getTuesdayDateISO() {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const tuesday = new Date(monday)
  tuesday.setDate(monday.getDate() + 1)
  const year = tuesday.getFullYear()
  const month = String(tuesday.getMonth() + 1).padStart(2, '0')
  const date = String(tuesday.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

const initialSharedStore = {
  students: [{ id: 1, name: '张三', phone: '13111179429', password: '123456', remainingLessons: 20 }],
  teachers: [{ id: 1, name: '张老师', phone: '13800138002', password: '123456', role: '超级管理员' }],
  availableSlots: [
    {
      id: 1,
      date: getTuesdayDateISO(),
      startTime: '09:00',
      endTime: '10:00',
      courseName: '吉他课',
      teacherId: 1,
      isBooked: false
    }
  ],
  bookings: [],
  customBookingRequests: [],
  organizationContact: {
    name: '吉他培训机构',
    phone: '400-000-0000',
    address: '上海市徐汇区音乐路 100 号'
  },
  paymentQr: '',
  paymentQrs: [],
  lessonUnitPrice: 150,
  instrumentProducts: [],
  studentInstrumentsById: {
    1: []
  },
  lessonRecords: [],
  syncLogs: [],
  currentStudentId: 1,
  currentTeacherId: 1,
  teacherWeekOffset: 0
}

function migrateSharedStore(rawData) {
  const base = {
    ...initialSharedStore,
    ...(rawData || {})
  }
  return {
    ...base,
    students: Array.isArray(base.students)
      ? base.students.map((item, index) => ({
          id: item.id ?? Date.now() + index,
          name: item.name || '',
          phone: String(item.phone || '').replace(/\s+/g, '').replace(/-/g, ''),
          password: String(item.password || '123456'),
          remainingLessons: Number.isFinite(item.remainingLessons) ? item.remainingLessons : 20
        }))
      : initialSharedStore.students,
    teachers: Array.isArray(base.teachers) ? base.teachers : initialSharedStore.teachers,
    availableSlots: Array.isArray(base.availableSlots) ? base.availableSlots : initialSharedStore.availableSlots,
    bookings: Array.isArray(base.bookings) ? base.bookings : initialSharedStore.bookings,
    customBookingRequests: Array.isArray(base.customBookingRequests) ? base.customBookingRequests : [],
    lessonRecords: Array.isArray(base.lessonRecords) ? base.lessonRecords : [],
    syncLogs: Array.isArray(base.syncLogs) ? base.syncLogs : [],
    paymentQrs: Array.isArray(base.paymentQrs)
      ? base.paymentQrs
      : base.paymentQr
        ? [
            {
              id: Date.now(),
              channel: '收款码',
              image: base.paymentQr
            }
          ]
        : [],
    lessonUnitPrice: Number.isFinite(Number(base.lessonUnitPrice)) ? Number(base.lessonUnitPrice) : 150,
    instrumentProducts: Array.isArray(base.instrumentProducts)
      ? base.instrumentProducts.map((item, index) => ({
          id: item.id ?? Date.now() + index,
          name: item.name || '',
          price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
          description: item.description || '',
          image: String(item.image || item.imageUrl || item.imageData || ''),
          images: Array.isArray(item.images)
            ? item.images.filter(Boolean)
            : [String(item.image || item.imageUrl || item.imageData || '')].filter(Boolean)
        }))
      : []
  }
}

export const AppProvider = ({ children }) => {
  const [sharedStore, setSharedStore] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed?.data) {
          return migrateSharedStore(parsed.data)
        }
      } catch {}
    }
    const legacyData = localStorage.getItem('lessonSystemData')
    if (legacyData) {
      try {
        return migrateSharedStore(JSON.parse(legacyData))
      } catch {}
    }
    return initialSharedStore
  })
  const [authState, setAuthState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed?.auth) {
          return parsed.auth
        }
      } catch {}
    }
    return { isLoggedIn: false, role: null }
  })
  const [studentProfile, setStudentProfile] = useState({
    name: initialSharedStore.students[0].name,
    phone: initialSharedStore.students[0].phone,
    password: initialSharedStore.students[0].password,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDF3QQlR3yrJewXjJy3Sxz4DQFXtcGR9ean8N6CQSAOmRq2K0vhIyjDyR9TTvCeKy2TFzkFyECGI0gpTttjanwwxBXbLOv0o42feD6eADel0y-E0pTkgKvde6RRMjdGJUpRJ-UzIHCe0casZqEQ4ToJ6R46XuqvYPJpN-cUkjHjLKUeioaQKvbPqj4D-A9K8TLTRERs3dWw7NrligwJjKts4dHLqM3ZFQWViBNyvpahWuD4-2KGRwGhUWBrXCd1xXcGvMiDRhLAQl4H'
  })
  const [instrumentList] = useState([
    { id: 'ins-1', name: '演奏小提琴', brand: 'Yamaha V5', note: '每周保养一次，状态良好' },
    { id: 'ins-2', name: '练习电钢琴', brand: 'Roland FP-30X', note: '放置于家庭琴房' }
  ])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        data: sharedStore,
        auth: authState
      })
    )
    localStorage.setItem('lessonSystemData', JSON.stringify(sharedStore))
  }, [sharedStore, authState])

  useEffect(() => {
    const resetData = () => {
      const currentStudent = sharedStore.students.find((item) => item.id === sharedStore.currentStudentId)
      const currentTeacher = sharedStore.teachers.find((item) => item.id === sharedStore.currentTeacherId)
      const nextStore = {
        ...initialSharedStore,
        students: currentStudent ? [currentStudent] : [],
        teachers: currentTeacher ? [currentTeacher] : [],
        currentStudentId: currentStudent ? currentStudent.id : null,
        currentTeacherId: currentTeacher ? currentTeacher.id : null,
        availableSlots: [],
        bookings: [],
        studentInstrumentsById: currentStudent ? { [currentStudent.id]: [] } : {},
        organizationContact: {
          name: '',
          phone: '',
          address: ''
        },
        paymentQr: '',
        paymentQrs: [],
        lessonRecords: [],
        syncLogs: [],
        teacherWeekOffset: 0
      }
      setSharedStore(nextStore)
      localStorage.removeItem('lessonSystemData')
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          data: nextStore,
          auth: authState
        })
      )
      return nextStore
    }
    window.__LESSON_RESET_STORAGE__ = resetData
    return () => {
      delete window.__LESSON_RESET_STORAGE__
    }
  }, [sharedStore, authState, setSharedStore])

  const data = sharedStore
  const setData = setSharedStore
  const currentUser =
    authState.role === 'student'
      ? sharedStore.students.find((item) => item.id === sharedStore.currentStudentId) || null
      : authState.role === 'teacher'
        ? sharedStore.teachers.find((item) => item.id === sharedStore.currentTeacherId) || null
        : null
  const userType = authState.role

  const updateStudentLessons = (id, change) =>
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        item.id === id ? { ...item, remainingLessons: Math.max(item.remainingLessons + change, 0) } : item
      )
    }))
  const addStudent = (student) =>
    setSharedStore((prev) => ({ ...prev, students: [...prev.students, { ...student, id: Date.now() }] }))
  const deleteStudent = (id) =>
    setSharedStore((prev) => ({ ...prev, students: prev.students.filter((item) => item.id !== id) }))
  const addAvailableSlot = (slot) =>
    setSharedStore((prev) => ({
      ...prev,
      availableSlots: [...prev.availableSlots.filter((item) => item.id !== slot.id), { ...slot, id: slot.id || Date.now() }]
    }))
  const deleteAvailableSlot = (id) =>
    setSharedStore((prev) => ({ ...prev, availableSlots: prev.availableSlots.filter((item) => item.id !== id) }))
  const addBooking = (booking) => {
    setSharedStore((prev) => ({
      ...prev,
      bookings: [...prev.bookings.filter((item) => item.slotId !== booking.slotId), { ...booking, id: Date.now() }],
      availableSlots: prev.availableSlots.map((item) =>
        item.id === booking.slotId ? { ...item, isBooked: true } : item
      )
    }))
    updateStudentLessons(booking.studentId, -1)
  }
  const cancelBooking = (booking) => {
    setSharedStore((prev) => ({
      ...prev,
      bookings: prev.bookings.filter((item) => item.id !== booking.id),
      availableSlots: prev.availableSlots.map((item) =>
        item.id === booking.slotId ? { ...item, isBooked: false } : item
      )
    }))
    updateStudentLessons(booking.studentId, 1)
  }
  const addCustomBookingRequest = (request) =>
    setSharedStore((prev) => ({
      ...prev,
      customBookingRequests: [
        ...(prev.customBookingRequests || []),
        {
          id: Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          ...request
        }
      ]
    }))
  const reviewCustomBookingRequest = (requestId, action) => {
    const target = sharedStore.customBookingRequests.find((item) => item.id === requestId)
    if (!target || target.status !== 'pending') {
      return { success: false, message: '预约请求不存在或已处理' }
    }
    if (action === 'approve') {
      const student = sharedStore.students.find((item) => item.id === target.studentId)
      if (!student || student.remainingLessons <= 0) {
        setSharedStore((prev) => ({
          ...prev,
          customBookingRequests: prev.customBookingRequests.map((item) =>
            item.id === requestId ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString(), reason: '课时不足' } : item
          )
        }))
        return { success: false, message: '学生课时不足，已自动拒绝' }
      }
      const sameTimeSlot = sharedStore.availableSlots.find(
        (item) =>
          item.teacherId === target.teacherId &&
          item.date === target.date &&
          item.startTime === target.startTime &&
          item.endTime === target.endTime
      )
      const sameTimeBooked = sameTimeSlot
        ? sharedStore.bookings.some((item) => item.slotId === sameTimeSlot.id) || Boolean(sameTimeSlot.isBooked)
        : false
      if (sameTimeBooked) {
        setSharedStore((prev) => ({
          ...prev,
          customBookingRequests: prev.customBookingRequests.map((item) =>
            item.id === requestId
              ? {
                  ...item,
                  status: 'rejected',
                  reviewedAt: new Date().toISOString(),
                  reason: '该时间段已被占用'
                }
              : item
          )
        }))
        return { success: false, message: '该时间段已被占用，无法重复预约' }
      }
      const slotId = sameTimeSlot?.id || `custom-slot-${requestId}`
      setSharedStore((prev) => ({
        ...prev,
        availableSlots: [
          ...prev.availableSlots.filter((item) => item.id !== slotId),
          {
            id: slotId,
            date: target.date,
            startTime: target.startTime,
            endTime: target.endTime,
            courseName: target.courseName || '自定义预约',
            teacherId: target.teacherId,
            isBooked: true
          }
        ],
        bookings: [
          ...prev.bookings.filter((item) => item.slotId !== slotId),
          {
            id: Date.now() + 1,
            studentId: target.studentId,
            slotId,
            courseName: target.courseName || '自定义预约'
          }
        ],
        students: prev.students.map((item) =>
          item.id === target.studentId ? { ...item, remainingLessons: Math.max(item.remainingLessons - 1, 0) } : item
        ),
        customBookingRequests: prev.customBookingRequests.map((item) =>
          item.id === requestId ? { ...item, status: 'approved', reviewedAt: new Date().toISOString() } : item
        )
      }))
      return { success: true }
    }
    setSharedStore((prev) => ({
      ...prev,
      customBookingRequests: prev.customBookingRequests.map((item) =>
        item.id === requestId ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString() } : item
      )
    }))
    return { success: true }
  }
  const addTeacher = (teacher) =>
    setSharedStore((prev) => ({ ...prev, teachers: [...prev.teachers, { ...teacher, id: Date.now() }] }))
  const deleteTeacher = (id) =>
    setSharedStore((prev) => ({ ...prev, teachers: prev.teachers.filter((item) => item.id !== id) }))
  const login = (phone, password, type) => {
    if (type === 'student') {
      const student = sharedStore.students.find((item) => item.phone === phone && item.password === password)
      if (student) {
        setAuthState({ isLoggedIn: true, role: 'student' })
        setSharedStore((prev) => ({ ...prev, currentStudentId: student.id }))
        return { success: true, user: student }
      }
    } else {
      const teacher = sharedStore.teachers.find((item) => item.phone === phone && item.password === password)
      if (teacher) {
        setAuthState({ isLoggedIn: true, role: 'teacher' })
        setSharedStore((prev) => ({ ...prev, currentTeacherId: teacher.id }))
        return { success: true, user: teacher }
      }
    }
    return { success: false, message: '手机号或密码错误' }
  }
  const logout = () => {
    setAuthState({ isLoggedIn: false, role: null })
    localStorage.removeItem('lessonSystemAuth')
  }
  const updateProfile = (id, type, updates) => {
    if (type !== 'student') {
      return
    }
    setSharedStore((prev) => ({
      ...prev,
      students: prev.students.map((item) => (item.id === id ? { ...item, ...updates } : item))
    }))
  }

  const value = {
    sharedStore,
    setSharedStore,
    authState,
    setAuthState,
    studentProfile,
    setStudentProfile,
    instrumentList,
    data,
    setData,
    currentUser,
    userType,
    login,
    logout,
    addStudent,
    deleteStudent,
    updateStudentLessons,
    addAvailableSlot,
    deleteAvailableSlot,
    addBooking,
    cancelBooking,
    addCustomBookingRequest,
    reviewCustomBookingRequest,
    addTeacher,
    deleteTeacher,
    updateProfile
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
export default AppContext
