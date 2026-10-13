package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/** One row of the estimator rate card (SAMPLE prices while settings.rates_are_sample = '1'). */
@Entity
@Table(name = "rates")
public class Rate {

	@Id
	private Long id;
	@Column(name = "material_code")
	private String materialCode;
	@Column(name = "thickness_from_mm", precision = 5, scale = 2)
	private BigDecimal thicknessFromMm;
	@Column(name = "thickness_to_mm", precision = 5, scale = 2)
	private BigDecimal thicknessToMm;
	@Column(name = "cut_rate_per_m", precision = 10, scale = 2)
	private BigDecimal cutRatePerM;
	@Column(name = "pierce_rate", precision = 10, scale = 2)
	private BigDecimal pierceRate;
	@Column(name = "material_rate_per_kg", precision = 10, scale = 2)
	private BigDecimal materialRatePerKg;
	@Column(name = "is_sample")
	private boolean sample;

	protected Rate() {
	}

	public Rate(String materialCode, BigDecimal from, BigDecimal to, BigDecimal cutRatePerM,
			BigDecimal pierceRate, BigDecimal materialRatePerKg) {
		this.materialCode = materialCode;
		this.thicknessFromMm = from;
		this.thicknessToMm = to;
		this.cutRatePerM = cutRatePerM;
		this.pierceRate = pierceRate;
		this.materialRatePerKg = materialRatePerKg;
		this.sample = true;
	}

	public Long getId() { return id; }
	public String getMaterialCode() { return materialCode; }
	public BigDecimal getThicknessFromMm() { return thicknessFromMm; }
	public BigDecimal getThicknessToMm() { return thicknessToMm; }
	public BigDecimal getCutRatePerM() { return cutRatePerM; }
	public BigDecimal getPierceRate() { return pierceRate; }
	public BigDecimal getMaterialRatePerKg() { return materialRatePerKg; }
	public boolean isSample() { return sample; }
}
