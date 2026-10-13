package in.pslaser.api.activity;

import in.pslaser.api.web.ApiException;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Writes/reads the MongoDB activity log. Writes degrade gracefully: if MongoDB is not
 * reachable a warning is logged and the calling feature (login, estimate, status change)
 * still succeeds.
 */
@Service
public class ActivityService {

	private static final Logger log = LoggerFactory.getLogger(ActivityService.class);

	private final ActivityLogRepository repository;

	public ActivityService(ActivityLogRepository repository) {
		this.repository = repository;
	}

	public void record(String type, String actor, String message, Map<String, Object> details) {
		try {
			repository.save(new ActivityLog(type, actor, message, details));
			log.debug("activity {} by {}: {}", type, actor, message);
		}
		catch (RuntimeException ex) { // DataAccessException, MongoTimeoutException, ...
			log.warn("Activity log unavailable (MongoDB down?) - skipped {} event: {}", type, ex.getMessage());
		}
	}

	public List<ActivityLog> recent(String type, int limit) {
		PageRequest page = PageRequest.of(0, Math.max(1, Math.min(limit, 500)));
		try {
			return (type == null || type.isBlank())
					? repository.findAllByOrderByAtDesc(page)
					: repository.findByTypeOrderByAtDesc(type.toUpperCase(), page);
		}
		catch (RuntimeException ex) { // DataAccessException, MongoTimeoutException, ...
			log.warn("Activity log unavailable: {}", ex.getMessage());
			throw ApiException.unavailable("Activity log (MongoDB) is not reachable right now");
		}
	}
}
