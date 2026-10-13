package in.pslaser.api.config;

import java.util.concurrent.TimeUnit;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Short MongoDB timeouts so that, when no MongoDB is reachable, activity-log writes fail
 * fast (and are only logged as warnings) instead of blocking for the 30 s driver default.
 */
@Configuration
public class MongoConfig {

	@Bean
	MongoClientSettingsBuilderCustomizer fastFailMongo() {
		return builder -> builder
				.applyToClusterSettings(c -> c.serverSelectionTimeout(2, TimeUnit.SECONDS))
				.applyToSocketSettings(s -> s.connectTimeout(2, TimeUnit.SECONDS));
	}
}
