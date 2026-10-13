package in.pslaser.api.repository;

import in.pslaser.api.domain.ServiceOffering;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {

	List<ServiceOffering> findAllByOrderBySortOrderAsc();
}
