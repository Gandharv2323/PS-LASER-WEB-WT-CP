package com.pslaser.desk.model;

import java.io.Serializable;
import java.math.BigDecimal;

/** MODEL - row of materials (code, name, max thickness, density). */
public class Material implements Serializable {
    private static final long serialVersionUID = 1L;
    private String code;
    private String name;
    private BigDecimal maxThicknessMm;
    private BigDecimal densityGCm3;

    public Material() { }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getMaxThicknessMm() { return maxThicknessMm; }
    public void setMaxThicknessMm(BigDecimal v) { this.maxThicknessMm = v; }
    public BigDecimal getDensityGCm3() { return densityGCm3; }
    public void setDensityGCm3(BigDecimal v) { this.densityGCm3 = v; }
}
