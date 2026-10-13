package in.pslaser.api.web;

import in.pslaser.api.dto.CatalogueDtos.MachineDto;
import in.pslaser.api.dto.CatalogueDtos.MaterialDto;
import in.pslaser.api.dto.CatalogueDtos.ServiceDto;
import in.pslaser.api.service.CatalogueService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public catalogue: machines, services, materials (read from MySQL via JPA). */
@RestController
@RequestMapping("/api")
public class CatalogueController {

	private final CatalogueService catalogue;

	public CatalogueController(CatalogueService catalogue) {
		this.catalogue = catalogue;
	}

	@GetMapping("/machines")
	public List<MachineDto> machines() {
		return catalogue.machines();
	}

	@GetMapping("/machines/{slug}")
	public MachineDto machine(@PathVariable String slug) {
		return catalogue.machine(slug);
	}

	@GetMapping("/services")
	public List<ServiceDto> services() {
		return catalogue.services();
	}

	@GetMapping("/materials")
	public List<MaterialDto> materials() {
		return catalogue.materials();
	}
}
