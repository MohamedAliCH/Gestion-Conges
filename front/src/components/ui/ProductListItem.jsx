/**
 * Reusable product row for list-group cards.
 * Renders differently based on the `variant` prop:
 *   "selling"  — shows price/units + colored badge
 *   "stock"    — shows SKU + stock count
 *   "sales"    — shows category/price + status badge
 */
export default function ProductListItem({ item, variant }) {
  return (
    <li className="list-group-item d-flex align-items-center gap-3">
      <img src={item.img} className="rounded" width="48" alt={item.name} />

      <div className="flex-grow-1">
        <p className="mb-1">{item.name}</p>

        {variant === 'selling' && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <small className="fw-semibold">{item.price}</small>
            <small>•</small>
            <small>{item.units}</small>
          </div>
        )}

        {variant === 'stock' && (
          <small>ID: {item.sku}</small>
        )}

        {variant === 'sales' && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <small className="fw-semibold">{item.category}</small>
            <small>•</small>
            <small>{item.price}</small>
          </div>
        )}
      </div>

      {variant === 'selling' && (
        <span
          className={`badge bg-${item.badgeColor}-subtle text-${item.badgeColor} border border-${item.badgeColor}`}
        >
          {item.badge}
        </span>
      )}

      {variant === 'stock' && (
        <div className="d-flex flex-column gap-0 align-items-center">
          <span className="fw-semibold text-primary">{item.stock}</span>
          <small className="text-muted">In Stock</small>
        </div>
      )}

      {variant === 'sales' && (
        <span
          className={`badge bg-${item.statusColor}-subtle text-${item.statusColor}`}
        >
          {item.status}
        </span>
      )}
    </li>
  )
}
