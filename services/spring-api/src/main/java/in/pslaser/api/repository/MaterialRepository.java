package in.pslaser.api.repository;

import in.pslaser.api.domain.Material;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {

	Optional<Material> findByCodeIgnoreCase(String code);

	List<Material> findAllByOrderByIdAsc();
}
