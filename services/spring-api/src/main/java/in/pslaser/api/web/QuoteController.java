package in.pslaser.api.web;

import in.pslaser.api.dto.EstimateRequest;
import in.pslaser.api.dto.EstimateResponse;
import in.pslaser.api.dto.QuoteDtos.QuoteDto;
import in.pslaser.api.dto.QuoteDtos.SaveQuoteRequest;
import in.pslaser.api.service.EstimateService;
import in.pslaser.api.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

	private final EstimateService estimates;
	private final QuoteService quotes;

	public QuoteController(EstimateService estimates, QuoteService quotes) {
		this.estimates = estimates;
		this.quotes = quotes;
	}

	/** Indicative estimate, not saved. */
	@PostMapping("/estimate")
	public EstimateResponse estimate(@Valid @RequestBody EstimateRequest req) {
		return estimates.estimate(req);
	}

	/** Saves the estimate as a quote with number PSL-Q-YYYYMMDD-####. */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public QuoteDto save(@Valid @RequestBody SaveQuoteRequest req) {
		return quotes.save(req);
	}
}
