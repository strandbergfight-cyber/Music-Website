import { useAppContext } from '../context/AppContext'

function resolveImage(item) {
  return item.image || item.imageUrl || item.imageData || ''
}

function resolveImages(item) {
  if (Array.isArray(item.images) && item.images.length) {
    return item.images.filter(Boolean).slice(0, 4)
  }
  const single = resolveImage(item)
  return single ? [single] : []
}

export default function StudentInstrumentShopPage() {
  const { data } = useAppContext()
  const products = data.instrumentProducts || []

  function handleConsult() {
    const contact = data.organizationContact?.phone || '请联系老师咨询'
    window.alert(`请联系老师咨询购买：${contact}`)
  }

  return (
    <main className="page-shell">
      <section className="student-panel">
        <div className="student-panel-header">
          <div className="student-header-main">
            <span className="student-tag">乐器购买</span>
            <h2>乐器商品</h2>
          </div>
        </div>
        <div className="feature-list">
          {products.length ? (
            products.map((item) => (
              <article key={item.id} className="feature-card instrument-shop-card">
                {resolveImages(item).length ? (
                  <div className="instrument-shop-gallery">
                    {resolveImages(item).map((img, index) => (
                      <img key={`${item.id}-${index}`} alt={`${item.name}-${index + 1}`} className="instrument-shop-image" src={img} />
                    ))}
                  </div>
                ) : null}
                <strong>{item.name}</strong>
                <p>价格：¥{item.price}</p>
                {item.description ? <p>{item.description}</p> : null}
                <button className="feature-card-btn" onClick={handleConsult} type="button">
                  咨询购买
                </button>
              </article>
            ))
          ) : (
            <article className="feature-card">
              <strong>暂无乐器商品</strong>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
