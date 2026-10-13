package com.pslaser.desk.model;

import java.io.Serializable;
import java.util.Date;

/** MODEL - JavaBean for one row of work_order_events (the status timeline). */
public class WorkOrderEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private long id;
    private long workOrderId;
    private String status;
    private String note;
    private Date createdAt;

    public WorkOrderEvent() { }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public long getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(long workOrderId) { this.workOrderId = workOrderId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
