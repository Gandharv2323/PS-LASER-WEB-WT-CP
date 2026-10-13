package in.pslaser.api.service;

import in.pslaser.api.dto.CatalogueDtos.MachineDto;
import in.pslaser.api.dto.CatalogueDtos.MaterialDto;
import in.pslaser.api.dto.CatalogueDtos.ServiceDto;
import in.pslaser.api.repository.MachineRepository;
import in.pslaser.api.repository.MaterialRepository;
import in.pslaser.api.repository.ServiceOfferingRepository;
import in.pslaser.api.web.ApiException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service layer between the catalogue controller and the JPA repositories. */
@Service
@Transactional(readOnly = true)
public class CatalogueService {

	private final MachineRepository machines;
	private final ServiceOfferingRepository services;
	private final MaterialRepository materials;

	public CatalogueService(MachineRepository machines, ServiceOfferingRepository services, MaterialRepository materials) {
		this.machines = machines;
		this.services = services;
		this.materials = materials;
	}

	public List<MachineDto> machines() {
		return machines.findAllByOrderBySortOrderAsc().stream().map(MachineDto::from).toList();
	}

	public MachineDto machine(String slug) {
		return machines.findBySlug(slug).map(MachineDto::from)
				.orElseThrow(() -> ApiException.notFound("Machine not found: " + slug));
	}

	public List<ServiceDto> services() {
		return services.findAllByOrderBySortOrderAsc().stream().map(ServiceDto::from).toList();
	}

	public List<MaterialDto> materials() {
		return materials.findAllByOrderByIdAsc().stream().map(MaterialDto::from).toList();
	}
}
