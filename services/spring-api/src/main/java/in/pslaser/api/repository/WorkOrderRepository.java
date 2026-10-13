package in.pslaser.api.repository;

import in.pslaser.api.domain.WorkOrder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

	/** derived query + entity graph so the status history is fetched in the same SELECT */
	@EntityGraph(attributePaths = "events")
	Optional<WorkOrder> findByOrderNoIgnoreCase(String orderNo);

	@EntityGraph(attributePaths = "events")
	Optional<WorkOrder> findWithEventsById(Long id);

	List<WorkOrder> findAllByOrderByIdDesc();

	List<WorkOrder> findByStatusOrderByIdDesc(String status);

	boolean existsByOrderNoIgnoreCase(String orderNo);

	@Query("select max(w.orderNo) from WorkOrder w where w.orderNo like concat(:prefix, '%')")
	Optional<String> findMaxOrderNoWithPrefix(@Param("prefix") String prefix);
}
