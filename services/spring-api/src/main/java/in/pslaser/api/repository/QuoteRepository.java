package in.pslaser.api.repository;

import in.pslaser.api.domain.Quote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

	List<Quote> findByCustomerPhoneOrderByIdDesc(String customerPhone);

	/** highest quote number issued today, e.g. PSL-Q-20261013-0007 (used to compute the next one) */
	@Query("select max(q.quoteNo) from Quote q where q.quoteNo like concat(:prefix, '%')")
	Optional<String> findMaxQuoteNoWithPrefix(@Param("prefix") String prefix);
}
