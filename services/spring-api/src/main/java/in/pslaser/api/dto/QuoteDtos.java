package in.pslaser.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import in.pslaser.api.domain.Quote;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class QuoteDtos {

	private QuoteDtos() {
	}

	/** POST /api/quotes body = estimate inputs + customer details. */
	public record SaveQuoteRequest(
			@NotBlank String materialCode,
			@NotNull @Positive BigDecimal thicknessMm,
			@NotNull @Positive @DecimalMax(value = "3000", message = "must be at most 3000 mm (laser bed)") BigDecimal lengthMm,
			@NotNull @Positive @DecimalMax(value = "1500", message = "must be at most 1500 mm (laser bed)") BigDecimal widthMm,
			@NotNull @PositiveOrZero BigDecimal cutLengthMm,
			@PositiveOrZero Integer pierces,
			@PositiveOrZero Integer bends,
			Boolean powderCoat,
			@NotNull @Min(1) @Max(100000) Integer quantity,
			@NotBlank @Size(max = 120) String customerName,
			@NotBlank @Pattern(regexp = "^[0-9+\\- ]{10,20}$", message = "must be a valid phone number (10-20 digits)") String customerPhone) {

		public EstimateRequest toEstimateRequest() {
			return new EstimateRequest(materialCode, thicknessMm, lengthMm, widthMm, cutLengthMm, pierces, bends,
					powderCoat, quantity);
		}
	}

	@JsonInclude(JsonInclude.Include.NON_NULL)
	public record QuoteDto(Long id, String quoteNo, String customerName, String customerPhone, String materialCode,
			BigDecimal thicknessMm, BigDecimal lengthMm, BigDecimal widthMm, BigDecimal cutLengthMm, int pierces,
			int bends, boolean powderCoat, int quantity, BigDecimal amountInr,
			@JsonProperty("isEstimate") boolean isEstimate, String source, LocalDateTime createdAt,
			EstimateResponse estimate) {

		public static QuoteDto from(Quote q, EstimateResponse estimate) {
			return new QuoteDto(q.getId(), q.getQuoteNo(), q.getCustomerName(), q.getCustomerPhone(),
					q.getMaterialCode(), q.getThicknessMm(), q.getLengthMm(), q.getWidthMm(), q.getCutLengthMm(),
					q.getPierces(), q.getBends(), q.isPowderCoat(), q.getQuantity(), q.getAmountInr(), q.isEstimate(),
					q.getSource(), q.getCreatedAt(), estimate);
		}
	}
}
