package in.pslaser.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.pslaser.api.config.PsLaserProperties;
import in.pslaser.api.dto.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder.BCryptVersion;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Spring Security configuration.
 *
 * <ul>
 * <li><b>Stateless JWT</b>: {@code SessionCreationPolicy.STATELESS} + {@link JwtAuthFilter}.</li>
 * <li><b>CSRF disabled</b>: CSRF attacks abuse cookies that the browser sends automatically.
 * This API never uses cookies or sessions for auth - the client must add the
 * {@code Authorization} header explicitly, which a forged cross-site form cannot do - so a
 * CSRF token would add nothing.</li>
 * <li><b>Role-based access</b>: URL rules below + {@code @PreAuthorize} on admin controllers.</li>
 * <li><b>CORS</b>: only the CONTRACT origins (pslaser.cors.allowed-origins).</li>
 * </ul>
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain api(HttpSecurity http, JwtAuthFilter jwtFilter, ObjectMapper mapper) throws Exception {
		http
			.csrf(AbstractHttpConfigurer::disable)
			.cors(c -> {})
			.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.httpBasic(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				.requestMatchers("/error").permitAll()
				.requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
				.requestMatchers("/actuator/**").hasRole("ADMIN")
				.requestMatchers("/ws/**", "/ws-sockjs/**").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/machines", "/api/machines/*", "/api/services", "/api/materials",
						"/api/work-orders/track").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/quotes/estimate", "/api/quotes").permitAll()
				.requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")
				.requestMatchers("/api/me", "/api/me/**").authenticated()
				.anyRequest().authenticated())
			.exceptionHandling(e -> e
				.authenticationEntryPoint((req, res, ex) -> writeError(res, mapper, 401, "Unauthorized",
						"Missing or invalid Bearer token"))
				.accessDeniedHandler((req, res, ex) -> writeError(res, mapper, 403, "Forbidden",
						"You do not have permission for this action")))
			.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	/** Stop Boot from also registering the JWT filter as a plain servlet filter (it runs inside the chain). */
	@Bean
	FilterRegistrationBean<JwtAuthFilter> jwtFilterRegistration(JwtAuthFilter filter) {
		FilterRegistrationBean<JwtAuthFilter> reg = new FilterRegistrationBean<>(filter);
		reg.setEnabled(false);
		return reg;
	}

	/**
	 * bcrypt with the {@code $2y$} prefix so hashes written here are byte-compatible with
	 * PHP/Laravel; {@code matches()} accepts $2a$, $2b$ and $2y$ (the seed admin is $2y$).
	 */
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(BCryptVersion.$2Y, 10);
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(PsLaserProperties props) {
		CorsConfiguration cfg = new CorsConfiguration();
		cfg.setAllowedOrigins(props.cors().allowedOrigins());
		cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
		cfg.setExposedHeaders(List.of("Location"));
		cfg.setAllowCredentials(true);
		cfg.setMaxAge(3600L);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", cfg);
		return source;
	}

	private static void writeError(HttpServletResponse res, ObjectMapper mapper, int status, String error,
			String message) throws java.io.IOException {
		res.setStatus(status);
		res.setContentType(MediaType.APPLICATION_JSON_VALUE);
		mapper.writeValue(res.getOutputStream(), ApiError.of(status, error, message));
	}
}
