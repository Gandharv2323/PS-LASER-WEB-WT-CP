package com.pslaser.desk.filter;

import com.pslaser.desk.model.User;
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * FILTER #3 - mapped to /staff/* in web.xml. Lets the request through only when the
 * HttpSession holds a "user" with role admin/staff; otherwise redirects to /login and
 * remembers where the user wanted to go (?next=...).
 * request.getSession(false) is used so that anonymous visitors do NOT get a session.
 * Also sends no-cache headers so the browser Back button cannot show staff pages after logout.
 */
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig cfg) { }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        HttpSession session = request.getSession(false);
        User user = session == null ? null : (User) session.getAttribute("user");

        if (user != null && user.isStaff()) {
            // CSRF guard for every state-changing staff request: the hidden "csrf" form field
            // must equal the random token stored in the session at login.
            if ("POST".equals(request.getMethod())) {
                Object expected = session.getAttribute("csrf");
                if (expected == null || !expected.equals(request.getParameter("csrf"))) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Form expired - reload the page and try again.");
                    return;
                }
            }
            response.setHeader("Cache-Control", "no-store");
            chain.doFilter(req, res);
            return;
        }
        String next = request.getRequestURI().substring(request.getContextPath().length());
        if ("GET".equals(request.getMethod()) && request.getQueryString() != null) next += "?" + request.getQueryString();
        String url = request.getContextPath() + "/login?next=" + java.net.URLEncoder.encode(next, "UTF-8")
                + (user != null ? "&denied=1" : "");
        // encodeRedirectURL appends ;jsessionid=... only if the client does not accept cookies
        response.sendRedirect(response.encodeRedirectURL(url));
    }

    @Override
    public void destroy() { }
}
