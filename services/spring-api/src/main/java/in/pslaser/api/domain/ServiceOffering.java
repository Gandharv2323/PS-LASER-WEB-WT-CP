package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Read-only view of the {@code services} table (named ServiceOffering to avoid clashing with @Service). */
@Entity
@Table(name = "services")
public class ServiceOffering {

	@Id
	private Long id;
	private String slug;
	private String title;
	@Column(columnDefinition = "text")
	private String description;
	private String image;
	@Column(name = "sort_order")
	private int sortOrder;

	public Long getId() { return id; }
	public String getSlug() { return slug; }
	public String getTitle() { return title; }
	public String getDescription() { return description; }
	public String getImage() { return image; }
	public int getSortOrder() { return sortOrder; }
}
