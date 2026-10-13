package com.pslaser.desk.dao;

import com.pslaser.desk.model.WorkOrder;
import com.pslaser.desk.model.WorkOrderEvent;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

/**
 * DAO (data layer) for work_orders + work_order_events using plain JDBC.
 * Every query is a PreparedStatement with ? placeholders (no string concatenation
 * of user input -> no SQL injection). Connections come from the pool and are closed
 * (returned to the pool) by try-with-resources.
 */
public class WorkOrderDAO {
    private static final String COLS =
            "id, order_no, customer_name, customer_phone, description, machine_slug, quantity, status, due_date, created_at, updated_at";

    private final DataSource ds;

    public WorkOrderDAO(DataSource ds) { this.ds = ds; }

    /** Customer tracking: order number AND phone must both match (the phone acts as a PIN). */
    public WorkOrder findForTracking(String orderNo, String phone) throws SQLException {
        String sql = "SELECT " + COLS + " FROM work_orders WHERE order_no = ? AND customer_phone = ?";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, orderNo);
            ps.setString(2, phone);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                WorkOrder o = map(rs);
                o.setEvents(events(c, o.getId()));
                return o;
            }
        }
    }

    public WorkOrder findByOrderNo(String orderNo) throws SQLException {
        String sql = "SELECT " + COLS + " FROM work_orders WHERE order_no = ?";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, orderNo);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                WorkOrder o = map(rs);
                o.setEvents(events(c, o.getId()));
                return o;
            }
        }
    }

    /** Staff list, optionally filtered by one or more statuses (from getParameterValues). */
    public List<WorkOrder> list(String[] statuses, String search) throws SQLException {
        StringBuilder sql = new StringBuilder("SELECT " + COLS + " FROM work_orders WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (statuses != null && statuses.length > 0) {
            sql.append(" AND status IN (");
            for (int i = 0; i < statuses.length; i++) {
                sql.append(i == 0 ? "?" : ",?");
                args.add(statuses[i]);
            }
            sql.append(")");
        }
        if (search != null && !search.isEmpty()) {
            sql.append(" AND (order_no LIKE ? OR customer_name LIKE ? OR description LIKE ?)");
            String like = "%" + search + "%";
            args.add(like); args.add(like); args.add(like);
        }
        sql.append(" ORDER BY updated_at DESC, id DESC");
        List<WorkOrder> out = new ArrayList<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql.toString())) {
            for (int i = 0; i < args.size(); i++) ps.setObject(i + 1, args.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) out.add(map(rs));
            }
        }
        return out;
    }

    /**
     * Status change inside ONE database transaction: update the order row and append a
     * work_order_events row. If either statement fails, rollback() undoes both.
     */
    public void updateStatus(String orderNo, String newStatus, String note) throws SQLException {
        try (Connection c = ds.getConnection()) {
            boolean oldAuto = c.getAutoCommit();
            c.setAutoCommit(false);
            try {
                long id;
                try (PreparedStatement ps = c.prepareStatement(
                        "SELECT id FROM work_orders WHERE order_no = ? FOR UPDATE")) {
                    ps.setString(1, orderNo);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new SQLException("No such order " + orderNo);
                        id = rs.getLong(1);
                    }
                }
                try (PreparedStatement ps = c.prepareStatement(
                        "UPDATE work_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")) {
                    ps.setString(1, newStatus);
                    ps.setLong(2, id);
                    ps.executeUpdate();
                }
                try (PreparedStatement ps = c.prepareStatement(
                        "INSERT INTO work_order_events (work_order_id, status, note) VALUES (?, ?, ?)")) {
                    ps.setLong(1, id);
                    ps.setString(2, newStatus);
                    ps.setString(3, note == null || note.isEmpty() ? null : note);
                    ps.executeUpdate();
                }
                c.commit();
            } catch (SQLException e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(oldAuto);
            }
        }
    }

    /** Creates a work order + its first "received" event (also a transaction). Returns new id. */
    public long create(WorkOrder o) throws SQLException {
        try (Connection c = ds.getConnection()) {
            c.setAutoCommit(false);
            try {
                long id;
                try (PreparedStatement ps = c.prepareStatement(
                        "INSERT INTO work_orders (order_no, customer_name, customer_phone, description, machine_slug, quantity, status, due_date)"
                                + " VALUES (?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, o.getOrderNo());
                    ps.setString(2, o.getCustomerName());
                    ps.setString(3, o.getCustomerPhone());
                    ps.setString(4, o.getDescription());
                    ps.setString(5, o.getMachineSlug());
                    ps.setInt(6, o.getQuantity());
                    ps.setString(7, o.getStatus());
                    ps.setDate(8, o.getDueDate() == null ? null : new Date(o.getDueDate().getTime()));
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        keys.next();
                        id = keys.getLong(1);
                    }
                }
                try (PreparedStatement ps = c.prepareStatement(
                        "INSERT INTO work_order_events (work_order_id, status, note) VALUES (?, ?, ?)")) {
                    ps.setLong(1, id);
                    ps.setString(2, o.getStatus());
                    ps.setString(3, "Order created at the staff desk");
                    ps.executeUpdate();
                }
                c.commit();
                return id;
            } catch (SQLException e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    public boolean orderNoExists(String orderNo) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT 1 FROM work_orders WHERE order_no = ?")) {
            ps.setString(1, orderNo);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    /** Next free number like PSL-2026-0003 (display helper for the create form). */
    public String suggestOrderNo(int year) throws SQLException {
        String prefix = "PSL-" + year + "-";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT COUNT(*) FROM work_orders WHERE order_no LIKE ?")) {
            ps.setString(1, prefix + "%");
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                int n = rs.getInt(1) + 1;
                String candidate;
                do { candidate = prefix + String.format("%04d", n++); } while (orderNoExists(candidate));
                return candidate;
            }
        }
    }

    /** Count per status - used for the filter chips on the staff desk. */
    public java.util.Map<String, Integer> countByStatus() throws SQLException {
        java.util.Map<String, Integer> m = new java.util.LinkedHashMap<>();
        for (String s : WorkOrder.STATUSES) m.put(s, 0);
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT status, COUNT(*) FROM work_orders GROUP BY status");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) m.put(rs.getString(1), rs.getInt(2));
        }
        return m;
    }

    private List<WorkOrderEvent> events(Connection c, long orderId) throws SQLException {
        List<WorkOrderEvent> list = new ArrayList<>();
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT id, work_order_id, status, note, created_at FROM work_order_events WHERE work_order_id = ? ORDER BY created_at, id")) {
            ps.setLong(1, orderId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    WorkOrderEvent e = new WorkOrderEvent();
                    e.setId(rs.getLong("id"));
                    e.setWorkOrderId(rs.getLong("work_order_id"));
                    e.setStatus(rs.getString("status"));
                    e.setNote(rs.getString("note"));
                    e.setCreatedAt(rs.getTimestamp("created_at"));
                    list.add(e);
                }
            }
        }
        return list;
    }

    private static WorkOrder map(ResultSet rs) throws SQLException {
        WorkOrder o = new WorkOrder();
        o.setId(rs.getLong("id"));
        o.setOrderNo(rs.getString("order_no"));
        o.setCustomerName(rs.getString("customer_name"));
        o.setCustomerPhone(rs.getString("customer_phone"));
        o.setDescription(rs.getString("description"));
        o.setMachineSlug(rs.getString("machine_slug"));
        o.setQuantity(rs.getInt("quantity"));
        o.setStatus(rs.getString("status"));
        o.setDueDate(rs.getDate("due_date"));
        o.setCreatedAt(rs.getTimestamp("created_at"));
        o.setUpdatedAt(rs.getTimestamp("updated_at"));
        return o;
    }
}
