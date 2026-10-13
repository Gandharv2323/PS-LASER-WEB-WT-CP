package com.pslaser.desk.web;

import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * SESSIONS - logout. POST only (with CSRF token) so a link/image on another site cannot
 * log staff out. session.invalidate() fires SessionCounterListener.sessionDestroyed().
 * The "remember my e-mail" cookie is deliberately kept.
 */
@WebServlet(name = "LogoutServlet", urlPatterns = "/logout")
public class LogoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            Object expected = session.getAttribute("csrf");
            if (expected != null && !expected.equals(req.getParameter("csrf"))) {
                resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Form expired - reload the page and try again.");
                return;
            }
            Object user = session.getAttribute("user");
            session.invalidate();
            AppLog log = (AppLog) getServletContext().getAttribute("appLog");
            if (user != null) log.log("logout " + ((com.pslaser.desk.model.User) user).getEmail());
        }
        resp.sendRedirect(req.getContextPath() + "/login?bye=1");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.sendRedirect(req.getContextPath() + "/staff/orders");
    }
}
