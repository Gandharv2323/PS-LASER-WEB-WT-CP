package com.pslaser.desk.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * MODEL (MVC) - a JavaBean for one row of the shared work_orders table.
 * JavaBean rules: public no-arg constructor, private fields, getX/setX/isX accessors,
 * Serializable (so it can live in an HttpSession that Tomcat may persist).
 * Used from JSP with jsp:useBean / jsp:getProperty and with EL ${order.status}.
 */
public class WorkOrder implements Serializable {
    private static final long serialVersionUID = 1L;

    /** Production stages in order - mirrors the ENUM in services/db/schema.sql. */
    public static final String[] STATUSES =
            {"received", "cutting", "bending", "welding", "coating", "inspection", "dispatched"};

    private long id;
    private String orderNo;
    private String customerName;
    private String customerPhone;
    private String description;
    private String machineSlug;
    private int quantity = 1;
    private String status = "received";
    private Date dueDate;
    private Date createdAt;
    private Date updatedAt;
    private List<WorkOrderEvent> events = new ArrayList<>();

    public WorkOrder() { }

    public static boolean isValidStatus(String s) {
        if (s == null) return false;
        for (String x : STATUSES) if (x.equals(s)) return true;
        return false;
    }

    /** Index of the current stage (0..6) - the JSP timeline uses it to tick finished stages. */
    public int getStageIndex() {
        for (int i = 0; i < STATUSES.length; i++) if (STATUSES[i].equals(status)) return i;
        return 0;
    }

    /** Customer phone masked for display, e.g. 90******01. */
    public String getMaskedPhone() {
        if (customerPhone == null || customerPhone.length() < 4) return "****";
        StringBuilder sb = new StringBuilder(customerPhone.substring(0, 2));
        for (int i = 2; i < customerPhone.length() - 2; i++) sb.append('*');
        return sb.append(customerPhone.substring(customerPhone.length() - 2)).toString();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMachineSlug() { return machineSlug; }
    public void setMachineSlug(String machineSlug) { this.machineSlug = machineSlug; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    public List<WorkOrderEvent> getEvents() { return events; }
    public void setEvents(List<WorkOrderEvent> events) { this.events = events; }
}
