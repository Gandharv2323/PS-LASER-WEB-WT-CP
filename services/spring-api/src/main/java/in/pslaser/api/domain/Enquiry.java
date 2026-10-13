package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** Read-only view of {@code enquiries} (written by the Node/PHP/Next enquiry forms). */
@Entity
@Table(name = "enquiries")
public class Enquiry {

	@Id
	private Long id;
	private String name;
	private String phone;
	private String email;
	@Column(name = "service_slug")
	private String serviceSlug;
	@Column(name = "machine_slug")
	private String machineSlug;
	@Column(columnDefinition = "text")
	private String message;
	private String source;
	private String status;
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public String getName() { return name; }
	public String getPhone() { return phone; }
	public String getEmail() { return email; }
	public String getServiceSlug() { return serviceSlug; }
	public String getMachineSlug() { return machineSlug; }
	public String getMessage() { return message; }
	public String getSource() { return source; }
	public String getStatus() { return status; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
