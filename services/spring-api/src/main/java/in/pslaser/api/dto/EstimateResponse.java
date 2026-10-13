package in.pslaser.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/** Exact JSON shape required by services/CONTRACT.md. */
public record EstimateResponse(
		String materialCode,
		BigDecimal thicknessMm,
		int quantity,
		Breakdown breakdown,
		BigDecimal perPart,
		BigDecimal subtotal,
		BigDecimal gst,
		BigDecimal total,
		String currency,
		@JsonProperty("isSample") boolean isSample) {

	public record Breakdown(BigDecimal material, BigDecimal cutting, BigDecimal piercing, BigDecimal bending,
			BigDecimal coating) {
	}
}
