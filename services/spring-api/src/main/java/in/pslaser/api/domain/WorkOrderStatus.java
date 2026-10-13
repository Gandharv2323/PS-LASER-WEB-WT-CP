package in.pslaser.api.domain;

import java.util.Arrays;

/** Shop-floor stages of a job; values match the MySQL ENUM on {@code work_orders.status}. */
public enum WorkOrderStatus {
	RECEIVED, CUTTING, BENDING, WELDING, COATING, INSPECTION, DISPATCHED;

	/** lower-case value stored in MySQL */
	public String db() {
		return name().toLowerCase();
	}

	public static WorkOrderStatus fromDb(String value) {
		return Arrays.stream(values())
				.filter(s -> s.db().equalsIgnoreCase(value))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Unknown work-order status: " + value));
	}

	public static boolean isValid(String value) {
		return value != null && Arrays.stream(values()).anyMatch(s -> s.db().equalsIgnoreCase(value));
	}
}
