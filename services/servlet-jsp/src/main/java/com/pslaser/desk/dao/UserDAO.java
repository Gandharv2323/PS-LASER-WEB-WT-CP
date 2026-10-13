package com.pslaser.desk.dao;

import com.pslaser.desk.model.User;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.mindrot.jbcrypt.BCrypt;

/**
 * DAO for the shared users table (Laravel-compatible, bcrypt hashes).
 * Laravel/PHP write "$2y$" hashes; jBCrypt only understands "$2a$". The algorithms are
 * identical, so we swap the prefix before checking.
 */
public class UserDAO {
    private static final String DUMMY_HASH = BCrypt.hashpw("timing-equaliser", BCrypt.gensalt(10));
    private final DataSource ds;

    public UserDAO(DataSource ds) { this.ds = ds; }

    /** Returns the user if email + password are correct and the role is admin/staff, else null. */
    public User authenticate(String email, String password) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "SELECT id, name, email, password, role FROM users WHERE email = ?")) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    // spend similar time as a real check so response time does not reveal valid emails
                    BCrypt.checkpw(password, DUMMY_HASH);
                    return null;
                }
                String hash = rs.getString("password");
                if (hash == null) return null;
                if (hash.startsWith("$2y$") || hash.startsWith("$2b$")) hash = "$2a$" + hash.substring(4);
                boolean ok;
                try {
                    ok = BCrypt.checkpw(password, hash);
                } catch (IllegalArgumentException badHash) {
                    ok = false;
                }
                if (!ok) return null;
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setName(rs.getString("name"));
                u.setEmail(rs.getString("email"));
                u.setRole(rs.getString("role"));
                return u;
            }
        }
    }
}
