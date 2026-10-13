package in.pslaser.api.dto;

import in.pslaser.api.domain.Machine;
import in.pslaser.api.domain.Material;
import in.pslaser.api.domain.ServiceOffering;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

public final class CatalogueDtos {

	private CatalogueDtos() {
	}

	/** {@code specs} is the TEXT column split into one entry per line. */
	public record MachineDto(Long id, String slug, String name, String shortName, String category,
			List<String> specs, String image, int sortOrder) {

		public static MachineDto from(Machine m) {
			List<String> specs = m.getSpecs() == null ? List.of()
					: Arrays.stream(m.getSpecs().split("\\r?\\n")).map(String::trim).filter(s -> !s.isEmpty()).toList();
			return new MachineDto(m.getId(), m.getSlug(), m.getName(), m.getShortName(), m.getCategory(), specs,
					m.getImage(), m.getSortOrder());
		}
	}

	public record ServiceDto(Long id, String slug, String title, String description, String image, int sortOrder) {

		public static ServiceDto from(ServiceOffering s) {
			return new ServiceDto(s.getId(), s.getSlug(), s.getTitle(), s.getDescription(), s.getImage(), s.getSortOrder());
		}
	}

	public record MaterialDto(String code, String name, BigDecimal maxThicknessMm, BigDecimal densityGCm3) {

		public static MaterialDto from(Material m) {
			return new MaterialDto(m.getCode(), m.getName(), m.getMaxThicknessMm(), m.getDensityGCm3());
		}
	}
}
