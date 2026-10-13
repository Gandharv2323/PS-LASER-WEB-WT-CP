package in.pslaser.api.service;

import in.pslaser.api.dto.EnquiryDto;
import in.pslaser.api.repository.EnquiryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EnquiryService {

	private final EnquiryRepository enquiries;

	public EnquiryService(EnquiryRepository enquiries) {
		this.enquiries = enquiries;
	}

	public List<EnquiryDto> list(String status) {
		var rows = (status == null || status.isBlank())
				? enquiries.findAllByOrderByCreatedAtDescIdDesc()
				: enquiries.findByStatusOrderByCreatedAtDescIdDesc(status.toLowerCase());
		return rows.stream().map(EnquiryDto::from).toList();
	}
}
