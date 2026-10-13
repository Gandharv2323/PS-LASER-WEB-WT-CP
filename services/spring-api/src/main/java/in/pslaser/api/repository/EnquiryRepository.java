package in.pslaser.api.repository;

import in.pslaser.api.domain.Enquiry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

	List<Enquiry> findAllByOrderByCreatedAtDescIdDesc();

	List<Enquiry> findByStatusOrderByCreatedAtDescIdDesc(String status);
}
