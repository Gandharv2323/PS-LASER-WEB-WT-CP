package in.pslaser.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import in.pslaser.api.dto.EstimateRequest;
import in.pslaser.api.dto.EstimateResponse;
import in.pslaser.api.security.JwtService;
import in.pslaser.api.service.EstimateService;
import in.pslaser.api.service.QuoteService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Web-layer slice test: only QuoteController + GlobalExceptionHandler + Jackson + validation
 * are loaded; the service is a Mockito mock. Security filters are switched off here because
 * security is covered by the full integration test.
 */
@WebMvcTest(QuoteController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuoteControllerWebMvcTest {

	@Autowired
	MockMvc mvc;
	@MockitoBean
	EstimateService estimateService;
	@MockitoBean
	QuoteService quoteService;
	/** JwtAuthFilter is a servlet Filter, so the slice picks it up; give it a mock JwtService. */
	@MockitoBean
	JwtService jwtService;

	@Test
	void estimateReturnsContractJson() throws Exception {
		when(estimateService.estimate(any(EstimateRequest.class))).thenReturn(new EstimateResponse("MS",
				new BigDecimal("2"), 10,
				new EstimateResponse.Breakdown(new BigDecimal("235.50"), new BigDecimal("18.00"), new BigDecimal("4.00"),
						new BigDecimal("16.00"), new BigDecimal("48.00")),
				new BigDecimal("321.50"), new BigDecimal("3215.00"), new BigDecimal("578.70"), new BigDecimal("3793.70"),
				"INR", true));

		mvc.perform(post("/api/quotes/estimate").contentType(MediaType.APPLICATION_JSON).content("""
				{"materialCode":"MS","thicknessMm":2,"lengthMm":500,"widthMm":400,"cutLengthMm":1800,
				 "pierces":4,"bends":2,"powderCoat":true,"quantity":10}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.total").value(3793.70))
				.andExpect(jsonPath("$.breakdown.coating").value(48.00))
				.andExpect(jsonPath("$.currency").value("INR"))
				.andExpect(jsonPath("$.isSample").value(true));
	}

	@Test
	void invalidBodyGives400WithFieldErrors() throws Exception {
		mvc.perform(post("/api/quotes/estimate").contentType(MediaType.APPLICATION_JSON).content("""
				{"materialCode":"","thicknessMm":-1,"lengthMm":5000,"widthMm":400,"cutLengthMm":10,"quantity":0}"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.error").value("Bad Request"))
				.andExpect(jsonPath("$.fieldErrors.materialCode").exists())
				.andExpect(jsonPath("$.fieldErrors.thicknessMm").exists())
				.andExpect(jsonPath("$.fieldErrors.lengthMm").exists())
				.andExpect(jsonPath("$.fieldErrors.quantity").exists());
	}

	@Test
	void serviceErrorBecomesContractError() throws Exception {
		when(estimateService.estimate(any())).thenThrow(ApiException.badRequest("Unknown material code: XX"));
		mvc.perform(post("/api/quotes/estimate").contentType(MediaType.APPLICATION_JSON).content("""
				{"materialCode":"XX","thicknessMm":1,"lengthMm":10,"widthMm":10,"cutLengthMm":10,"quantity":1}"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Unknown material code: XX"));
	}
}
