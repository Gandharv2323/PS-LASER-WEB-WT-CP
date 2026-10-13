package in.pslaser.api.dto;

import in.pslaser.api.domain.WorkOrder;
import in.pslaser.api.domain.WorkOrderEvent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class WorkOrderDtos {

	private WorkOrderDtos() {
	}

	static final String STATUS_REGEX = "(?i)received|cutting|bending|welding|coating|inspection|dispatched";
	static final String STATUS_MSG = "must be one of received, cutting, bending, welding, coating, inspection, dispatched";

	public record EventDto(Long id, String status, String note, LocalDateTime createdAt) {

		public static EventDto from(WorkOrderEvent e) {
			return new EventDto(e.getId(), e.getStatus(), e.getNote(), e.getCreatedAt());
		}
	}

	public record WorkOrderDto(Long id, String orderNo, String customerName, String customerPhone, String description,
			String machineSlug, int quantity, String status, LocalDate dueDate, LocalDateTime createdAt,
			LocalDateTime updatedAt, List<EventDto> events) {

		public static WorkOrderDto from(WorkOrder w) {
			return of(w, w.getCustomerPhone());
		}

		/** Public tracking view: phone masked to the last 4 digits. */
		public static WorkOrderDto publicView(WorkOrder w) {
			String p = w.getCustomerPhone();
			String masked = p == null || p.length() < 4 ? "****" : "******" + p.substring(p.length() - 4);
			return of(w, masked);
		}

		private static WorkOrderDto of(WorkOrder w, String phone) {
			return new WorkOrderDto(w.getId(), w.getOrderNo(), w.getCustomerName(), phone, w.getDescription(),
					w.getMachineSlug(), w.getQuantity(), w.getStatus(), w.getDueDate(), w.getCreatedAt(),
					w.getUpdatedAt(), w.getEvents().stream().map(EventDto::from).toList());
		}
	}

	/** POST (create) and PUT (update) body for /api/admin/work-orders. */
	public record WorkOrderRequest(
			@Size(max = 30) String orderNo,
			@NotBlank @Size(max = 120) String customerName,
			@NotBlank @Pattern(regexp = "^[0-9+\\- ]{10,20}$", message = "must be a valid phone number (10-20 digits)") String customerPhone,
			@NotBlank @Size(max = 255) String description,
			@Size(max = 80) String machineSlug,
			@Min(1) @Max(1000000) Integer quantity,
			@Pattern(regexp = STATUS_REGEX, message = STATUS_MSG) String status,
			LocalDate dueDate,
			@Size(max = 255) String note) {
	}

	/** POST /api/admin/work-orders/{id}/events body. */
	public record StatusEventRequest(
			@NotBlank @Pattern(regexp = STATUS_REGEX, message = STATUS_MSG) String status,
			@Size(max = 255) String note) {
	}
}
