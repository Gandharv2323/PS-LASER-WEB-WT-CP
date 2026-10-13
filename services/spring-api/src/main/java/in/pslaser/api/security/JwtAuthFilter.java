package in.pslaser.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Stateless authentication: reads {@code Authorization: Bearer <jwt>}, verifies it and puts an
 * Authentication with authority {@code ROLE_<ROLE>} into the SecurityContext for this request
 * only. No HTTP session is ever created.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	public JwtAuthFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			jwtService.verify(header.substring(7).trim()).ifPresent(user -> {
				var auth = new UsernamePasswordAuthenticationToken(user, null,
						List.of(new SimpleGrantedAuthority("ROLE_" + user.role().toUpperCase())));
				SecurityContextHolder.getContext().setAuthentication(auth);
			});
		}
		chain.doFilter(request, response);
	}
}
