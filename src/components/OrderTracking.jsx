import { deliveryInfo } from "../data";
import {
  ORDER_STAGES,
  useOrderProgress,
  computeRemainingEtaMinutes,
} from "../orderTracking";

const AVERAGE_ETA_MINUTES = (deliveryInfo.etaMin + deliveryInfo.etaMax) / 2;

export default function OrderTracking({ order, onStartNewOrder }) {
  const { stageIndex, deliveringProgress, elapsedMs } = useOrderProgress(order.orderTime);
  const delivered = stageIndex === ORDER_STAGES.length - 1;
  const delivering = ORDER_STAGES[stageIndex].key === "delivering";

  const remainingEtaMinutes = computeRemainingEtaMinutes(elapsedMs, AVERAGE_ETA_MINUTES);

  const formattedTime = new Date(order.orderTime).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="tracking">
      <div className="tracking-card">
        <div className="tracking-header">
          <h2>{delivered ? "Order delivered" : "Tracking your order"}</h2>
          <p className="tracking-meta">Order {order.orderNumber} · {formattedTime}</p>
        </div>

        {!delivered && (
          <span className="delivery-eta tracking-eta">
            <span className="eta-dot" />
            <span className="eta-icon">🛵</span>
            Arrivée estimée dans {remainingEtaMinutes} min
          </span>
        )}

        <ol className="tracking-timeline">
          {ORDER_STAGES.map((stage, i) => (
            <li
              key={stage.key}
              className={`tracking-step ${
                i < stageIndex ? "complete" : i === stageIndex ? "active" : "upcoming"
              }`}
            >
              <span className="tracking-step-dot">{i < stageIndex ? "✓" : ""}</span>
              <span className="tracking-step-label">{stage.label}</span>
              {i < ORDER_STAGES.length - 1 && (
                <span className="tracking-step-connector">
                  <span
                    className="tracking-step-connector-fill"
                    style={{ transform: i < stageIndex ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </span>
              )}
            </li>
          ))}
        </ol>

        {delivering && (
          <div className="tracking-map">
            <div className="map-road" />
            <span
              className="map-marker"
              style={{ left: `${deliveringProgress * 100}%` }}
            >
              🛵
            </span>
            <span className="map-flag" style={{ left: "100%" }}>🏁</span>
          </div>
        )}

        {delivered && (
          <div className="tracking-final">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Commande livrée</h2>
          </div>
        )}

        <ul className="modal-item-list modal-item-list--receipt">
          {order.items.map((item, i) => (
            <li key={i} className="modal-item-row">
              <span className="modal-item-emoji">{item.emoji}</span>
              <span className="modal-item-name">{item.name}</span>
              <span className="modal-item-qty">x{item.quantity}</span>
              <span className="modal-item-price">€{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="modal-totals">
          <div className="modal-totals-row modal-totals-total">
            <span>Total paid</span><span>€{order.total.toFixed(2)}</span>
          </div>
        </div>

        {delivered && (
          <button className="modal-btn-primary modal-btn-full" onClick={onStartNewOrder}>
            Start New Order
          </button>
        )}
      </div>
    </section>
  );
}
