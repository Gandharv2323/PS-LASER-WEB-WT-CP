package in.pslaser.api.web;

import in.pslaser.api.dto.AuthDtos.MeResponse;
import in.pslaser.api.dto.QuoteDtos.QuoteDto;
import in.pslaser.api.security.AuthUser;
import in.pslaser.api.service.AuthService;
import in.pslaser.api.service.QuoteService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints for any logged-in user (JWT required). */
@RestController
@RequestMapping("/api/me")
public class MeController {

	private final AuthService auth;
	private final QuoteService quotes;

	public MeController(AuthService auth, QuoteService quotes) {
		this.auth = auth;
		this.quotes = quotes;
	}

	@GetMapping
	public MeResponse me(@AuthenticationPrincipal AuthUser me) {
		return auth.me(me);
	}

	@GetMapping("/quotes")
	public List<QuoteDto> myQuotes(@AuthenticationPrincipal AuthUser me) {
		return quotes.myQuotes(me);
	}
}
