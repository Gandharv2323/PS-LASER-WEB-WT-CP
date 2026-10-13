package com.pslaser.desk.model;

import java.io.Serializable;
import java.math.BigDecimal;

/** MODEL - result of EstimateService; field names follow the CONTRACT estimate JSON. */
public class EstimateResult implements Serializable {
    private static final long serialVersionUID = 1L;
    private String materialCode;
    private double thicknessMm;
    private int quantity;
    private BigDecimal areaM2;
    private BigDecimal weightKg;
    private BigDecimal material;
    private BigDecimal cutting;
    private BigDecimal piercing;
    private BigDecimal bending;
    private BigDecimal coating;
    private BigDecimal perPart;
    private BigDecimal subtotal;
    private BigDecimal gst;
    private BigDecimal gstPercent;
    private BigDecimal total;
    private String currency = "INR";
    private boolean sample = true;

    public EstimateResult() { }

    /** Hand-written JSON in the exact CONTRACT shape (no JSON library needed). */
    public String toJson() {
        return "{\"materialCode\":\"" + materialCode + "\",\"thicknessMm\":" + thicknessMm
                + ",\"quantity\":" + quantity
                + ",\"breakdown\":{\"material\":" + material + ",\"cutting\":" + cutting
                + ",\"piercing\":" + piercing + ",\"bending\":" + bending + ",\"coating\":" + coating + "}"
                + ",\"perPart\":" + perPart + ",\"subtotal\":" + subtotal + ",\"gst\":" + gst
                + ",\"total\":" + total + ",\"currency\":\"" + currency + "\",\"isSample\":" + sample + "}";
    }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String v) { this.materialCode = v; }
    public double getThicknessMm() { return thicknessMm; }
    public void setThicknessMm(double v) { this.thicknessMm = v; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int v) { this.quantity = v; }
    public BigDecimal getAreaM2() { return areaM2; }
    public void setAreaM2(BigDecimal v) { this.areaM2 = v; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal v) { this.weightKg = v; }
    public BigDecimal getMaterial() { return material; }
    public void setMaterial(BigDecimal v) { this.material = v; }
    public BigDecimal getCutting() { return cutting; }
    public void setCutting(BigDecimal v) { this.cutting = v; }
    public BigDecimal getPiercing() { return piercing; }
    public void setPiercing(BigDecimal v) { this.piercing = v; }
    public BigDecimal getBending() { return bending; }
    public void setBending(BigDecimal v) { this.bending = v; }
    public BigDecimal getCoating() { return coating; }
    public void setCoating(BigDecimal v) { this.coating = v; }
    public BigDecimal getPerPart() { return perPart; }
    public void setPerPart(BigDecimal v) { this.perPart = v; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal v) { this.subtotal = v; }
    public BigDecimal getGst() { return gst; }
    public void setGst(BigDecimal v) { this.gst = v; }
    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal v) { this.gstPercent = v; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal v) { this.total = v; }
    public String getCurrency() { return currency; }
    public void setCurrency(String v) { this.currency = v; }
    public boolean isSample() { return sample; }
    public void setSample(boolean v) { this.sample = v; }
}
