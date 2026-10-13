package in.pslaser.api.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Customer job in {@code work_orders}; one-to-many with {@link WorkOrderEvent} (status history). */
@Entity
@Table(name = "work_orders")
public class WorkOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name = "order_no", nullable = false, unique = true, length = 30)
	private String orderNo;
	@Column(name = "customer_name", nullable = false)
	private String customerName;
	@Column(name = "customer_phone", nullable = false)
	private String customerPhone;
	@Column(nullable = false)
	private String description;
	@Column(name = "machine_slug")
	private String machineSlug;
	private int quantity = 1;
	/** stored lower-case, see {@link WorkOrderStatus#db()} */
	@Column(nullable = false)
	private String status = WorkOrderStatus.RECEIVED.db();
	@Column(name = "due_date")
	private LocalDate dueDate;
	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("id ASC")
	private List<WorkOrderEvent> events = new ArrayList<>();

	public void addEvent(WorkOrderEvent event) {
		event.setWorkOrder(this);
		events.add(event);
	}

	public Long getId() { return id; }
	public String getOrderNo() { return orderNo; }
	public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
	public String getCustomerName() { return customerName; }
	public void setCustomerName(String customerName) { this.customerName = customerName; }
	public String getCustomerPhone() { return customerPhone; }
	public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public String getMachineSlug() { return machineSlug; }
	public void setMachineSlug(String machineSlug) { this.machineSlug = machineSlug; }
	public int getQuantity() { return quantity; }
	public void setQuantity(int quantity) { this.quantity = quantity; }
	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }
	public LocalDate getDueDate() { return dueDate; }
	public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public List<WorkOrderEvent> getEvents() { return events; }
}
