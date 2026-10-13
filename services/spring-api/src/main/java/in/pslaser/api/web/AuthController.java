package in.pslaser.api.web;

import in.pslaser.api.dto.AuthDtos.AuthResponse;
import in.pslaser.api.dto.AuthDtos.LoginRequest;
import in.pslaser.api.dto.AuthDtos.RegisterRequest;
import in.pslaser.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService auth;

	public AuthController(AuthService auth) {
		this.auth = auth;
	}

	/** POST /api/auth/login {email,password} -> {token, user:{id,name,email,role}} */
	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest req) {
		return auth.login(req);
	}

	/** POST /api/auth/register {name,email,phone,password} -> 201 customer + token */
	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
		return auth.register(req);
	}
}
