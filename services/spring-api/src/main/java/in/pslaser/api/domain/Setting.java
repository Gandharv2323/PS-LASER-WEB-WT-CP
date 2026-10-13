package in.pslaser.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Key/value row of the {@code settings} table. {@code key}/{@code value} are SQL keywords, hence the quoting. */
@Entity
@Table(name = "settings")
public class Setting {

	@Id
	@Column(name = "`key`", length = 80)
	private String key;

	@Column(name = "`value`", nullable = false)
	private String value;

	protected Setting() {
	}

	public Setting(String key, String value) {
		this.key = key;
		this.value = value;
	}

	public String getKey() { return key; }
	public String getValue() { return value; }
}
