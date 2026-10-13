package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** JPA entity over the shared, Laravel-compatible {@code users} table (bcrypt $2y$ passwords). */
@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(nullable = false, unique = true, length = 190)
	private String email;

	@Column(length = 20)
	private String phone;

	/** bcrypt hash - never serialised; controllers return {@code UserDto} only. */
	@Column(nullable = false)
	private String password;

	/** 'admin' | 'staff' | 'customer' (MySQL ENUM, kept as a plain string). */
	@Column(nullable = false)
	private String role;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }
	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }
	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
