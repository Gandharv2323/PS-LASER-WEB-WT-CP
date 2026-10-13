package com.pslaser.desk.service;

import com.pslaser.desk.dao.RateDAO;
import com.pslaser.desk.model.EstimateRequest;
import com.pslaser.desk.model.EstimateResult;
import com.pslaser.desk.model.Material;
import com.pslaser.desk.model.Rate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * SERVICE (business logic, part of the MODEL in MVC) - the CONTRACT price estimate
 * formula (services/CONTRACT.md "Price estimate formula"), identical to PHP/Spring/Next.
 * Reads the shared rates/materials/settings tables through RateDAO.
 *
 * Stateless -> one instance can be shared safely by all request threads.
 */
public class EstimateService {
    public static final double BED_LENGTH_MM = 3000;
    public static final double BED_WIDTH_MM = 1500;
    private static final BigDecimal MILLION = new BigDecimal("1000000");
    private static final BigDecimal THOUSAND = new BigDecimal("1000");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final RateDAO rates;

    public EstimateService(RateDAO rates) { this.rates = rates; }

    /** Step 1: validation. Returns field -> message (empty map = valid). */
    public Map<String, String> validate(EstimateRequest r) throws SQLException {
        Map<String, String> errors = new LinkedHashMap<>();
        Material m = r.getMaterialCode() == null ? null : rates.material(r.getMaterialCode());
        if (m == null) {
            errors.put("materialCode", "Choose a material from the list.");
        } else if (r.getThicknessMm() <= 0 || r.getThicknessMm() > m.getMaxThicknessMm().doubleValue()) {
            errors.put("thicknessMm", "Thickness must be more than 0 and at most "
                    + m.getMaxThicknessMm().stripTrailingZeros().toPlainString() + " mm for " + m.getName() + ".");
        }
        if (r.getLengthMm() <= 0 || r.getLengthMm() > BED_LENGTH_MM)
            errors.put("lengthMm", "Length must be between 1 and 3000 mm (laser bed 3000 x 1500).");
        if (r.getWidthMm() <= 0 || r.getWidthMm() > BED_WIDTH_MM)
            errors.put("widthMm", "Width must be between 1 and 1500 mm (laser bed 3000 x 1500).");
        if (r.getCutLengthMm() <= 0) errors.put("cutLengthMm", "Cut length must be more than 0 mm.");
        if (r.getPierces() < 0) errors.put("pierces", "Pierces cannot be negative.");
        if (r.getBends() < 0) errors.put("bends", "Bends cannot be negative.");
        if (r.getQuantity() < 1) errors.put("quantity", "Quantity must be at least 1.");
        if (errors.isEmpty() && rates.rateFor(m.getCode(), BigDecimal.valueOf(r.getThicknessMm())) == null)
            errors.put("thicknessMm", "No rate band for this thickness - ask us on WhatsApp.");
        return errors;
    }

    /** Steps 2-12. Call validate() first. */
    public EstimateResult estimate(EstimateRequest r) throws SQLException {
        Material m = rates.material(r.getMaterialCode());
        BigDecimal t = BigDecimal.valueOf(r.getThicknessMm());
        Rate rate = rates.rateFor(m.getCode(), t);                              // 2
        Map<String, String> s = rates.settings();
        BigDecimal bendRate = new BigDecimal(s.getOrDefault("bend_rate_inr", "0"));
        BigDecimal coatRate = new BigDecimal(s.getOrDefault("powder_coat_rate_per_sqm", "0"));
        BigDecimal gstPct = new BigDecimal(s.getOrDefault("gst_percent", "18"));
        boolean sample = "1".equals(s.getOrDefault("rates_are_sample", "1")) || rate.isSample();

        BigDecimal area = BigDecimal.valueOf(r.getLengthMm())
                .multiply(BigDecimal.valueOf(r.getWidthMm())).divide(MILLION);     // 3
        BigDecimal weight = area.multiply(t).multiply(m.getDensityGCm3());         // 4
        BigDecimal material = weight.multiply(rate.getMaterialRatePerKg());        // 5
        BigDecimal cutting = BigDecimal.valueOf(r.getCutLengthMm())
                .divide(THOUSAND).multiply(rate.getCutRatePerM());                 // 6
        BigDecimal piercing = rate.getPierceRate().multiply(BigDecimal.valueOf(r.getPierces())); // 7
        BigDecimal bending = bendRate.multiply(BigDecimal.valueOf(r.getBends()));               // 8
        BigDecimal coating = r.isPowderCoat()
                ? area.multiply(new BigDecimal("2")).multiply(coatRate) : BigDecimal.ZERO;      // 9
        // Shared rounding rule (same as PHP/Spring/Next): round EACH line to 2 dp HALF_UP,
        // perPart = sum of the rounded lines.
        material = round(material);
        cutting = round(cutting);
        piercing = round(piercing);
        bending = round(bending);
        coating = round(coating);
        BigDecimal perPart = material.add(cutting).add(piercing).add(bending).add(coating);    // 10
        BigDecimal subtotal = round(perPart.multiply(BigDecimal.valueOf(r.getQuantity())));    // 11
        BigDecimal gst = round(subtotal.multiply(gstPct).divide(HUNDRED));
        BigDecimal total = subtotal.add(gst);

        EstimateResult out = new EstimateResult();
        out.setMaterialCode(m.getCode());
        out.setThicknessMm(r.getThicknessMm());
        out.setQuantity(r.getQuantity());
        out.setAreaM2(area.setScale(4, RoundingMode.HALF_UP));
        out.setWeightKg(weight.setScale(3, RoundingMode.HALF_UP));
        out.setMaterial(round(material));
        out.setCutting(round(cutting));
        out.setPiercing(round(piercing));
        out.setBending(round(bending));
        out.setCoating(round(coating));
        out.setPerPart(perPart);
        out.setSubtotal(subtotal);
        out.setGst(gst);
        out.setGstPercent(gstPct);
        out.setTotal(total);
        out.setSample(sample);                                                  // 12
        return out;
    }

    private static BigDecimal round(BigDecimal v) { return v.setScale(2, RoundingMode.HALF_UP); }
}
