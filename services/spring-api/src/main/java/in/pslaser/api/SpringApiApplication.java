package in.pslaser.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point of the PS Laser REST API.
 *
 * <p>{@code @SpringBootApplication} = {@code @Configuration} + {@code @EnableAutoConfiguration}
 * + {@code @ComponentScan}. Component scanning registers every {@code @Component},
 * {@code @Service}, {@code @Repository} and {@code @RestController} under {@code in.pslaser.api}
 * as a bean in the Spring IoC container, and the container wires them together by
 * constructor injection (Dependency Injection).
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class SpringApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringApiApplication.class, args);
	}
}
