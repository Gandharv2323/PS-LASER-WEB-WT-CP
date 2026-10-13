package in.pslaser.api.web;

import in.pslaser.api.activity.ActivityLog;
import in.pslaser.api.activity.ActivityService;
import in.pslaser.api.dto.EnquiryDto;
import in.pslaser.api.service.EnquiryService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
public class AdminController {

	private final EnquiryService enquiries;
	private final ActivityService activity;

	public AdminController(EnquiryService enquiries, ActivityService activity) {
		this.enquiries = enquiries;
		this.activity = activity;
	}

	/** Enquiries from MySQL (SQL). Optional ?status=new|contacted|quoted|won|lost */
	@GetMapping("/enquiries")
	public List<EnquiryDto> enquiries(@RequestParam(required = false) String status) {
		return enquiries.list(status);
	}

	/** Activity log from MongoDB (NoSQL). Optional ?type=LOGIN|ESTIMATE|QUOTE_SAVED|STATUS_CHANGED&amp;limit=50 */
	@GetMapping("/activity")
	public List<ActivityLog> activity(@RequestParam(required = false) String type,
			@RequestParam(defaultValue = "50") int limit) {
		return activity.recent(type, limit);
	}
}
