package in.pslaser.api.dto;

import in.pslaser.api.domain.Enquiry;
import java.time.LocalDateTime;

public record EnquiryDto(Long id, String name, String phone, String email, String serviceSlug, String machineSlug,
		String message, String source, String status, LocalDateTime createdAt) {

	public static EnquiryDto from(Enquiry e) {
		return new EnquiryDto(e.getId(), e.getName(), e.getPhone(), e.getEmail(), e.getServiceSlug(),
				e.getMachineSlug(), e.getMessage(), e.getSource(), e.getStatus(), e.getCreatedAt());
	}
}
