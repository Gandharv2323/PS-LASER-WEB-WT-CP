package in.pslaser.api.repository;

import in.pslaser.api.domain.Machine;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MachineRepository extends JpaRepository<Machine, Long> {

	/** derived query: SELECT ... ORDER BY sort_order */
	List<Machine> findAllByOrderBySortOrderAsc();

	Optional<Machine> findBySlug(String slug);
}
