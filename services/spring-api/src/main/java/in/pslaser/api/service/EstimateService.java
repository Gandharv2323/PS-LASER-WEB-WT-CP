package in.pslaser.api.service;

import in.pslaser.api.domain.Material;
import in.pslaser.api.domain.Rate;
import in.pslaser.api.domain.Setting;
import in.pslaser.api.dto.EstimateRequest;
import in.pslaser.api.dto.EstimateResponse;
import in.pslaser.api.event.DomainEvents.EstimateCalculated;
import in.pslaser.api.repository.MaterialRepository;
import in.pslaser.api.repository.RateRepository;
import in.pslaser.api.repository.SettingRepository;
import in.pslaser.api.web.ApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Laser-cutting price estimate - the CONTRACT formula, identical in PHP, Spring, JSP and Next.
 * All money maths in {@link BigDecimal} (no binary floating-point rounding errors).
 */
@Service
@Transactional(readOnly = true)
public class EstimateService {

	static final BigDecimal BED_LENGTH_MM = new BigDecimal("3000");
	static final BigDecimal BED_WIDTH_MM = new BigDecimal("1500");
	private static final BigDecimal MILLION = new BigDecimal("1000000");
	private static final BigDecimal THOUSAND = new BigDecimal("1000");
	private static final BigDecimal HUNDRED = new BigDecimal("100");
	private static final BigDecimal TWO = new BigDecimal("2");

	private final MaterialRepository materials;
	private final RateRepository rates;
	private final SettingRepository settings;
	private final ApplicationEventPublisher events;

	public EstimateService(MaterialRepository materials, RateRepository rates, SettingRepository settings,
			ApplicationEventPublisher events) {
		this.materials = materials;
		this.rates = rates;
		this.settings = settings;
		this.events = events;
	}

	/** Public endpoint: compute + publish an EstimateCalculated event (activity log). */
	public EstimateResponse estimate(EstimateRequest in) {
		EstimateResponse out = compute(in);
		events.publishEvent(new EstimateCalculated(out.materialCode(), out.thicknessMm(), out.quantity(), out.total()));
		return out;
	}

	public EstimateResponse compute(EstimateRequest in) {
		// 1. validate
		Material material = materials.findByCodeIgnoreCase(in.materialCode().trim())
				.orElseThrow(() -> ApiException.badRequest("Unknown material code: " + in.materialCode()));
		BigDecimal t = in.thicknessMm();
		if (t.signum() <= 0 || t.compareTo(material.getMaxThicknessMm()) > 0) {
			throw ApiException.badRequest("thicknessMm must be > 0 and <= " + material.getMaxThicknessMm().stripTrailingZeros().toPlainString()
					+ " mm for " + material.getName());
		}
		if (in.quantity() == null || in.quantity() < 1) {
			throw ApiException.badRequest("quantity must be at least 1");
		}
		if (in.lengthMm().signum() <= 0 || in.widthMm().signum() <= 0
				|| in.lengthMm().compareTo(BED_LENGTH_MM) > 0 || in.widthMm().compareTo(BED_WIDTH_MM) > 0) {
			throw ApiException.badRequest("Part must fit the 3000 x 1500 mm laser bed");
		}
		// 2. rate band
		Rate rate = rates.findBand(material.getCode(), t)
				.orElseThrow(() -> ApiException.badRequest("No rate band for " + material.getCode() + " at "
						+ t.stripTrailingZeros().toPlainString() + " mm"));

		BigDecimal bendRate = setting("bend_rate_inr", "0");
		BigDecimal coatRate = setting("powder_coat_rate_per_sqm", "0");
		BigDecimal gstPercent = setting("gst_percent", "18");
		boolean isSample = !"0".equals(settings.findById("rates_are_sample").map(Setting::getValue).orElse("1").trim());

		// 3-9: each breakdown line is rounded to 2 dp (HALF_UP) - same rule as the PHP/JSP/Next estimators
		BigDecimal areaM2 = in.lengthMm().multiply(in.widthMm()).divide(MILLION);
		BigDecimal weightKg = areaM2.multiply(t).multiply(material.getDensityGCm3());
		BigDecimal materialCost = money(weightKg.multiply(rate.getMaterialRatePerKg()));
		BigDecimal cutting = money(in.cutLengthMm().divide(THOUSAND).multiply(rate.getCutRatePerM()));
		BigDecimal piercing = money(BigDecimal.valueOf(in.piercesOrDefault()).multiply(rate.getPierceRate()));
		BigDecimal bending = money(BigDecimal.valueOf(in.bendsOrDefault()).multiply(bendRate));
		BigDecimal coating = money(in.powderCoatOrDefault() ? areaM2.multiply(TWO).multiply(coatRate) : BigDecimal.ZERO);

		// 10-11: perPart = sum of rounded lines; subtotal, gst rounded; total = subtotal + gst
		BigDecimal perPart = money(materialCost.add(cutting).add(piercing).add(bending).add(coating));
		BigDecimal subtotal = money(perPart.multiply(BigDecimal.valueOf(in.quantity())));
		BigDecimal gst = money(subtotal.multiply(gstPercent).divide(HUNDRED));
		BigDecimal total = money(subtotal.add(gst));

		return new EstimateResponse(material.getCode(), t.stripTrailingZeros(), in.quantity(),
				new EstimateResponse.Breakdown(materialCost, cutting, piercing, bending, coating),
				perPart, subtotal, gst, total, "INR", isSample);
	}

	private BigDecimal setting(String key, String fallback) {
		String v = settings.findById(key).map(Setting::getValue).orElse(fallback);
		try {
			return new BigDecimal(v.trim());
		}
		catch (NumberFormatException ex) {
			return new BigDecimal(fallback);
		}
	}

	static BigDecimal money(BigDecimal v) {
		return v.setScale(2, RoundingMode.HALF_UP);
	}
}
