export const pageRoutes = [
  {
    id: 'login',
    path: '/',
    title: '登录',
    role: '入口',
    showInNav: false
  },
  {
    id: 'student-home',
    path: '/student/home',
    title: '学生端首页',
    source: '/sonata_atelier_home/code.html',
    role: '学生端',
    navLabel: '首页',
    showInNav: true
  },
  {
    id: 'student-book',
    path: '/student/book-lesson',
    title: '学生端约课页',
    source: '/sonata_atelier_book_lesson/code.html',
    role: '学生端',
    navLabel: '约新课',
    showInNav: true
  },
  {
    id: 'student-profile',
    path: '/student/profile',
    title: '学生端个人中心',
    role: '学生端',
    navLabel: '我的',
    showInNav: true
  },
  {
    id: 'student-buy-lessons',
    path: '/student/buy-lessons',
    title: '购买课时',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-instruments',
    path: '/student/instruments',
    title: '我的乐器',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-instrument-shop',
    path: '/student/instrument-shop',
    title: '乐器购买',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-courses',
    path: '/student/profile/courses',
    title: '我的课程表',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-records',
    path: '/student/profile/records',
    title: '课时消费记录',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-purchase',
    path: '/student/profile/purchase',
    title: '购买课时',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-instruments',
    path: '/student/profile/instruments',
    title: '我的乐器',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-invite',
    path: '/student/profile/invite',
    title: '邀请好友',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-settings',
    path: '/student/profile/settings',
    title: '设置',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'student-profile-contact',
    path: '/student/profile/contact',
    title: '联系机构',
    role: '学生端',
    showInNav: false
  },
  {
    id: 'teacher-home',
    path: '/teacher',
    title: '教师端首页',
    source: '/teacher_dashboard_home/code.html',
    role: '教师端',
    navLabel: 'Dashboard',
    showInNav: true
  },
  {
    id: 'teacher-students',
    path: '/teacher/students',
    title: '教师端学员管理',
    source: '/teacher_student_management/code.html',
    role: '教师端',
    navLabel: '学员管理',
    showInNav: true
  },
  {
    id: 'teacher-schedule',
    path: '/teacher/schedule',
    title: '教师端周课表',
    source: '/teacher_weekly_schedule/code.html',
    role: '教师端',
    navLabel: '周课表',
    showInNav: true
  },
  {
    id: 'teacher-booking-requests',
    path: '/teacher/booking-requests',
    title: '预约管理',
    role: '教师端',
    navLabel: '预约管理',
    showInNav: true
  },
  {
    id: 'teacher-management',
    path: '/teacher/management',
    title: '老师管理',
    role: '教师端',
    navLabel: '老师管理',
    showInNav: true,
    requiresSuperAdmin: true
  },
  {
    id: 'teacher-contact',
    path: '/teacher/contact',
    title: '联系机构',
    role: '教师端',
    navLabel: '联系机构',
    showInNav: true
  },
  {
    id: 'teacher-instruments',
    path: '/teacher/instruments',
    title: '乐器管理',
    role: '教师端',
    navLabel: '乐器管理',
    showInNav: true
  }
]
