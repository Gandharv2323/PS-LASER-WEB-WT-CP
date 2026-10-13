package in.pslaser.api.service;

import in.pslaser.api.domain.WorkOrder;
import in.pslaser.api.domain.WorkOrderEvent;
import in.pslaser.api.domain.WorkOrderStatus;
import in.pslaser.api.dto.WorkOrderDtos.StatusEventRequest;
import in.pslaser.api.dto.WorkOrderDtos.WorkOrderDto;
import in.pslaser.api.dto.WorkOrderDtos.WorkOrderRequest;
import in.pslaser.api.event.DomainEvents.WorkOrderStatusChanged;
import in.pslaser.api.repository.WorkOrderRepository;
import in.pslaser.api.web.ApiException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Work-order use cases. Status changes are {@code @Transactional}: the {@code work_orders}
 * update and the {@code work_order_events} insert commit together or not at all.
 */
@Service
public class WorkOrderService {

	private final WorkOrderRepository orders;
	private final ApplicationEventPublisher events;

	public WorkOrderService(WorkOrderRepository orders, ApplicationEventPublisher events) {
		this.orders = orders;
		this.events = events;
	}

	/** Public tracking: order number + matching phone, otherwise 404 (does not reveal which one was wrong). */
	@Transactional(readOnly = true)
	public WorkOrderDto track(String orderNo, String phone) {
		WorkOrder w = orders.findByOrderNoIgnoreCase(orderNo.trim())
				.filter(o -> !digits(phone).isEmpty() && lastTen(digits(o.getCustomerPhone())).equals(lastTen(digits(phone))))
				.orElseThrow(() -> ApiException.notFound("No order found for that order number and phone"));
		return WorkOrderDto.publicView(w);
	}

	@Transactional(readOnly = true)
	public List<WorkOrderDto> list(String status) {
		List<WorkOrder> rows = (status == null || status.isBlank()) ? orders.findAllByOrderByIdDesc()
				: orders.findByStatusOrderByIdDesc(WorkOrderStatus.fromDb(status).db());
		return rows.stream().map(WorkOrderDto::from).toList();
	}

	@Transactional(readOnly = true)
	public WorkOrderDto get(Long id) {
		return WorkOrderDto.from(load(id));
	}

	@Transactional
	public WorkOrderDto create(WorkOrderRequest req, String actor) {
		String orderNo = (req.orderNo() == null || req.orderNo().isBlank()) ? nextOrderNo() : req.orderNo().trim();
		if (orders.existsByOrderNoIgnoreCase(orderNo)) {
			throw ApiException.conflict("Order number already exists: " + orderNo);
		}
		WorkOrder w = new WorkOrder();
		w.setOrderNo(orderNo);
		apply(w, req);
		String status = req.status() == null ? WorkOrderStatus.RECEIVED.db() : WorkOrderStatus.fromDb(req.status()).db();
		w.setStatus(status);
		w.addEvent(new WorkOrderEvent(status, req.note() == null ? "Work order created" : req.note()));
		WorkOrder saved = orders.save(w);
		events.publishEvent(new WorkOrderStatusChanged(saved.getId(), saved.getOrderNo(), null, status,
				"created", actor, Instant.now()));
		return WorkOrderDto.from(saved);
	}

	/** PUT: edit details; if the status changed, also insert a history row and publish the event. */
	@Transactional
	public WorkOrderDto update(Long id, WorkOrderRequest req, String actor) {
		WorkOrder w = load(id);
		apply(w, req);
		if (req.orderNo() != null && !req.orderNo().isBlank() && !req.orderNo().equalsIgnoreCase(w.getOrderNo())) {
			if (orders.existsByOrderNoIgnoreCase(req.orderNo().trim())) {
				throw ApiException.conflict("Order number already exists: " + req.orderNo());
			}
			w.setOrderNo(req.orderNo().trim());
		}
		if (req.status() != null && !WorkOrderStatus.fromDb(req.status()).db().equals(w.getStatus())) {
			changeStatus(w, WorkOrderStatus.fromDb(req.status()).db(), req.note(), actor);
		}
		return WorkOrderDto.from(orders.saveAndFlush(w));
	}

	/** POST /{id}/events: move the job to a new stage (or add a note at the same stage). */
	@Transactional
	public WorkOrderDto addEvent(Long id, StatusEventRequest req, String actor) {
		WorkOrder w = load(id);
		changeStatus(w, WorkOrderStatus.fromDb(req.status()).db(), req.note(), actor);
		return WorkOrderDto.from(orders.saveAndFlush(w));
	}

	private void changeStatus(WorkOrder w, String newStatus, String note, String actor) {
		String old = w.getStatus();
		w.setStatus(newStatus);
		w.addEvent(new WorkOrderEvent(newStatus, note));
		events.publishEvent(new WorkOrderStatusChanged(w.getId(), w.getOrderNo(), old, newStatus, note, actor,
				Instant.now()));
	}

	private void apply(WorkOrder w, WorkOrderRequest req) {
		w.setCustomerName(req.customerName().trim());
		w.setCustomerPhone(req.customerPhone().trim());
		w.setDescription(req.description().trim());
		w.setMachineSlug(req.machineSlug());
		w.setQuantity(req.quantity() == null ? 1 : req.quantity());
		w.setDueDate(req.dueDate());
	}

	private WorkOrder load(Long id) {
		return orders.findWithEventsById(id).orElseThrow(() -> ApiException.notFound("Work order not found: " + id));
	}

	private String nextOrderNo() {
		String prefix = "PSL-WO-" + LocalDate.now(ZoneId.of("Asia/Kolkata")).format(DateTimeFormatter.BASIC_ISO_DATE) + "-";
		int next = orders.findMaxOrderNoWithPrefix(prefix)
				.map(max -> Integer.parseInt(max.substring(prefix.length())) + 1).orElse(1);
		return prefix + String.format("%03d", next);
	}

	private static String digits(String s) {
		return s == null ? "" : s.replaceAll("\\D", "");
	}

	private static String lastTen(String digits) {
		return digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
	}
}
