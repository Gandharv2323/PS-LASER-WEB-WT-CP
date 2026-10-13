package in.pslaser.api.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.pslaser.api.activity.ActivityLogRepository;
import in.pslaser.api.domain.User;
import in.pslaser.api.repository.UserRepository;
import in.pslaser.api.security.AuthUser;
import in.pslaser.api.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Full-stack integration test: real Spring context, real security filter chain, real JPA
 * against an in-memory H2 database (MySQL mode, test profile). Only the MongoDB repository is
 * mocked so the test needs no running MongoDB.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

	static final String ADMIN_EMAIL = "it-admin@pslaser.test";
	static final String ADMIN_PASSWORD = "it-admin-pass-123"; // test-only value

	@Autowired
	MockMvc mvc;
	@Autowired
	ObjectMapper json;
	@Autowired
	UserRepository users;
	@Autowired
	PasswordEncoder encoder;
	@Autowired
	JwtService jwtService;
	@Autowired
	JdbcTemplate jdbc;
	@MockitoBean
	ActivityLogRepository activityRepository;

	@BeforeEach
	void ensureAdmin() {
		if (users.findByEmailIgnoreCase(ADMIN_EMAIL).isEmpty()) {
			User u = new User();
			u.setName("IT Admin");
			u.setEmail(ADMIN_EMAIL);
			u.setPassword(encoder.encode(ADMIN_PASSWORD));
			u.setRole("admin");
			users.save(u);
		}
	}

	@Test
	void passwordEncoderWritesAndAcceptsLaravelStyle2yHashes() {
		String hash = encoder.encode("secret-value");
		assertThat(hash).startsWith("$2y$10$");
		assertThat(encoder.matches("secret-value", hash)).isTrue();
		// a $2a$ hash (e.g. from Node bcryptjs) is accepted too
		String hash2a = new BCryptPasswordEncoder().encode("secret-value");
		assertThat(encoder.matches("secret-value", hash2a)).isTrue();
	}

	@Test
	void adminEndpointsNeedAValidAdminToken() throws Exception {
		// 1. no token -> 401 in CONTRACT error format
		mvc.perform(get("/api/admin/work-orders"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.error").value("Unauthorized"));
		mvc.perform(get("/api/admin/work-orders").header("Authorization", "Bearer not.a.jwt"))
				.andExpect(status().isUnauthorized());

		// 2. wrong password -> 401, right password -> token
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"wrong-password\"}"))
				.andExpect(status().isUnauthorized());
		String token = login(ADMIN_EMAIL, ADMIN_PASSWORD);

		AuthUser claims = jwtService.verify(token).orElseThrow();
		assertThat(claims.email()).isEqualTo(ADMIN_EMAIL);
		assertThat(claims.role()).isEqualTo("admin");

		// 3. with token -> 200
		mvc.perform(get("/api/admin/work-orders").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.orderNo == 'PSL-DEMO-001')]").exists());
		mvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(ADMIN_EMAIL))
				.andExpect(jsonPath("$.password").doesNotExist());

		// 4. @Transactional status change inserts a work_order_events row
		Integer before = jdbc.queryForObject("select count(*) from work_order_events where work_order_id = 1", Integer.class);
		mvc.perform(post("/api/admin/work-orders/1/events").header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"welding\",\"note\":\"IT test\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("welding"));
		Integer after = jdbc.queryForObject("select count(*) from work_order_events where work_order_id = 1", Integer.class);
		assertThat(after).isEqualTo(before + 1);
		assertThat(jdbc.queryForObject("select status from work_orders where id = 1", String.class)).isEqualTo("welding");

		// 5. the async listener wrote STATUS_CHANGED + LOGIN activity documents (MongoDB repo is a mock here)
		verify(activityRepository, timeout(3000)).save(argThat(a -> "STATUS_CHANGED".equals(a.getType())));
		verify(activityRepository, timeout(3000)).save(argThat(a -> "LOGIN".equals(a.getType())));
	}

	@Test
	void customerCanRegisterButNotUseAdminEndpoints() throws Exception {
		String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
				{"name":"IT Customer","email":"it-customer@pslaser.test","phone":"9000000009","password":"customer-pass-1"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.user.role").value("customer"))
				.andExpect(jsonPath("$.user.password").doesNotExist())
				.andReturn().getResponse().getContentAsString();
		String token = json.readTree(body).get("token").asText();

		mvc.perform(get("/api/admin/enquiries").header("Authorization", "Bearer " + token))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.status").value(403));
		mvc.perform(get("/api/me/quotes").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk());

		// duplicate email -> 409
		mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
				{"name":"Again","email":"it-customer@pslaser.test","phone":"9000000009","password":"customer-pass-1"}"""))
				.andExpect(status().isConflict());
	}

	@Test
	void publicTrackingChecksThePhone() throws Exception {
		mvc.perform(get("/api/work-orders/track").param("orderNo", "PSL-DEMO-001").param("phone", "9000000001"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.orderNo").value("PSL-DEMO-001"))
				.andExpect(jsonPath("$.customerPhone").value("******0001"))
				.andExpect(jsonPath("$.events.length()").isNumber());
		mvc.perform(get("/api/work-orders/track").param("orderNo", "PSL-DEMO-001").param("phone", "9999999999"))
				.andExpect(status().isNotFound());
	}

	@Test
	void savedQuoteGetsAQuoteNumber() throws Exception {
		mvc.perform(post("/api/quotes").contentType(MediaType.APPLICATION_JSON).content("""
				{"materialCode":"MS","thicknessMm":2,"lengthMm":500,"widthMm":400,"cutLengthMm":1800,
				 "pierces":4,"bends":2,"powderCoat":true,"quantity":10,
				 "customerName":"IT Buyer","customerPhone":"9000000007"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.quoteNo").value(org.hamcrest.Matchers.matchesPattern("PSL-Q-\\d{8}-\\d{4}")))
				.andExpect(jsonPath("$.amountInr").value(3793.70));
	}

	@Test
	void corsPreflightAllowsContractOrigin() throws Exception {
		mvc.perform(options("/api/machines").header("Origin", "http://localhost:5173")
				.header("Access-Control-Request-Method", "GET"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
		mvc.perform(options("/api/machines").header("Origin", "http://evil.example")
				.header("Access-Control-Request-Method", "GET"))
				.andExpect(status().isForbidden());
	}

	private String login(String email, String password) throws Exception {
		String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.user.role").value("admin"))
				.andReturn().getResponse().getContentAsString();
		JsonNode node = json.readTree(body);
		return node.get("token").asText();
	}
}
