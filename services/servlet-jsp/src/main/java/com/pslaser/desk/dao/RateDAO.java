package com.pslaser.desk.dao;

import com.pslaser.desk.model.Material;
import com.pslaser.desk.model.Rate;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;

/** DAO for materials, rates and settings - the same rate card PHP/Spring/Next use. */
public class RateDAO {
    private final DataSource ds;

    public RateDAO(DataSource ds) { this.ds = ds; }

    public List<Material> materials() throws SQLException {
        List<Material> out = new ArrayList<>();
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "SELECT code, name, max_thickness_mm, density_g_cm3 FROM materials ORDER BY id");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) out.add(mapMaterial(rs));
        }
        return out;
    }

    public Material material(String code) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "SELECT code, name, max_thickness_mm, density_g_cm3 FROM materials WHERE code = ?")) {
            ps.setString(1, code);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapMaterial(rs) : null;
            }
        }
    }

    /** CONTRACT step 2: rate row where thickness BETWEEN from AND to. */
    public Rate rateFor(String code, BigDecimal thickness) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "SELECT material_code, thickness_from_mm, thickness_to_mm, cut_rate_per_m, pierce_rate,"
                             + " material_rate_per_kg, is_sample FROM rates"
                             + " WHERE material_code = ? AND ? BETWEEN thickness_from_mm AND thickness_to_mm"
                             + " ORDER BY thickness_from_mm LIMIT 1")) {
            ps.setString(1, code);
            ps.setBigDecimal(2, thickness);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                Rate r = new Rate();
                r.setMaterialCode(rs.getString(1));
                r.setThicknessFromMm(rs.getBigDecimal(2));
                r.setThicknessToMm(rs.getBigDecimal(3));
                r.setCutRatePerM(rs.getBigDecimal(4));
                r.setPierceRate(rs.getBigDecimal(5));
                r.setMaterialRatePerKg(rs.getBigDecimal(6));
                r.setSample(rs.getBoolean(7));
                return r;
            }
        }
    }

    public Map<String, String> settings() throws SQLException {
        Map<String, String> m = new HashMap<>();
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT `key`, `value` FROM settings");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) m.put(rs.getString(1), rs.getString(2));
        }
        return m;
    }

    private static Material mapMaterial(ResultSet rs) throws SQLException {
        Material m = new Material();
        m.setCode(rs.getString(1));
        m.setName(rs.getString(2));
        m.setMaxThicknessMm(rs.getBigDecimal(3));
        m.setDensityGCm3(rs.getBigDecimal(4));
        return m;
    }
}
