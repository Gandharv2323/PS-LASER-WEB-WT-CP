package in.pslaser.api.event;

import in.pslaser.api.activity.ActivityService;
import in.pslaser.api.event.DomainEvents.EstimateCalculated;
import in.pslaser.api.event.DomainEvents.QuoteSaved;
import in.pslaser.api.event.DomainEvents.UserLoggedIn;
import in.pslaser.api.event.DomainEvents.UserRegistered;
import in.pslaser.api.event.DomainEvents.WorkOrderStatusChanged;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Messaging consumers. Each handler runs on the async pool ({@code @Async}) so HTTP requests
 * return immediately; the work is: write a MongoDB activity document and, for status changes,
 * push a STOMP message to {@code /topic/work-orders} for live dashboards.
 */
@Component
public class ActivityEventListener {

	public static final String WORK_ORDER_TOPIC = "/topic/work-orders";

	private static final Logger log = LoggerFactory.getLogger(ActivityEventListener.class);

	private final ActivityService activity;
	private final SimpMessagingTemplate broker;

	public ActivityEventListener(ActivityService activity, SimpMessagingTemplate broker) {
		this.activity = activity;
		this.broker = broker;
	}

	@Async
	@EventListener
	public void onLogin(UserLoggedIn e) {
		activity.record(e.success() ? "LOGIN" : "LOGIN_FAILED", e.email(),
				e.success() ? "User logged in" : "Failed login attempt",
				details("userId", e.userId(), "role", e.role()));
	}

	@Async
	@EventListener
	public void onRegister(UserRegistered e) {
		activity.record("REGISTER", e.email(), "Customer registered", details("userId", e.userId()));
	}

	@Async
	@EventListener
	public void onEstimate(EstimateCalculated e) {
		activity.record("ESTIMATE", "public", "Estimate calculated",
				details("materialCode", e.materialCode(), "thicknessMm", e.thicknessMm().toPlainString(),
						"quantity", e.quantity(), "total", e.total().toPlainString()));
	}

	@Async
	@EventListener
	public void onQuoteSaved(QuoteSaved e) {
		activity.record("QUOTE_SAVED", e.customerPhone(), "Quote " + e.quoteNo() + " saved",
				details("quoteNo", e.quoteNo(), "amountInr", e.amountInr().toPlainString()));
	}

	/**
	 * "WorkOrderStatusChanged" handler. {@code @TransactionalEventListener(AFTER_COMMIT)} is an
	 * {@code @EventListener} that waits for the DB commit, so dashboards never see a status that
	 * was rolled back.
	 */
	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
	public void onStatusChanged(WorkOrderStatusChanged e) {
		Map<String, Object> payload = details("workOrderId", e.workOrderId(), "orderNo", e.orderNo(),
				"from", e.fromStatus(), "to", e.toStatus(), "note", e.note(), "at", e.at().toString());
		activity.record("STATUS_CHANGED", e.changedBy(),
				e.orderNo() + ": " + e.fromStatus() + " -> " + e.toStatus(), payload);
		try {
			broker.convertAndSend(WORK_ORDER_TOPIC, payload);
			log.info("Pushed {} {} -> {} to {}", e.orderNo(), e.fromStatus(), e.toStatus(), WORK_ORDER_TOPIC);
		}
		catch (RuntimeException ex) {
			log.warn("WebSocket push failed: {}", ex.getMessage());
		}
	}

	private static Map<String, Object> details(Object... kv) {
		Map<String, Object> map = new LinkedHashMap<>();
		for (int i = 0; i + 1 < kv.length; i += 2) {
			if (kv[i + 1] != null) {
				map.put(String.valueOf(kv[i]), kv[i + 1]);
			}
		}
		return map;
	}
}
