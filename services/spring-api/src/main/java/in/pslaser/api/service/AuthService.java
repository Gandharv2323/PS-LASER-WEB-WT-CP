package in.pslaser.api.service;

import in.pslaser.api.domain.User;
import in.pslaser.api.dto.AuthDtos.AuthResponse;
import in.pslaser.api.dto.AuthDtos.LoginRequest;
import in.pslaser.api.dto.AuthDtos.MeResponse;
import in.pslaser.api.dto.AuthDtos.RegisterRequest;
import in.pslaser.api.dto.AuthDtos.UserDto;
import in.pslaser.api.event.DomainEvents.UserLoggedIn;
import in.pslaser.api.event.DomainEvents.UserRegistered;
import in.pslaser.api.repository.UserRepository;
import in.pslaser.api.security.AuthUser;
import in.pslaser.api.security.JwtService;
import in.pslaser.api.web.ApiException;
import java.util.Locale;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final UserRepository users;
	private final PasswordEncoder encoder;
	private final JwtService jwt;
	private final ApplicationEventPublisher events;

	public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt, ApplicationEventPublisher events) {
		this.users = users;
		this.encoder = encoder;
		this.jwt = jwt;
		this.events = events;
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest req) {
		User user = users.findByEmailIgnoreCase(req.email().trim()).orElse(null);
		if (user == null || !encoder.matches(req.password(), user.getPassword())) {
			events.publishEvent(new UserLoggedIn(null, req.email(), null, false));
			// same message for "no such user" and "wrong password" - no account enumeration
			throw ApiException.unauthorized("Invalid email or password");
		}
		events.publishEvent(new UserLoggedIn(user.getId(), user.getEmail(), user.getRole(), true));
		return toAuth(user);
	}

	@Transactional
	public AuthResponse register(RegisterRequest req) {
		String email = req.email().trim().toLowerCase(Locale.ROOT);
		if (users.existsByEmailIgnoreCase(email)) {
			throw ApiException.conflict("An account with this email already exists");
		}
		User u = new User();
		u.setName(req.name().trim());
		u.setEmail(email);
		u.setPhone(req.phone().trim());
		u.setPassword(encoder.encode(req.password()));
		u.setRole("customer"); // self-registration can never create staff/admin
		User saved = users.save(u);
		events.publishEvent(new UserRegistered(saved.getId(), saved.getEmail()));
		return toAuth(saved);
	}

	@Transactional(readOnly = true)
	public MeResponse me(AuthUser principal) {
		User u = users.findById(principal.id()).orElseThrow(() -> ApiException.unauthorized("User no longer exists"));
		return new MeResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole());
	}

	private AuthResponse toAuth(User u) {
		String token = jwt.issue(u.getId(), u.getEmail(), u.getRole());
		return new AuthResponse(token, new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole()));
	}
}
