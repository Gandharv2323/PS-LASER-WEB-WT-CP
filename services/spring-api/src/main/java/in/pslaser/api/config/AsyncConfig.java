package in.pslaser.api.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Enables {@code @Async} so application-event listeners (activity log, WebSocket push)
 * run on a background thread pool and never slow down the HTTP request.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

	@Bean(name = "taskExecutor")
	public Executor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(2);
		executor.setMaxPoolSize(4);
		executor.setQueueCapacity(200);
		executor.setThreadNamePrefix("pslaser-async-");
		executor.initialize();
		return executor;
	}
}
