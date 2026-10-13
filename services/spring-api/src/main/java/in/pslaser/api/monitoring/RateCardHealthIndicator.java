package in.pslaser.api.monitoring;

import in.pslaser.api.domain.Setting;
import in.pslaser.api.repository.MaterialRepository;
import in.pslaser.api.repository.RateRepository;
import in.pslaser.api.repository.SettingRepository;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom Actuator health check shown as {@code "rateCard"} under /actuator/health.
 * DOWN if the MySQL rate card is empty (the estimator could not price anything).
 */
@Component("rateCard")
public class RateCardHealthIndicator implements HealthIndicator {

	private final RateRepository rates;
	private final MaterialRepository materials;
	private final SettingRepository settings;

	public RateCardHealthIndicator(RateRepository rates, MaterialRepository materials, SettingRepository settings) {
		this.rates = rates;
		this.materials = materials;
		this.settings = settings;
	}

	@Override
	public Health health() {
		try {
			long rateRows = rates.count();
			long materialRows = materials.count();
			boolean sample = !"0".equals(settings.findById("rates_are_sample").map(Setting::getValue).orElse("1"));
			Health.Builder b = (rateRows > 0 && materialRows > 0) ? Health.up() : Health.down();
			return b.withDetail("materials", materialRows)
					.withDetail("rateBands", rateRows)
					.withDetail("sampleRates", sample)
					.build();
		}
		catch (RuntimeException ex) {
			return Health.down(ex).build();
		}
	}
}
