package com.pslaser.desk.web;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * SESSION TRACKING + URL REWRITING demo (/session-demo).
 *
 * HTTP is stateless; the container ties requests together with a session id sent either
 *   (a) as the JSESSIONID cookie (default), or
 *   (b) inside the URL as ";jsessionid=..." when the browser refuses cookies.
 * response.encodeURL(url) adds (b) automatically ONLY when the container could not confirm
 * cookie support (first response of a new session, or cookies disabled). Every link on this
 * page goes through encodeURL (c:url does the same in JSP), so the visit counter keeps
 * counting even for a cookie-less client such as `curl` without a cookie jar.
 * (web.xml tracking-mode is COOKIE+URL; HttpOnly session cookie.)
 */
@WebServlet(name = "SessionDemoServlet", urlPatterns = "/session-demo")
public class SessionDemoServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if ("1".equals(req.getParameter("reset"))) {
            HttpSession old = req.getSession(false);
            if (old != null && old.getAttribute("user") == null) old.invalidate();   // never log staff out from here
            resp.sendRedirect(req.getContextPath() + "/session-demo");
            return;
        }
        HttpSession session = req.getSession(true);
        Integer visits = (Integer) session.getAttribute("demoVisits");
        visits = visits == null ? 1 : visits + 1;
        session.setAttribute("demoVisits", visits);

        req.setAttribute("visits", visits);
        req.setAttribute("isNew", session.isNew());
        req.setAttribute("fromCookie", req.isRequestedSessionIdFromCookie());
        req.setAttribute("fromUrl", req.isRequestedSessionIdFromURL());
        req.setAttribute("timeout", session.getMaxInactiveInterval());
        req.setAttribute("shortId", session.getId().substring(0, 8) + "...");
        // encodeURL in the controller (the JSP uses c:url, which calls encodeURL too)
        req.setAttribute("nextLink", resp.encodeURL(req.getContextPath() + "/session-demo"));
        req.getRequestDispatcher("/WEB-INF/views/session-demo.jsp").forward(req, resp);
    }
}
