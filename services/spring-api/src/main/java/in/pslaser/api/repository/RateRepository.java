package in.pslaser.api.repository;

import in.pslaser.api.domain.Rate;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RateRepository extends JpaRepository<Rate, Long> {

	/**
	 * Custom JPQL query (contract step 2): the rate-card row whose thickness band contains the
	 * requested thickness - {@code thickness BETWEEN thickness_from_mm AND thickness_to_mm}.
	 */
	@Query("""
			select r from Rate r
			where upper(r.materialCode) = upper(:code)
			  and :thickness between r.thicknessFromMm and r.thicknessToMm
			""")
	Optional<Rate> findBand(@Param("code") String materialCode, @Param("thickness") BigDecimal thicknessMm);

	long countBySampleTrue();
}
