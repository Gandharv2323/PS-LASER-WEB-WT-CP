package in.pslaser.api.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Type-safe binding of every {@code pslaser.*} setting (externalised configuration).
 * Values come from application.yml, profile files, or env vars such as
 * {@code JWT_SECRET} / {@code CORS_ORIGINS} (see application.yml placeholders).
 */
@Validated
@ConfigurationProperties(prefix = "pslaser")
public record PsLaserProperties(@Valid Jwt jwt, @Valid Cors cors, String whatsappNumber) {

	public record Jwt(
			@NotBlank @Size(min = 32, message = "JWT secret must be at least 32 bytes for HS256") String secret,
			@Min(1) int expiryHours,
			String issuer) {
	}

	public record Cors(@NotEmpty List<String> allowedOrigins) {
	}
}
