package in.pslaser.api.repository;

import in.pslaser.api.domain.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, String> {
}
