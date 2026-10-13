package in.pslaser.api.web;

import in.pslaser.api.dto.WorkOrderDtos.WorkOrderDto;
import in.pslaser.api.service.WorkOrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TrackingController {

	private final WorkOrderService workOrders;

	public TrackingController(WorkOrderService workOrders) {
		this.workOrders = workOrders;
	}

	/** GET /api/work-orders/track?orderNo=PSL-DEMO-001&amp;phone=9000000001 -> order + events */
	@GetMapping("/api/work-orders/track")
	public WorkOrderDto track(@RequestParam String orderNo, @RequestParam String phone) {
		return workOrders.track(orderNo, phone);
	}
}
