package in.pslaser.api.service;

import in.pslaser.api.domain.Quote;
import in.pslaser.api.domain.User;
import in.pslaser.api.dto.EstimateRequest;
import in.pslaser.api.dto.EstimateResponse;
import in.pslaser.api.dto.QuoteDtos.QuoteDto;
import in.pslaser.api.dto.QuoteDtos.SaveQuoteRequest;
import in.pslaser.api.event.DomainEvents.QuoteSaved;
import in.pslaser.api.repository.QuoteRepository;
import in.pslaser.api.repository.UserRepository;
import in.pslaser.api.security.AuthUser;
import in.pslaser.api.web.ApiException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuoteService {

	private static final DateTimeFormatter YYYYMMDD = DateTimeFormatter.BASIC_ISO_DATE;
	private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

	private final EstimateService estimateService;
	private final QuoteRepository quotes;
	private final UserRepository users;
	private final ApplicationEventPublisher events;

	public QuoteService(EstimateService estimateService, QuoteRepository quotes, UserRepository users,
			ApplicationEventPublisher events) {
		this.estimateService = estimateService;
		this.quotes = quotes;
		this.users = users;
		this.events = events;
	}

	/** Re-computes the estimate server-side (never trusts a client total) and stores it with a PSL-Q number. */
	@Transactional
	public QuoteDto save(SaveQuoteRequest req) {
		EstimateRequest er = req.toEstimateRequest();
		EstimateResponse est = estimateService.compute(er);

		Quote q = new Quote();
		q.setQuoteNo(nextQuoteNo());
		q.setCustomerName(req.customerName().trim());
		q.setCustomerPhone(req.customerPhone().trim());
		q.setMaterialCode(est.materialCode());
		q.setThicknessMm(req.thicknessMm());
		q.setLengthMm(req.lengthMm());
		q.setWidthMm(req.widthMm());
		q.setCutLengthMm(req.cutLengthMm());
		q.setPierces(er.piercesOrDefault());
		q.setBends(er.bendsOrDefault());
		q.setPowderCoat(er.powderCoatOrDefault());
		q.setQuantity(req.quantity());
		q.setAmountInr(est.total());
		Quote saved = quotes.save(q);

		events.publishEvent(new QuoteSaved(saved.getQuoteNo(), saved.getCustomerPhone(), saved.getAmountInr()));
		return QuoteDto.from(saved, est);
	}

	/** PSL-Q-YYYYMMDD-#### (sequence restarts every day, IST). */
	String nextQuoteNo() {
		String prefix = "PSL-Q-" + LocalDate.now(IST).format(YYYYMMDD) + "-";
		int next = quotes.findMaxQuoteNoWithPrefix(prefix)
				.map(max -> Integer.parseInt(max.substring(prefix.length())) + 1)
				.orElse(1);
		return prefix + String.format("%04d", next);
	}

	/** Quotes belonging to the logged-in customer, matched by the phone on their account. */
	@Transactional(readOnly = true)
	public List<QuoteDto> myQuotes(AuthUser me) {
		User user = users.findById(me.id()).orElseThrow(() -> ApiException.unauthorized("User no longer exists"));
		if (user.getPhone() == null || user.getPhone().isBlank()) {
			return List.of();
		}
		return quotes.findByCustomerPhoneOrderByIdDesc(user.getPhone().trim()).stream()
				.map(q -> QuoteDto.from(q, null))
				.toList();
	}
}
