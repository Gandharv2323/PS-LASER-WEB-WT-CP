package com.pslaser.desk.web;

import com.pslaser.desk.dao.WorkOrderDAO;
import com.pslaser.desk.model.WorkOrder;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

/**
 * CONTROLLER - staff work-order list (protected by AuthFilter, /staff/*).
 * PARAMETER DATA: request.getParameterValues("status") reads the multi-select checkbox
 * filter (?status=cutting&status=bending) and getParameter("q") the search box.
 * Unknown status values are dropped (whitelist validation) before reaching SQL.
 */
@WebServlet(name = "StaffOrdersServlet", urlPatterns = "/staff/orders")
public class StaffOrdersServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private transient WorkOrderDAO dao;

    @Override
    public void init() {
        dao = new WorkOrderDAO((DataSource) getServletContext().getAttribute("ds"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String[] raw = req.getParameterValues("status");
        List<String> selected = new ArrayList<>();
        if (raw != null) for (String s : raw) if (WorkOrder.isValidStatus(s) && !selected.contains(s)) selected.add(s);
        String q = TrackServlet.trim(req.getParameter("q"));
        if (q.length() > 60) q = q.substring(0, 60);
        try {
            req.setAttribute("orders", dao.list(selected.toArray(new String[0]), q));
            req.setAttribute("counts", dao.countByStatus());
        } catch (SQLException e) {
            throw new ServletException("Could not load work orders", e);
        }
        req.setAttribute("selected", selected);
        req.setAttribute("selectedCsv", String.join(",", selected));
        req.setAttribute("q", q);
        req.setAttribute("allStatuses", Arrays.asList(WorkOrder.STATUSES));
        Flash.moveToRequest(req);
        req.getRequestDispatcher("/WEB-INF/views/staff/orders.jsp").forward(req, resp);
    }
}
