package in.pslaser.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request/response records for /api/auth/** and /api/me (DTOs keep the password hash out of JSON). */
public final class AuthDtos {

	private AuthDtos() {
	}

	public record LoginRequest(
			@NotBlank @Email String email,
			@NotBlank String password) {
	}

	public record RegisterRequest(
			@NotBlank @Size(max = 120) String name,
			@NotBlank @Email @Size(max = 190) String email,
			@NotBlank @Pattern(regexp = "^[0-9+\\- ]{10,20}$", message = "must be a valid phone number (10-20 digits)") String phone,
			@NotBlank @Size(min = 8, max = 72, message = "must be 8-72 characters") String password) {
	}

	public record UserDto(Long id, String name, String email, String role) {
	}

	public record AuthResponse(String token, UserDto user) {
	}

	public record MeResponse(Long id, String name, String email, String phone, String role) {
	}
}
