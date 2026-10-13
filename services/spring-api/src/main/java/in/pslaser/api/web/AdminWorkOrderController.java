package in.pslaser.api.web;

import in.pslaser.api.dto.WorkOrderDtos.StatusEventRequest;
import in.pslaser.api.dto.WorkOrderDtos.WorkOrderDto;
import in.pslaser.api.dto.WorkOrderDtos.WorkOrderRequest;
import in.pslaser.api.security.AuthUser;
import in.pslaser.api.service.WorkOrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Staff/admin work-order desk. Method security duplicates the URL rule (defence in depth). */
@RestController
@RequestMapping("/api/admin/work-orders")
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
public class AdminWorkOrderController {

	private final WorkOrderService workOrders;

	public AdminWorkOrderController(WorkOrderService workOrders) {
		this.workOrders = workOrders;
	}

	@GetMapping
	public List<WorkOrderDto> list(@RequestParam(required = false) String status) {
		return workOrders.list(status);
	}

	@GetMapping("/{id}")
	public WorkOrderDto get(@PathVariable Long id) {
		return workOrders.get(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public WorkOrderDto create(@Valid @RequestBody WorkOrderRequest req, @AuthenticationPrincipal AuthUser me) {
		return workOrders.create(req, me.email());
	}

	@PutMapping("/{id}")
	public WorkOrderDto update(@PathVariable Long id, @Valid @RequestBody WorkOrderRequest req,
			@AuthenticationPrincipal AuthUser me) {
		return workOrders.update(id, req, me.email());
	}

	@PostMapping("/{id}/events")
	@ResponseStatus(HttpStatus.CREATED)
	public WorkOrderDto addEvent(@PathVariable Long id, @Valid @RequestBody StatusEventRequest req,
			@AuthenticationPrincipal AuthUser me) {
		return workOrders.addEvent(id, req, me.email());
	}
}
