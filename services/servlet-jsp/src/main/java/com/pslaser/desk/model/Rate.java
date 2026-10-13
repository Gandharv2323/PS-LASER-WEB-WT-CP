package com.pslaser.desk.model;

import java.io.Serializable;
import java.math.BigDecimal;

/** MODEL - one band of the rates card (per material + thickness range). */
public class Rate implements Serializable {
    private static final long serialVersionUID = 1L;
    private String materialCode;
    private BigDecimal thicknessFromMm;
    private BigDecimal thicknessToMm;
    private BigDecimal cutRatePerM;
    private BigDecimal pierceRate;
    private BigDecimal materialRatePerKg;
    private boolean sample;

    public Rate() { }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String v) { this.materialCode = v; }
    public BigDecimal getThicknessFromMm() { return thicknessFromMm; }
    public void setThicknessFromMm(BigDecimal v) { this.thicknessFromMm = v; }
    public BigDecimal getThicknessToMm() { return thicknessToMm; }
    public void setThicknessToMm(BigDecimal v) { this.thicknessToMm = v; }
    public BigDecimal getCutRatePerM() { return cutRatePerM; }
    public void setCutRatePerM(BigDecimal v) { this.cutRatePerM = v; }
    public BigDecimal getPierceRate() { return pierceRate; }
    public void setPierceRate(BigDecimal v) { this.pierceRate = v; }
    public BigDecimal getMaterialRatePerKg() { return materialRatePerKg; }
    public void setMaterialRatePerKg(BigDecimal v) { this.materialRatePerKg = v; }
    public boolean isSample() { return sample; }
    public void setSample(boolean sample) { this.sample = sample; }
}
