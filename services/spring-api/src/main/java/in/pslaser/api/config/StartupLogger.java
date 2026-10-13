package in.pslaser.api.config;

import in.pslaser.api.repository.MachineRepository;
import in.pslaser.api.repository.RateRepository;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** CommandLineRunner: runs once after the context starts - prints a short readiness summary. */
@Component
public class StartupLogger implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(StartupLogger.class);

	private final Environment env;
	private final PsLaserProperties props;
	private final MachineRepository machines;
	private final RateRepository rates;

	public StartupLogger(Environment env, PsLaserProperties props, MachineRepository machines, RateRepository rates) {
		this.env = env;
		this.props = props;
		this.machines = machines;
		this.rates = rates;
	}

	@Override
	public void run(String... args) {
		try {
			log.info("PS Laser API ready on port {} | profiles={} | machines={} | rate bands={} (sample={}) | CORS={}",
					env.getProperty("local.server.port", env.getProperty("server.port", "8081")),
					Arrays.toString(env.getActiveProfiles()), machines.count(), rates.count(), rates.countBySampleTrue(),
					props.cors().allowedOrigins());
		}
		catch (RuntimeException ex) {
			log.warn("PS Laser API started but MySQL check failed: {}", ex.getMessage());
		}
	}
}
