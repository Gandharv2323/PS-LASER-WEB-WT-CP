package in.pslaser.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Messaging: STOMP over WebSocket with Spring's in-memory simple broker.
 *
 * <p>Clients connect to {@code ws://localhost:8081/ws} (native WebSocket) or
 * {@code http://localhost:8081/ws-sockjs} (SockJS fallback) and subscribe to
 * {@code /topic/work-orders}. {@link in.pslaser.api.event.ActivityEventListener} publishes a
 * message there each time a work order changes status.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final PsLaserProperties props;

	public WebSocketConfig(PsLaserProperties props) {
		this.props = props;
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.enableSimpleBroker("/topic");
		registry.setApplicationDestinationPrefixes("/app");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		String[] origins = props.cors().allowedOrigins().toArray(String[]::new);
		registry.addEndpoint("/ws").setAllowedOriginPatterns(origins);
		registry.addEndpoint("/ws-sockjs").setAllowedOriginPatterns(origins).withSockJS();
	}
}
