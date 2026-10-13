package com.pslaser.desk.web;

import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * DATA STORAGE overview - shows the four places this app keeps data:
 *   1. Database (MySQL via JDBC pool)            - work orders, users, rates
 *   2. ServletContext attributes (application)   - pool, counters, start time, stage list
 *   3. HttpSession attributes (one per visitor)  - logged-in User, CSRF token, flash message
 *   4. File store                                - WEB-INF/logs/order-desk.log (AppLog)
 * plus request attributes (one request only) and cookies (stored in the browser).
 * Also lists web.xml context-params (getInitParameterNames).
 */
@WebServlet(name = "AboutServlet", urlPatterns = "/about")
public class AboutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletContext ctx = getServletContext();
        Map<String, String> app = new LinkedHashMap<>();
        for (String n : Collections.list(ctx.getAttributeNames())) {
            if (n.startsWith("org.apache") || n.startsWith("javax.servlet")) continue;   // container internals
            Object v = ctx.getAttribute(n);
            app.put(n, v instanceof String[] ? String.join(", ", (String[]) v) : v.getClass().getSimpleName() + ": " + abbreviate(v));
        }
        Map<String, String> params = new LinkedHashMap<>();
        for (String n : Collections.list(ctx.getInitParameterNames())) {
            params.put(n, n.contains("password") ? "(hidden)" : ctx.getInitParameter(n));
        }
        Map<String, String> sess = new LinkedHashMap<>();
        HttpSession s = req.getSession(false);
        if (s != null) {
            for (String n : Collections.list(s.getAttributeNames()))
                sess.put(n, "csrf".equals(n) ? "(random token, hidden)" : abbreviate(s.getAttribute(n)));
        }
        AppLog log = (AppLog) ctx.getAttribute("appLog");
        req.setAttribute("appAttrs", app);
        req.setAttribute("contextParams", params);
        req.setAttribute("sessionAttrs", sess);
        req.setAttribute("sessionId", s == null ? null : s.getId().substring(0, 8) + "...");
        req.setAttribute("logFile", log.getFile().getAbsolutePath());
        req.setAttribute("logTail", log.tail(25));
        if (req.getAttribute("from") == null) req.setAttribute("from", req.getParameter("from"));   // set by a forward?
        req.getRequestDispatcher("/WEB-INF/views/about.jsp").forward(req, resp);
    }

    private static String abbreviate(Object v) {
        if (v instanceof com.pslaser.desk.model.User) {
            com.pslaser.desk.model.User u = (com.pslaser.desk.model.User) v;
            return "User " + u.getEmail() + " (" + u.getRole() + ")";
        }
        String s = String.valueOf(v);
        return s.length() > 90 ? s.substring(0, 90) + "..." : s;
    }
}
