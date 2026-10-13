package com.pslaser.desk.web;

import com.pslaser.desk.dao.WorkOrderDAO;
import com.pslaser.desk.model.WorkOrder;
import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

/**
 * CONTROLLER (MVC) for customer order tracking.
 *   GET  /track            -> empty form (order no pre-filled from the "ps_last_order" cookie)
 *   POST /track            -> validate parameters, look up via WorkOrderDAO (JDBC), put the
 *                             WorkOrder JavaBean into REQUEST scope and FORWARD to track.jsp
 * The view lives in /WEB-INF/views so the browser can never open it without the controller.
 * Tracking does not change data, so the result is rendered directly (no redirect needed).
 */
@WebServlet(name = "TrackServlet", urlPatterns = "/track")
public class TrackServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    static final String LAST_ORDER_COOKIE = "ps_last_order";
    private transient WorkOrderDAO dao;

    @Override
    public void init() {
        dao = new WorkOrderDAO((DataSource) getServletContext().getAttribute("ds"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String last = cookie(req, LAST_ORDER_COOKIE);
        req.setAttribute("orderNo", last == null ? "" : last);
        req.getRequestDispatcher("/WEB-INF/views/track.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String orderNo = trim(req.getParameter("orderNo")).toUpperCase();
        String phone = trim(req.getParameter("phone")).replaceAll("[\\s-]", "");
        if (phone.startsWith("+91")) phone = phone.substring(3);
        req.setAttribute("orderNo", orderNo);
        req.setAttribute("phone", phone);

        // parameter validation
        if (!orderNo.matches("[A-Z0-9-]{4,30}")) {
            req.setAttribute("error", "Enter the order number printed on your job card, e.g. PSL-DEMO-001.");
        } else if (!phone.matches("[0-9]{10}")) {
            req.setAttribute("error", "Enter the 10-digit mobile number you gave us.");
        } else {
            try {
                WorkOrder order = dao.findForTracking(orderNo, phone);
                AppLog log = (AppLog) getServletContext().getAttribute("appLog");
                if (order == null) {
                    // same message for "no such order" and "wrong phone" so numbers cannot be probed
                    req.setAttribute("error", "We could not find an order with that number and mobile. Check both, or ask us on WhatsApp.");
                    log.log("track miss " + orderNo);
                } else {
                    req.setAttribute("order", order);   // JavaBean -> request scope for the view
                    Cookie c = new Cookie(LAST_ORDER_COOKIE, orderNo);
                    c.setMaxAge(60 * 60 * 24 * 30);
                    c.setPath(req.getContextPath().isEmpty() ? "/" : req.getContextPath());
                    c.setHttpOnly(true);
                    resp.addCookie(c);
                    log.log("track hit " + orderNo + " status=" + order.getStatus());
                }
            } catch (SQLException e) {
                throw new ServletException("Order lookup failed", e);   // -> 500 error page from web.xml
            }
        }
        req.getRequestDispatcher("/WEB-INF/views/track.jsp").forward(req, resp);
    }

    static String trim(String s) { return s == null ? "" : s.trim(); }

    static String cookie(HttpServletRequest req, String name) {
        Cookie[] all = req.getCookies();
        if (all == null) return null;
        for (Cookie c : all) if (name.equals(c.getName())) return c.getValue();
        return null;
    }
}
