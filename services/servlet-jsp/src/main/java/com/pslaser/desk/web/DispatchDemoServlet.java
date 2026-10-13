package com.pslaser.desk.web;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * OTHER SERVLET CAPABILITIES - request dispatching and error handling, one mode per link:
 *   ?mode=forward   RequestDispatcher.forward(): server-side hand-over, URL in the browser
 *                   stays /dispatch, the target (about) produces the whole response.
 *   ?mode=include   RequestDispatcher.include(): this servlet writes the page and pulls the
 *                   output of a JSP fragment into the middle of it.
 *   ?mode=redirect  response.sendRedirect(): 302 + Location header, browser makes a NEW request.
 *   ?mode=error     throws ServletException -> container shows the 500 error page (web.xml).
 *   ?mode=missing   response.sendError(404) -> 404 error page (web.xml).
 */
@WebServlet(name = "DispatchDemoServlet", urlPatterns = "/dispatch")
public class DispatchDemoServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String mode = req.getParameter("mode");
        if (mode == null) mode = "include";
        switch (mode) {
            case "forward":
                req.setAttribute("from", "forward (URL still says /dispatch)");
                req.getRequestDispatcher("/about").forward(req, resp);
                return;
            case "redirect":
                resp.sendRedirect(resp.encodeRedirectURL(req.getContextPath() + "/about?from=redirect"));
                return;
            case "error":
                throw new ServletException("Deliberate failure to show the 500 error page");
            case "missing":
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Deliberate 404 from DispatchDemoServlet");
                return;
            default:
                resp.setContentType("text/html;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                req.setAttribute("pageTitle", "Request dispatching");
                // include #1: the shared page header JSP fragment
                RequestDispatcher header = req.getRequestDispatcher("/WEB-INF/views/fragments/header-dyn.jsp");
                header.include(req, resp);
                out.println("<div class=\"container py-4\"><h1 class=\"h3\">RequestDispatcher.include()</h1>");
                out.println("<p>This paragraph is written by <code>DispatchDemoServlet</code>. The box below is the output of "
                        + "<code>/WEB-INF/views/fragments/shop-clock.jsp</code>, pulled in with <code>include()</code>:</p>");
                out.flush();
                req.getRequestDispatcher("/WEB-INF/views/fragments/shop-clock.jsp").include(req, resp);
                out.println("<p class=\"mt-3\">Other modes: ");
                String base = req.getContextPath() + "/dispatch?mode=";
                out.println("<a class=\"btn btn-sm btn-outline-ps m-1\" href=\"" + resp.encodeURL(base + "forward") + "\">forward</a>");
                out.println("<a class=\"btn btn-sm btn-outline-ps m-1\" href=\"" + resp.encodeURL(base + "redirect") + "\">sendRedirect</a>");
                out.println("<a class=\"btn btn-sm btn-outline-ps m-1\" href=\"" + resp.encodeURL(base + "missing") + "\">404 page</a>");
                out.println("<a class=\"btn btn-sm btn-outline-ps m-1\" href=\"" + resp.encodeURL(base + "error") + "\">500 page</a></p></div>");
                req.getRequestDispatcher("/WEB-INF/views/fragments/footer.jsp").include(req, resp);
        }
    }
}
