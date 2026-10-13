package in.pslaser.api.repository;

import in.pslaser.api.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository: the implementation is generated at runtime from the method names. */
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmailIgnoreCase(String email);

	boolean existsByEmailIgnoreCase(String email);
}
