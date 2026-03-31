import { useState } from 'react'
import { Link } from 'react-router-dom'

const purchasePlans = [
  { id: 'plan-10', label: '10 课时包', lessons: 10, price: 1880 },
  { id: 'plan-20', label: '20 课时包', lessons: 20, price: 3480 },
  { id: 'plan-40', label: '40 课时包', lessons: 40, price: 6480 }
]

export default function StudentProfileFeaturePage({
  featureType,
  lessonRecords,
  bookSlots,
  instrumentList,
  onPurchaseLessons,
  onCancelBooking
}) {
  const [closingCourseId, setClosingCourseId] = useState(null)
  const bookedCourses = bookSlots.filter((slot) => slot.booked)
  const allRecords = lessonRecords

  function handleCancelCourse(courseId) {
    setClosingCourseId(courseId)
    window.setTimeout(() => {
      onCancelBooking(courseId)
      setClosingCourseId(null)
    }, 220)
  }

  const featureMap = {
    courses: {
      title: '我的课程表',
      subtitle: '课程列表',
      render: () => (
        <div className="feature-list">
          {bookedCourses.length ? (
            bookedCourses.map((course) => (
              <article
                key={course.id}
                className={`feature-card${closingCourseId === course.id ? ' feature-card-closing' : ''}`}
              >
                <strong>{course.time}</strong>
                <p>{course.teacher}</p>
                <button className="feature-card-btn" onClick={() => handleCancelCourse(course.id)} type="button">
                  取消预约
                </button>
              </article>
            ))
          ) : (
            <article className="feature-card">
              <strong>暂无已预约课程</strong>
              <p>请前往“约新课”页面进行预约</p>
            </article>
          )}
        </div>
      )
    },
    records: {
      title: '课时消费记录',
      subtitle: '每一次扣课时记录',
      render: () => (
        <div className="feature-list">
          {allRecords.length ? (
            allRecords.map((record) => (
              <article key={record.id} className="feature-card">
                <strong>{record.title}</strong>
                <p>{record.time}</p>
                <p>剩余课时：{record.remainingAfter ?? '-'}</p>
                <span className="feature-delta consume">{record.delta} 课时</span>
              </article>
            ))
          ) : (
            <article className="feature-card">
              <strong>暂无课时变动记录</strong>
              <p>预约、取消、教师调整后会自动记录</p>
            </article>
          )}
        </div>
      )
    },
    purchase: {
      title: '购买课时',
      subtitle: '购买入口页面',
      render: () => (
        <div className="feature-list">
          {purchasePlans.map((plan) => (
            <article key={plan.id} className="feature-card purchase-card">
              <div>
                <strong>{plan.label}</strong>
                <p>¥{plan.price}</p>
              </div>
              <button onClick={() => onPurchaseLessons(plan)} type="button">
                立即购买
              </button>
            </article>
          ))}
        </div>
      )
    },
    instruments: {
      title: '我的乐器',
      subtitle: '乐器信息',
      render: () => (
        <div className="feature-list">
          {instrumentList.map((item) => (
            <article key={item.id} className="feature-card">
              <strong>{item.name}</strong>
              <p>{item.brand}</p>
              <span>{item.note}</span>
            </article>
          ))}
        </div>
      )
    },
    invite: {
      title: '邀请好友',
      subtitle: '邀请入口',
      render: () => (
        <div className="feature-list">
          <article className="feature-card">
            <strong>邀请码：ATELIER2026</strong>
            <p>分享给好友注册后，双方各得 1 课时</p>
          </article>
        </div>
      )
    },
    settings: {
      title: '设置',
      subtitle: '基础设置',
      render: () => (
        <div className="feature-list">
          <article className="feature-card">
            <strong>消息提醒</strong>
            <p>课前提醒已开启</p>
          </article>
          <article className="feature-card">
            <strong>语言偏好</strong>
            <p>简体中文</p>
          </article>
        </div>
      )
    },
    contact: {
      title: '联系机构',
      subtitle: '机构联系方式',
      render: () => (
        <div className="feature-list">
          <article className="feature-card">
            <strong>联系电话</strong>
            <p>010-12345678</p>
          </article>
          <article className="feature-card">
            <strong>机构地址</strong>
            <p>北京市朝阳区艺术园区A座</p>
          </article>
        </div>
      )
    }
  }

  const activeFeature = featureMap[featureType]

  if (!activeFeature) {
    return null
  }

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">{activeFeature.subtitle}</span>
            <h2>{activeFeature.title}</h2>
          </div>
          <img
            alt="学生头像"
            className="student-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF3QQlR3yrJewXjJy3Sxz4DQFXtcGR9ean8N6CQSAOmRq2K0vhIyjDyR9TTvCeKy2TFzkFyECGI0gpTttjanwwxBXbLOv0o42feD6eADel0y-E0pTkgKvde6RRMjdGJUpRJ-UzIHCe0casZqEQ4ToJ6R46XuqvYPJpN-cUkjHjLKUeioaQKvbPqj4D-A9K8TLTRERs3dWw7NrligwJjKts4dHLqM3ZFQWViBNyvpahWuD4-2KGRwGhUWBrXCd1xXcGvMiDRhLAQl4H"
          />
        </div>
        {activeFeature.render()}
        <Link className="profile-back-link" to="/student/profile">
          返回我的页面
        </Link>
      </section>
    </main>
  )
}
