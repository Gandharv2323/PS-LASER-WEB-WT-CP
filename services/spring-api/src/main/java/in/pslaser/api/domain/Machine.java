package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Read-only view of the {@code machines} table (edited by the Laravel admin). */
@Entity
@Table(name = "machines")
public class Machine {

	@Id
	private Long id;
	private String slug;
	private String name;
	@Column(name = "short_name")
	private String shortName;
	private String category;
	/** one spec per line */
	@Column(columnDefinition = "text")
	private String specs;
	private String image;
	@Column(name = "sort_order")
	private int sortOrder;

	public Long getId() { return id; }
	public String getSlug() { return slug; }
	public String getName() { return name; }
	public String getShortName() { return shortName; }
	public String getCategory() { return category; }
	public String getSpecs() { return specs; }
	public String getImage() { return image; }
	public int getSortOrder() { return sortOrder; }
}
