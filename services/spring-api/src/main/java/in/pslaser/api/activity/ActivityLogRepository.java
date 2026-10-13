package in.pslaser.api.activity;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Spring Data MongoDB repository - same derived-query style as JPA, different store. */
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {

	List<ActivityLog> findAllByOrderByAtDesc(Pageable page);

	List<ActivityLog> findByTypeOrderByAtDesc(String type, Pageable page);
}
