package com.pslaser.desk.web;

import com.pslaser.desk.dao.UserDAO;
import com.pslaser.desk.model.User;
import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.security.SecureRandom;
import java.sql.SQLException;
import java.util.Base64;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.sql.DataSource;

/**
 * SESSIONS + COOKIES - staff login.
 *   GET  /login  -> form; e-mail pre-filled from the "ps_staff_email" cookie ("remember my e-mail")
 *   POST /login  -> check bcrypt hash via UserDAO; on success:
 *        * request.changeSessionId() (Servlet 3.1) defeats session fixation
 *        * User bean + CSRF token stored in the HttpSession (session scope)
 *        * cookie set (30 days) or deleted (maxAge 0) depending on the checkbox
 *        * 303 redirect (Post/Redirect/Get) to ?next=... or /staff/orders,
 *          passed through encodeRedirectURL so cookie-less browsers keep the session via ;jsessionid=
 * The session timeout is configured in web.xml (session-config/session-timeout = 30 min).
 */
@WebServlet(name = "LoginServlet", urlPatterns = "/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    static final String EMAIL_COOKIE = "ps_staff_email";
    private static final SecureRandom RANDOM = new SecureRandom();
    private transient UserDAO users;

    @Override
    public void init() {
        users = new UserDAO((DataSource) getServletContext().getAttribute("ds"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String remembered = TrackServlet.cookie(req, EMAIL_COOKIE);
        req.setAttribute("email", remembered == null ? "" : remembered);
        req.setAttribute("remember", remembered != null);
        req.setAttribute("next", safeNext(req.getParameter("next")));
        req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String email = TrackServlet.trim(req.getParameter("email")).toLowerCase();
        String password = req.getParameter("password") == null ? "" : req.getParameter("password");
        boolean remember = req.getParameter("remember") != null;   // checkbox: present only when ticked
        String next = safeNext(req.getParameter("next"));
        req.setAttribute("email", email);
        req.setAttribute("remember", remember);
        req.setAttribute("next", next);

        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$") || password.isEmpty()) {
            req.setAttribute("error", "Enter your e-mail address and password.");
            req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
            return;
        }
        User user;
        try {
            user = users.authenticate(email, password);
        } catch (SQLException e) {
            throw new ServletException("Login lookup failed", e);
        }
        AppLog log = (AppLog) getServletContext().getAttribute("appLog");
        if (user == null || !user.isStaff()) {
            log.log("login FAILED for " + email);
            req.setAttribute("error", user == null ? "Wrong e-mail or password." : "This desk is for PS Laser staff only.");
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
            return;
        }

        HttpSession session = req.getSession(true);
        req.changeSessionId();
        session.setAttribute("user", user);
        byte[] token = new byte[24];
        RANDOM.nextBytes(token);
        session.setAttribute("csrf", Base64.getUrlEncoder().withoutPadding().encodeToString(token));
        session.setAttribute("loginAt", new java.util.Date());

        Cookie c = new Cookie(EMAIL_COOKIE, email);
        c.setPath(req.getContextPath().isEmpty() ? "/" : req.getContextPath());
        c.setHttpOnly(true);
        c.setMaxAge(remember ? 60 * 60 * 24 * 30 : 0);   // 0 = delete the cookie
        resp.addCookie(c);

        log.log("login ok " + email + " role=" + user.getRole());
        resp.setStatus(HttpServletResponse.SC_SEE_OTHER);
        resp.setHeader("Location", resp.encodeRedirectURL(req.getContextPath() + next));
    }

    /** Only allow local paths (blocks open redirects such as next=//evil.example). */
    static String safeNext(String next) {
        if (next == null || !next.startsWith("/") || next.startsWith("//") || next.contains("\\")
                || next.startsWith("/login")) {
            return "/staff/orders";
        }
        return next;
    }
}
