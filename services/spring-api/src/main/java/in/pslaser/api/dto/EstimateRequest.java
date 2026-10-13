package in.pslaser.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Estimate inputs (CONTRACT "Price estimate formula"). Bean Validation covers the static
 * rules; material-specific rules (max thickness, rate band) are checked in EstimateService.
 */
public record EstimateRequest(
		@NotBlank String materialCode,
		@NotNull @Positive BigDecimal thicknessMm,
		@NotNull @Positive @DecimalMax(value = "3000", message = "must be at most 3000 mm (laser bed)") BigDecimal lengthMm,
		@NotNull @Positive @DecimalMax(value = "1500", message = "must be at most 1500 mm (laser bed)") BigDecimal widthMm,
		@NotNull @PositiveOrZero BigDecimal cutLengthMm,
		@PositiveOrZero Integer pierces,
		@PositiveOrZero Integer bends,
		Boolean powderCoat,
		@NotNull @Min(1) @Max(100000) Integer quantity) {

	public int piercesOrDefault() {
		return pierces == null ? 1 : pierces;
	}

	public int bendsOrDefault() {
		return bends == null ? 0 : bends;
	}

	public boolean powderCoatOrDefault() {
		return Boolean.TRUE.equals(powderCoat);
	}
}
