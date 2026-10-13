package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "materials")
public class Material {

	@Id
	private Long id;
	private String code;
	private String name;
	@Column(name = "max_thickness_mm", precision = 5, scale = 2)
	private BigDecimal maxThicknessMm;
	@Column(name = "density_g_cm3", precision = 5, scale = 2)
	private BigDecimal densityGCm3;

	protected Material() {
	}

	public Material(Long id, String code, String name, BigDecimal maxThicknessMm, BigDecimal densityGCm3) {
		this.id = id;
		this.code = code;
		this.name = name;
		this.maxThicknessMm = maxThicknessMm;
		this.densityGCm3 = densityGCm3;
	}

	public Long getId() { return id; }
	public String getCode() { return code; }
	public String getName() { return name; }
	public BigDecimal getMaxThicknessMm() { return maxThicknessMm; }
	public BigDecimal getDensityGCm3() { return densityGCm3; }
}
