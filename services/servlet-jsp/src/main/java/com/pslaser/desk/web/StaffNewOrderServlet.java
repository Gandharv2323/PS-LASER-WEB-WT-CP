package com.pslaser.desk.web;

import com.pslaser.desk.dao.WorkOrderDAO;
import com.pslaser.desk.model.User;
import com.pslaser.desk.model.WorkOrder;
import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

/**
 * CONTROLLER - create a work order (FORM VALIDATION + PRG).
 * GET shows an empty form with a suggested order number. POST reads every field with
 * request.getParameter(), validates server-side (never trust the browser's "required"),
 * re-displays the form with per-field errors (forward) or saves and redirects (303-style PRG).
 */
@WebServlet(name = "StaffNewOrderServlet", urlPatterns = "/staff/orders/new")
public class StaffNewOrderServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    static final String[] MACHINES = {
        "hsg-3kw-fiber-laser", "genesis-1-5kw-fiber-laser", "smart-bend-175t-press-brake",
        "amada-vela-ii-32t-turret-punch", "amada-pega-16t-turret-punch", "hsg-1-5kw-laser-welder",
        "plc-powder-coating-plant"};
    private transient WorkOrderDAO dao;

    @Override
    public void init() {
        dao = new WorkOrderDAO((DataSource) getServletContext().getAttribute("ds"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        WorkOrder form = new WorkOrder();
        try {
            form.setOrderNo(dao.suggestOrderNo(Calendar.getInstance().get(Calendar.YEAR)));
        } catch (SQLException e) {
            throw new ServletException(e);
        }
        show(req, resp, form, new LinkedHashMap<String, String>(), "");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        WorkOrder o = new WorkOrder();
        Map<String, String> errors = new LinkedHashMap<>();
        o.setOrderNo(TrackServlet.trim(req.getParameter("orderNo")).toUpperCase());
        o.setCustomerName(TrackServlet.trim(req.getParameter("customerName")));
        o.setCustomerPhone(TrackServlet.trim(req.getParameter("customerPhone")).replaceAll("[\\s-]", ""));
        o.setDescription(TrackServlet.trim(req.getParameter("description")));
        String machine = TrackServlet.trim(req.getParameter("machineSlug"));
        o.setMachineSlug(machine.isEmpty() ? null : machine);
        o.setStatus("received");
        String qty = TrackServlet.trim(req.getParameter("quantity"));
        String due = TrackServlet.trim(req.getParameter("dueDate"));

        if (!o.getOrderNo().matches("PSL-[A-Z0-9-]{3,25}")) errors.put("orderNo", "Use the format PSL-2026-0001.");
        if (o.getCustomerName().length() < 2 || o.getCustomerName().length() > 120) errors.put("customerName", "Enter the customer name (2-120 characters).");
        if (!o.getCustomerPhone().matches("[6-9][0-9]{9}")) errors.put("customerPhone", "Enter a 10-digit Indian mobile number.");
        if (o.getDescription().length() < 5 || o.getDescription().length() > 255) errors.put("description", "Describe the job (5-255 characters).");
        if (o.getMachineSlug() != null && !Arrays.asList(MACHINES).contains(o.getMachineSlug())) errors.put("machineSlug", "Pick a machine from the list.");
        try {
            o.setQuantity(Integer.parseInt(qty));
            if (o.getQuantity() < 1 || o.getQuantity() > 100000) errors.put("quantity", "Quantity must be 1-100000.");
        } catch (NumberFormatException e) {
            errors.put("quantity", "Quantity must be a whole number.");
        }
        if (!due.isEmpty()) {
            try {
                SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
                f.setLenient(false);
                o.setDueDate(f.parse(due));
            } catch (ParseException e) {
                errors.put("dueDate", "Use a valid date.");
            }
        }
        try {
            if (!errors.containsKey("orderNo") && dao.orderNoExists(o.getOrderNo())) errors.put("orderNo", "That order number already exists.");
            if (!errors.isEmpty()) {
                resp.setStatus(422);
                show(req, resp, o, errors, due);
                return;
            }
            dao.create(o);
        } catch (SQLException e) {
            throw new ServletException("Could not create work order", e);
        }
        User user = (User) req.getSession().getAttribute("user");
        ((AppLog) getServletContext().getAttribute("appLog")).log("created " + o.getOrderNo() + " by " + user.getEmail());
        Flash.set(req, "success", "Work order " + o.getOrderNo() + " created. Share the order number and mobile with the customer for tracking.");
        resp.sendRedirect(resp.encodeRedirectURL(req.getContextPath() + "/staff/order?no=" + URLEncoder.encode(o.getOrderNo(), "UTF-8")));
    }

    private void show(HttpServletRequest req, HttpServletResponse resp, WorkOrder form, Map<String, String> errors, String due)
            throws ServletException, IOException {
        req.setAttribute("form", form);
        req.setAttribute("errors", errors);
        req.setAttribute("dueDate", due);
        req.setAttribute("machines", MACHINES);
        req.getRequestDispatcher("/WEB-INF/views/staff/order-new.jsp").forward(req, resp);
    }
}
