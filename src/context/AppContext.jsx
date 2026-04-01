import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const AppContext = createContext()
const STORAGE_KEY = 'lessonSystemState'
const STORAGE_VERSION = 3
const JSONBIN_BIN_ID =
  import.meta.env.VITE_JSONBIN_BIN_ID || import.meta.env.VITE_JSONBIN_ID || import.meta.env.JSONBIN_BIN_ID || ''
const JSONBIN_MASTER_KEY =
  import.meta.env.VITE_JSONBIN_MASTER_KEY ||
  import.meta.env.VITE_JSONBIN_API_KEY ||
  import.meta.env.JSONBIN_MASTER_KEY ||
  import.meta.env.JSONBIN_API_KEY ||
  ''
const JSONBIN_ACCESS_KEY =
  import.meta.env.VITE_JSONBIN_ACCESS_KEY ||
  import.meta.env.VITE_JSONBIN_API_KEY ||
  import.meta.env.JSONBIN_ACCESS_KEY ||
  import.meta.env.JSONBIN_API_KEY ||
  ''
const JSONBIN_SYNC_ENABLED = Boolean(JSONBIN_BIN_ID && (JSONBIN_MASTER_KEY || JSONBIN_ACCESS_KEY))

function formatRemoteError(error, fallback) {
  if (!error) {
    return fallback
  }
  const parts = [error.message, error.details, error.hint].filter(Boolean)
  return parts.length ? parts.join(' | ') : fallback
}

function buildJsonbinUrl() {
  return `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`
}

function getJsonbinHeaders() {
  const headers = {}
  if (JSONBIN_ACCESS_KEY) {
    headers['X-Access-Key'] = JSONBIN_ACCESS_KEY
  }
  if (JSONBIN_MASTER_KEY) {
    headers['X-Master-Key'] = JSONBIN_MASTER_KEY
  }
  return headers
}

function extractJsonbinVersionId(response, payload) {
  return (
    response.headers.get('version-id') ||
    response.headers.get('Version-Id') ||
    response.headers.get('x-version-id') ||
    response.headers.get('X-Version-Id') ||
    response.headers.get('x-bin-version-id') ||
    response.headers.get('X-Bin-Version-Id') ||
    payload?.metadata?.versioning?.version ||
    payload?.metadata?.version ||
    ''
  )
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
  students: [],
  teachers: [{ id: 1, name: '张老师', phone: '17610913873', password: '990830', role: '超级管理员' }],
  availableSlots: [],
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
  studentInstrumentsById: {},
  lessonRecords: [],
  syncLogs: [],
  currentStudentId: null,
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
          _id: item._id ?? item.id ?? Date.now() + index,
          username: String(item.username || item.phone || ''),
          role: item.role || 'student',
          enabled: item.enabled !== false,
          name: item.name || '',
          phone: String(item.phone || '').replace(/\s+/g, '').replace(/-/g, ''),
          password: String(item.password || ''),
          passwordHash: String(item.passwordHash || ''),
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

function mapJsonbinUserToLocal(row, index = 0) {
  const identifier = row._id || row.id || `db-${row.username || row.phone || index}`
  const normalizedPhone = String(row.phone || row.username || '').replace(/\s+/g, '').replace(/-/g, '')
  const userRole = row.role || 'student'
  const base = {
    id: identifier,
    _id: identifier,
    username: String(row.username || normalizedPhone || ''),
    role: userRole,
    enabled: row.enabled !== false,
    name: row.name || '',
    phone: normalizedPhone,
    password: String(row.password || ''),
    passwordHash: String(row.passwordHash || ''),
    remainingLessons: Number.isFinite(row.remainingLessons)
      ? row.remainingLessons
      : Number.isFinite(row.remaining_lessons)
        ? row.remaining_lessons
        : 20,
    totalLessons: Number.isFinite(row.totalLessons)
      ? row.totalLessons
      : Number.isFinite(row.total_lessons)
        ? row.total_lessons
        : undefined,
    avatar: row.avatar || ''
  }
  return userRole === 'student' ? base : { ...base, title: row.title || row.role || '老师' }
}

function mapLocalUserToJsonbin(user) {
  return {
    id: user.id || user._id || `db-${Date.now()}`,
    _id: user._id || user.id || `db-${Date.now()}`,
    username: String(user.username || user.phone || ''),
    password: String(user.password || ''),
    passwordHash: String(user.passwordHash || ''),
    role: user.role || 'student',
    enabled: user.enabled !== false,
    name: user.name || '',
    phone: String(user.phone || user.username || ''),
    remainingLessons: Number.isFinite(user.remainingLessons) ? user.remainingLessons : 20,
    totalLessons: Number.isFinite(user.totalLessons) ? user.totalLessons : undefined,
    avatar: user.avatar || ''
  }
}

async function pullJsonbinUsers() {
  if (!JSONBIN_SYNC_ENABLED) {
    return { users: [], versionId: '' }
  }
  const response = await fetch(`${buildJsonbinUrl()}/latest`, {
    headers: getJsonbinHeaders()
  })
  if (!response.ok) {
    throw new Error(`jsonbin-pull-failed-${response.status}`)
  }
  const payload = await response.json()
  const versionId = extractJsonbinVersionId(response, payload)
  const record = payload?.record
  const users = Array.isArray(record) ? record : Array.isArray(record?.users) ? record.users : []
  return { users, versionId }
}

async function pushJsonbinUsers(users, versionId) {
  if (!JSONBIN_SYNC_ENABLED) {
    return { users: users || [], versionId: '' }
  }
  const headers = {
    'Content-Type': 'application/json',
    ...getJsonbinHeaders()
  }
  if (versionId) {
    headers['version-id'] = versionId
    headers['X-Version-Id'] = versionId
  }
  const response = await fetch(buildJsonbinUrl(), {
    method: 'PUT',
    headers,
    body: JSON.stringify(users || [])
  })
  if (!response.ok) {
    throw new Error(`jsonbin-push-failed-${response.status}`)
  }
  const payload = await response.json()
  const nextVersionId = extractJsonbinVersionId(response, payload)
  const record = payload?.record
  const nextUsers = Array.isArray(record) ? record : Array.isArray(record?.users) ? record.users : users || []
  return { users: nextUsers, versionId: nextVersionId || versionId || '' }
}

export const AppProvider = ({ children }) => {
  const suppressNextRemotePushRef = useRef(false)
  const [sharedStore, setSharedStore] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed?.data && parsed?.version === STORAGE_VERSION) {
          return migrateSharedStore(parsed.data)
        }
      } catch {}
    }
    return initialSharedStore
  })
  const [authState, setAuthState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed?.version === STORAGE_VERSION && parsed?.auth) {
          return parsed.auth
        }
      } catch {}
    }
    return { isLoggedIn: false, role: null }
  })
  const [studentProfile, setStudentProfile] = useState({
    name: '',
    phone: '',
    password: '',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDF3QQlR3yrJewXjJy3Sxz4DQFXtcGR9ean8N6CQSAOmRq2K0vhIyjDyR9TTvCeKy2TFzkFyECGI0gpTttjanwwxBXbLOv0o42feD6eADel0y-E0pTkgKvde6RRMjdGJUpRJ-UzIHCe0casZqEQ4ToJ6R46XuqvYPJpN-cUkjHjLKUeioaQKvbPqj4D-A9K8TLTRERs3dWw7NrligwJjKts4dHLqM3ZFQWViBNyvpahWuD4-2KGRwGhUWBrXCd1xXcGvMiDRhLAQl4H'
  })
  const [instrumentList] = useState([])
  const [isRemoteReady, setIsRemoteReady] = useState(false)
  const [syncMeta, setSyncMeta] = useState({
    mode: JSONBIN_SYNC_ENABLED ? 'cloud' : 'local',
    state: JSONBIN_SYNC_ENABLED ? 'connecting' : 'local_only',
    lastSyncedAt: ''
  })
  const sharedStoreRef = useRef(sharedStore)
  const jsonbinVersionIdRef = useRef('')

  useEffect(() => {
    sharedStoreRef.current = sharedStore
  }, [sharedStore])

  useEffect(() => {
    let canceled = false
    async function bootstrapJsonbinUsers() {
      if (!JSONBIN_SYNC_ENABLED) {
        if (!canceled) {
          setIsRemoteReady(true)
          setSyncMeta({
            mode: 'local',
            state: 'local_only',
            lastSyncedAt: ''
          })
        }
        return
      }
      try {
        setSyncMeta((prev) => ({ ...prev, mode: 'cloud', state: 'connecting' }))
        const remotePayload = await pullJsonbinUsers()
        const remoteUsers = remotePayload.users || []
        jsonbinVersionIdRef.current = remotePayload.versionId || ''
        if (!canceled) {
          const remoteTeachers = remoteUsers
            .filter((item) => item.role !== 'student')
            .map((item, index) => mapJsonbinUserToLocal(item, index))
          const remoteStudents = remoteUsers
            .filter((item) => item.role === 'student')
            .map((item, index) => mapJsonbinUserToLocal(item, index))
          if (remoteUsers.length) {
            suppressNextRemotePushRef.current = true
            setSharedStore((prev) => ({
              ...prev,
              teachers: remoteTeachers.length ? remoteTeachers : prev.teachers,
              students: remoteStudents
            }))
          }
          setSyncMeta((prev) => ({
            ...prev,
            mode: 'cloud',
            state: 'synced',
            lastSyncedAt: new Date().toISOString()
          }))
        }
      } catch {
        window.__LESSON_LAST_SYNC_ERROR__ = '初始化拉取 JSONbin 数据失败'
        if (!canceled) {
          setSyncMeta((prev) => ({ ...prev, mode: 'cloud', state: 'error' }))
        }
      }
      if (!canceled) {
        setIsRemoteReady(true)
      }
    }
    bootstrapJsonbinUsers()
    return () => {
      canceled = true
    }
  }, [])

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
    if (!isRemoteReady) {
      return
    }
    if (suppressNextRemotePushRef.current) {
      suppressNextRemotePushRef.current = false
      return
    }
    let canceled = false
    const timer = window.setTimeout(async () => {
      if (canceled) {
        return
      }
      try {
        if (!JSONBIN_SYNC_ENABLED) {
          setSyncMeta((prev) => ({ ...prev, mode: 'local', state: 'local_only' }))
          return
        }
        const localUsers = [
          ...(sharedStore.teachers || []).map((item) => ({ ...item, role: item.role || 'teacher' })),
          ...(sharedStore.students || []).map((item) => ({ ...item, role: 'student' }))
        ].map(mapLocalUserToJsonbin)
        setSyncMeta((prev) => ({ ...prev, mode: 'cloud', state: 'syncing' }))
        const pushed = await pushJsonbinUsers(localUsers, jsonbinVersionIdRef.current)
        jsonbinVersionIdRef.current = pushed.versionId || jsonbinVersionIdRef.current
        window.__LESSON_LAST_SYNC_ERROR__ = ''
        setSyncMeta((prev) => ({
          ...prev,
          mode: 'cloud',
          state: 'synced',
          lastSyncedAt: new Date().toISOString()
        }))
      } catch {
        window.__LESSON_LAST_SYNC_ERROR__ = '推送 JSONbin 数据失败'
        setSyncMeta((prev) => ({ ...prev, mode: 'cloud', state: 'error' }))
      }
    }, 250)
    return () => {
      canceled = true
      window.clearTimeout(timer)
    }
  }, [sharedStore, isRemoteReady])

  useEffect(() => {
    if (!isRemoteReady || !JSONBIN_SYNC_ENABLED) {
      return
    }
    let canceled = false
    const pullLatest = async () => {
      try {
        const remotePayload = await pullJsonbinUsers()
        const remoteUsers = remotePayload.users || []
        jsonbinVersionIdRef.current = remotePayload.versionId || jsonbinVersionIdRef.current
        if (!canceled && remoteUsers) {
          const remoteTeachers = remoteUsers
            .filter((item) => item.role !== 'student')
            .map((item, index) => mapJsonbinUserToLocal(item, index))
          const remoteStudents = remoteUsers
            .filter((item) => item.role === 'student')
            .map((item, index) => mapJsonbinUserToLocal(item, index))
          const nextSnapshot = {
            teachers: remoteTeachers.length ? remoteTeachers : sharedStoreRef.current.teachers,
            students: remoteStudents
          }
          const prevSnapshot = {
            teachers: sharedStoreRef.current.teachers,
            students: sharedStoreRef.current.students
          }
          const prevSerialized = JSON.stringify(prevSnapshot)
          const remoteSerialized = JSON.stringify(nextSnapshot)
          if (prevSerialized !== remoteSerialized) {
            suppressNextRemotePushRef.current = true
            setSharedStore((prev) => ({
              ...prev,
              teachers: nextSnapshot.teachers,
              students: nextSnapshot.students
            }))
          }
          setSyncMeta((prev) => ({
            ...prev,
            mode: 'cloud',
            state: 'synced',
            lastSyncedAt: new Date().toISOString()
          }))
        }
      } catch {
        window.__LESSON_LAST_SYNC_ERROR__ = '拉取 JSONbin 数据失败'
        setSyncMeta((prev) => ({ ...prev, mode: 'cloud', state: 'error' }))
      }
    }
    const intervalId = window.setInterval(pullLatest, 15000)
    const focusHandler = () => {
      pullLatest()
    }
    window.addEventListener('focus', focusHandler)
    return () => {
      canceled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', focusHandler)
    }
  }, [isRemoteReady])

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
  const createStudentAccount = async (student) => {
    const normalizedPhone = String(student.phone || '').replace(/\s+/g, '').replace(/-/g, '')
    const normalizedName = String(student.name || '').trim()
    if (!normalizedPhone || !normalizedName) {
      return { success: false, message: '请填写学生姓名和手机号。' }
    }
    const plainPassword = String(student.password || '123456').trim() || '123456'
    const passwordHash = await hashPassword(plainPassword)
    const payload = {
      username: normalizedPhone,
      password: '',
      passwordHash,
      role: 'student',
      name: normalizedName,
      enabled: true,
      phone: normalizedPhone,
      remainingLessons: 20
    }
    if (!JSONBIN_SYNC_ENABLED) {
      return { success: false, message: 'JSONbin 未启用：请检查 VITE_JSONBIN_BIN_ID 与密钥配置。' }
    }
    try {
      const remotePayload = await pullJsonbinUsers()
      jsonbinVersionIdRef.current = remotePayload.versionId || jsonbinVersionIdRef.current
      const remoteUsers = (remotePayload.users || []).map(mapJsonbinUserToLocal)
      if (remoteUsers.some((item) => String(item.username || item.phone || '') === normalizedPhone)) {
        return { success: false, message: '该手机号已存在。' }
      }
      const mergedUsers = [...remoteUsers, payload]
      const pushed = await pushJsonbinUsers(
        mergedUsers.map(mapLocalUserToJsonbin),
        jsonbinVersionIdRef.current
      )
      jsonbinVersionIdRef.current = pushed.versionId || jsonbinVersionIdRef.current
      const syncedUsers = (pushed.users || []).map(mapJsonbinUserToLocal)
      const syncedTeachers = syncedUsers.filter((item) => item.role !== 'student')
      const syncedStudents = syncedUsers.filter((item) => item.role === 'student')
      suppressNextRemotePushRef.current = true
      setSharedStore((prev) => ({
        ...prev,
        teachers: syncedTeachers.length ? syncedTeachers : prev.teachers,
        students: syncedStudents
      }))
      return { success: true, phone: normalizedPhone }
    } catch (error) {
      return { success: false, message: formatRemoteError(error, '写入 JSONbin 失败') }
    }
  }
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
    createStudentAccount,
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
    updateProfile,
    syncMeta
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
export default AppContext
