package in.pslaser.api.event;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Application events (in-process messaging). Services publish them with
 * {@code ApplicationEventPublisher}; {@link ActivityEventListener} consumes them asynchronously.
 * Publisher and consumers never reference each other - loose coupling.
 */
public final class DomainEvents {

	private DomainEvents() {
	}

	public record UserLoggedIn(Long userId, String email, String role, boolean success) {
	}

	public record UserRegistered(Long userId, String email) {
	}

	public record EstimateCalculated(String materialCode, BigDecimal thicknessMm, int quantity, BigDecimal total) {
	}

	public record QuoteSaved(String quoteNo, String customerPhone, BigDecimal amountInr) {
	}

	/** Fired inside the @Transactional status update; delivered AFTER the transaction commits. */
	public record WorkOrderStatusChanged(Long workOrderId, String orderNo, String fromStatus, String toStatus,
			String note, String changedBy, Instant at) {
	}
}
