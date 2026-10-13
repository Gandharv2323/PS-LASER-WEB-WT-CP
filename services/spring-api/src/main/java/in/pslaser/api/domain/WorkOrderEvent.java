package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** One status-history row in {@code work_order_events}. */
@Entity
@Table(name = "work_order_events")
public class WorkOrderEvent {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "work_order_id", nullable = false)
	private WorkOrder workOrder;

	@Column(nullable = false, length = 20)
	private String status;

	private String note;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	protected WorkOrderEvent() {
	}

	public WorkOrderEvent(String status, String note) {
		this.status = status;
		this.note = note;
	}

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public Long getId() { return id; }
	public WorkOrder getWorkOrder() { return workOrder; }
	void setWorkOrder(WorkOrder workOrder) { this.workOrder = workOrder; }
	public String getStatus() { return status; }
	public String getNote() { return note; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
