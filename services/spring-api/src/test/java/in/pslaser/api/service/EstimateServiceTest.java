package in.pslaser.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import in.pslaser.api.domain.Material;
import in.pslaser.api.domain.Rate;
import in.pslaser.api.domain.Setting;
import in.pslaser.api.dto.EstimateRequest;
import in.pslaser.api.dto.EstimateResponse;
import in.pslaser.api.event.DomainEvents.EstimateCalculated;
import in.pslaser.api.repository.MaterialRepository;
import in.pslaser.api.repository.RateRepository;
import in.pslaser.api.repository.SettingRepository;
import in.pslaser.api.web.ApiException;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

/**
 * Pure unit test (JUnit 5 + Mockito): no Spring context, no database. Repositories are
 * mocks returning the seed rate card, and the result is compared with a hand calculation.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EstimateServiceTest {

	@Mock
	MaterialRepository materials;
	@Mock
	RateRepository rates;
	@Mock
	SettingRepository settings;
	@Mock
	ApplicationEventPublisher events;
	@InjectMocks
	EstimateService service;

	@BeforeEach
	void seedRateCard() {
		when(materials.findByCodeIgnoreCase("MS")).thenReturn(Optional.of(
				new Material(1L, "MS", "Mild Steel", new BigDecimal("16.00"), new BigDecimal("7.85"))));
		when(rates.findBand(eq("MS"), any())).thenReturn(Optional.of(new Rate("MS", new BigDecimal("0.5"),
				new BigDecimal("3"), new BigDecimal("10"), new BigDecimal("1"), new BigDecimal("75"))));
		when(settings.findById(anyString())).thenReturn(Optional.empty());
		when(settings.findById("bend_rate_inr")).thenReturn(Optional.of(new Setting("bend_rate_inr", "8")));
		when(settings.findById("powder_coat_rate_per_sqm"))
				.thenReturn(Optional.of(new Setting("powder_coat_rate_per_sqm", "120")));
		when(settings.findById("gst_percent")).thenReturn(Optional.of(new Setting("gst_percent", "18")));
		when(settings.findById("rates_are_sample")).thenReturn(Optional.of(new Setting("rates_are_sample", "1")));
	}

	/**
	 * Shared reference case agreed by every estimator (PHP, Spring, JSP, Next):
	 * MS 2 mm, 500 x 300 mm, cut 1600 mm, 4 pierces, 2 bends, powder coat, qty 10.
	 * area 0.15 m2; weight 0.15 x 2 x 7.85 = 2.355 kg; material 2.355 x 75 = 176.625 -> 176.63;
	 * cutting 1.6 x 10 = 16.00; piercing 4.00; bending 16.00; coating 0.15 x 2 x 120 = 36.00;
	 * per part (sum of rounded lines) 248.63; subtotal 2486.30; GST 18% 447.534 -> 447.53; total 2933.83.
	 */
	@Test
	@DisplayName("Cross-estimator reference case: total INR 2933.83")
	void sharedReferenceCase() {
		EstimateResponse r = service.estimate(new EstimateRequest("MS", new BigDecimal("2"), new BigDecimal("500"),
				new BigDecimal("300"), new BigDecimal("1600"), 4, 2, true, 10));

		assertThat(r.breakdown().material()).isEqualByComparingTo("176.63");
		assertThat(r.breakdown().cutting()).isEqualByComparingTo("16.00");
		assertThat(r.breakdown().coating()).isEqualByComparingTo("36.00");
		assertThat(r.perPart()).isEqualByComparingTo("248.63");
		assertThat(r.subtotal()).isEqualByComparingTo("2486.30");
		assertThat(r.gst()).isEqualByComparingTo("447.53");
		assertThat(r.total()).isEqualByComparingTo("2933.83");
	}

	@Test
	void thicknessBetweenRateBandsIsRejected() {
		when(rates.findBand("MS", new BigDecimal("3.005"))).thenReturn(Optional.empty());
		assertThatThrownBy(() -> service.compute(new EstimateRequest("MS", new BigDecimal("3.005"),
				new BigDecimal("500"), new BigDecimal("300"), new BigDecimal("1600"), 1, 0, false, 1)))
				.isInstanceOf(ApiException.class)
				.hasMessageContaining("No rate band");
	}

	/**
	 * Hand calculation - MS 2 mm, 500 x 400 mm, 1800 mm cut, 4 pierces, 2 bends, powder coat, qty 10:
	 * area 0.2 m2; weight 0.2 x 2 x 7.85 = 3.14 kg; material 3.14 x 75 = 235.50; cutting 1.8 x 10 = 18.00;
	 * piercing 4 x 1 = 4.00; bending 2 x 8 = 16.00; coating 0.2 x 2 x 120 = 48.00;
	 * per part 321.50; subtotal 3215.00; GST 18% 578.70; total 3793.70.
	 */
	@Test
	@DisplayName("MS 2 mm bracket matches the hand-calculated CONTRACT example")
	void handCalculatedCase() {
		EstimateResponse r = service.estimate(new EstimateRequest("MS", new BigDecimal("2"), new BigDecimal("500"),
				new BigDecimal("400"), new BigDecimal("1800"), 4, 2, true, 10));

		assertThat(r.breakdown().material()).isEqualByComparingTo("235.50");
		assertThat(r.breakdown().cutting()).isEqualByComparingTo("18.00");
		assertThat(r.breakdown().piercing()).isEqualByComparingTo("4.00");
		assertThat(r.breakdown().bending()).isEqualByComparingTo("16.00");
		assertThat(r.breakdown().coating()).isEqualByComparingTo("48.00");
		assertThat(r.perPart()).isEqualByComparingTo("321.50");
		assertThat(r.subtotal()).isEqualByComparingTo("3215.00");
		assertThat(r.gst()).isEqualByComparingTo("578.70");
		assertThat(r.total()).isEqualByComparingTo("3793.70");
		assertThat(r.currency()).isEqualTo("INR");
		assertThat(r.isSample()).isTrue();
		verify(events).publishEvent(any(EstimateCalculated.class));
	}

	@Test
	void noPowderCoatMeansZeroCoating() {
		EstimateResponse r = service.compute(new EstimateRequest("MS", new BigDecimal("2"), new BigDecimal("500"),
				new BigDecimal("400"), new BigDecimal("1800"), 4, 2, false, 1));
		assertThat(r.breakdown().coating()).isEqualByComparingTo("0");
		assertThat(r.perPart()).isEqualByComparingTo("273.50");
		verify(events, never()).publishEvent(any());
	}

	@Test
	void rejectsThicknessAboveMaterialMaximum() {
		assertThatThrownBy(() -> service.compute(new EstimateRequest("MS", new BigDecimal("20"), new BigDecimal("500"),
				new BigDecimal("400"), new BigDecimal("1800"), 1, 0, false, 1)))
				.isInstanceOf(ApiException.class)
				.hasMessageContaining("thicknessMm");
	}

	@Test
	void rejectsUnknownMaterial() {
		when(materials.findByCodeIgnoreCase("XX")).thenReturn(Optional.empty());
		assertThatThrownBy(() -> service.compute(new EstimateRequest("XX", BigDecimal.ONE, BigDecimal.TEN,
				BigDecimal.TEN, BigDecimal.TEN, 1, 0, false, 1)))
				.isInstanceOf(ApiException.class)
				.hasMessageContaining("Unknown material");
	}
}
