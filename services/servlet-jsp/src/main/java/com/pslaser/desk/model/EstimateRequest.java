package com.pslaser.desk.model;

import java.io.Serializable;

/**
 * MODEL - the estimate form inputs (CONTRACT "Price estimate formula" inputs).
 * Default values pre-fill the form on first visit.
 */
public class EstimateRequest implements Serializable {
    private static final long serialVersionUID = 1L;
    private String materialCode = "MS";
    private double thicknessMm = 2;
    private double lengthMm = 500;
    private double widthMm = 300;
    private double cutLengthMm = 1600;
    private int pierces = 4;
    private int bends = 2;
    private boolean powderCoat = false;
    private int quantity = 10;

    public EstimateRequest() { }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String v) { this.materialCode = v; }
    public double getThicknessMm() { return thicknessMm; }
    public void setThicknessMm(double v) { this.thicknessMm = v; }
    public double getLengthMm() { return lengthMm; }
    public void setLengthMm(double v) { this.lengthMm = v; }
    public double getWidthMm() { return widthMm; }
    public void setWidthMm(double v) { this.widthMm = v; }
    public double getCutLengthMm() { return cutLengthMm; }
    public void setCutLengthMm(double v) { this.cutLengthMm = v; }
    public int getPierces() { return pierces; }
    public void setPierces(int v) { this.pierces = v; }
    public int getBends() { return bends; }
    public void setBends(int v) { this.bends = v; }
    public boolean isPowderCoat() { return powderCoat; }
    public void setPowderCoat(boolean v) { this.powderCoat = v; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int v) { this.quantity = v; }
}
