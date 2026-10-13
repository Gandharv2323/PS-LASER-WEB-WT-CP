package in.pslaser.api.security;

/** The authenticated principal rebuilt from JWT claims (no DB hit per request). */
public record AuthUser(Long id, String email, String role) {
}
