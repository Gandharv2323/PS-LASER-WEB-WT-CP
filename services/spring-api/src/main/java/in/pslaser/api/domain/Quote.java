package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

/** A saved (indicative) quote in the shared {@code quotes} table. */
@Entity
@Table(name = "quotes")
public class Quote {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name = "quote_no", nullable = false, unique = true, length = 30)
	private String quoteNo;
	@Column(name = "customer_name")
	private String customerName;
	@Column(name = "customer_phone")
	private String customerPhone;
	@Column(name = "material_code")
	private String materialCode;
	@Column(name = "thickness_mm", precision = 5, scale = 2)
	private BigDecimal thicknessMm;
	@Column(name = "length_mm", precision = 8, scale = 2)
	private BigDecimal lengthMm;
	@Column(name = "width_mm", precision = 8, scale = 2)
	private BigDecimal widthMm;
	@Column(name = "cut_length_mm", precision = 10, scale = 2)
	private BigDecimal cutLengthMm;
	private int pierces;
	private int bends;
	@Column(name = "powder_coat")
	private boolean powderCoat;
	private int quantity;
	@Column(name = "amount_inr", precision = 12, scale = 2)
	private BigDecimal amountInr;
	@Column(name = "is_estimate")
	private boolean estimate = true;
	private String source = "spring";
	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public String getQuoteNo() { return quoteNo; }
	public void setQuoteNo(String quoteNo) { this.quoteNo = quoteNo; }
	public String getCustomerName() { return customerName; }
	public void setCustomerName(String customerName) { this.customerName = customerName; }
	public String getCustomerPhone() { return customerPhone; }
	public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
	public String getMaterialCode() { return materialCode; }
	public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }
	public BigDecimal getThicknessMm() { return thicknessMm; }
	public void setThicknessMm(BigDecimal thicknessMm) { this.thicknessMm = thicknessMm; }
	public BigDecimal getLengthMm() { return lengthMm; }
	public void setLengthMm(BigDecimal lengthMm) { this.lengthMm = lengthMm; }
	public BigDecimal getWidthMm() { return widthMm; }
	public void setWidthMm(BigDecimal widthMm) { this.widthMm = widthMm; }
	public BigDecimal getCutLengthMm() { return cutLengthMm; }
	public void setCutLengthMm(BigDecimal cutLengthMm) { this.cutLengthMm = cutLengthMm; }
	public int getPierces() { return pierces; }
	public void setPierces(int pierces) { this.pierces = pierces; }
	public int getBends() { return bends; }
	public void setBends(int bends) { this.bends = bends; }
	public boolean isPowderCoat() { return powderCoat; }
	public void setPowderCoat(boolean powderCoat) { this.powderCoat = powderCoat; }
	public int getQuantity() { return quantity; }
	public void setQuantity(int quantity) { this.quantity = quantity; }
	public BigDecimal getAmountInr() { return amountInr; }
	public void setAmountInr(BigDecimal amountInr) { this.amountInr = amountInr; }
	public boolean isEstimate() { return estimate; }
	public String getSource() { return source; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
