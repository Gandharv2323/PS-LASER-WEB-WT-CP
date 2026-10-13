package in.pslaser.api.security;

import in.pslaser.api.config.PsLaserProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies HS256 JWTs exactly as CONTRACT.md specifies:
 * {@code sub} = user id, {@code email}, {@code role}, {@code exp} = now + 8 h.
 * The same secret (env JWT_SECRET) lets the Node API verify these tokens.
 */
@Service
public class JwtService {

	private final SecretKey key;
	private final Duration ttl;
	private final String issuer;

	public JwtService(PsLaserProperties props) {
		this.key = Keys.hmacShaKeyFor(props.jwt().secret().getBytes(StandardCharsets.UTF_8));
		this.ttl = Duration.ofHours(props.jwt().expiryHours());
		this.issuer = props.jwt().issuer();
	}

	public String issue(Long userId, String email, String role) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(String.valueOf(userId))
				.claim("email", email)
				.claim("role", role)
				.issuer(issuer)
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plus(ttl)))
				.signWith(key, Jwts.SIG.HS256)
				.compact();
	}

	/** @return the principal if the signature and expiry are valid, empty otherwise. */
	public Optional<AuthUser> verify(String token) {
		try {
			Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
			return Optional.of(new AuthUser(Long.valueOf(c.getSubject()), c.get("email", String.class),
					c.get("role", String.class)));
		}
		catch (JwtException | IllegalArgumentException ex) {
			return Optional.empty();
		}
	}
}
