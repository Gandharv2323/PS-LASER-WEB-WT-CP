package com.pslaser.desk.model;

import java.io.Serializable;

/** MODEL - logged-in staff member, stored in the HttpSession under "user". No password kept. */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private long id;
    private String name;
    private String email;
    private String role;

    public User() { }

    public boolean isStaff() { return "admin".equals(role) || "staff".equals(role); }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
