package in.pslaser.api.activity;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * NoSQL side of the project: a schema-less MongoDB document (collection {@code activity_log})
 * for audit events - logins, estimates, saved quotes, work-order status changes. The
 * {@code details} map can hold different keys per event type, which is awkward in SQL.
 */
@Document(collection = "activity_log")
public class ActivityLog {

	@Id
	private String id;
	@Indexed
	private String type;
	private String actor;
	private String message;
	private Map<String, Object> details;
	@Indexed
	private Instant at;

	public ActivityLog() {
	}

	public ActivityLog(String type, String actor, String message, Map<String, Object> details) {
		this.type = type;
		this.actor = actor;
		this.message = message;
		this.details = details;
		this.at = Instant.now();
	}

	public String getId() { return id; }
	public String getType() { return type; }
	public String getActor() { return actor; }
	public String getMessage() { return message; }
	public Map<String, Object> getDetails() { return details; }
	public Instant getAt() { return at; }
}
