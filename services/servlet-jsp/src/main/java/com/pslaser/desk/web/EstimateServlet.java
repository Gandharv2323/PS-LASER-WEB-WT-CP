package com.pslaser.desk.web;

import com.pslaser.desk.dao.RateDAO;
import com.pslaser.desk.model.EstimateRequest;
import com.pslaser.desk.model.EstimateResult;
import com.pslaser.desk.service.EstimateService;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

/**
 * CONTROLLER - laser-cutting price estimate (CONTRACT formula, shared rates table).
 *   GET  /estimate               -> form with defaults
 *   POST /estimate               -> parse + validate parameters, EstimateService.estimate(),
 *                                   forward to estimate.jsp with the EstimateResult bean
 *   POST /estimate?format=json   -> same calculation, CONTRACT estimate JSON (for tests / other apps)
 */
@WebServlet(name = "EstimateServlet", urlPatterns = "/estimate")
public class EstimateServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private transient RateDAO rates;
    private transient EstimateService service;

    @Override
    public void init() {
        rates = new RateDAO((DataSource) getServletContext().getAttribute("ds"));
        service = new EstimateService(rates);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        show(req, resp, new EstimateRequest(), new LinkedHashMap<String, String>(), null);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        EstimateRequest in = new EstimateRequest();
        Map<String, String> errors = new LinkedHashMap<>();
        in.setMaterialCode(TrackServlet.trim(req.getParameter("materialCode")).toUpperCase());
        in.setThicknessMm(num(req, "thicknessMm", errors));
        in.setLengthMm(num(req, "lengthMm", errors));
        in.setWidthMm(num(req, "widthMm", errors));
        in.setCutLengthMm(num(req, "cutLengthMm", errors));
        in.setPierces(whole(req, "pierces", errors));
        in.setBends(whole(req, "bends", errors));
        in.setQuantity(whole(req, "quantity", errors));
        String pc = req.getParameter("powderCoat");
        in.setPowderCoat("on".equals(pc) || "true".equals(pc) || "1".equals(pc));

        EstimateResult result = null;
        try {
            Map<String, String> v = service.validate(in);
            for (Map.Entry<String, String> e : v.entrySet()) errors.putIfAbsent(e.getKey(), e.getValue());
            if (errors.isEmpty()) result = service.estimate(in);
        } catch (SQLException e) {
            throw new ServletException("Estimate failed", e);
        }

        if ("json".equals(req.getParameter("format"))) {
            resp.setContentType("application/json;charset=UTF-8");
            if (result == null) {
                resp.setStatus(400);
                StringBuilder fe = new StringBuilder();
                for (Map.Entry<String, String> e : errors.entrySet())
                    fe.append(fe.length() == 0 ? "" : ",").append('"').append(e.getKey()).append("\":\"")
                      .append(e.getValue().replace("\"", "'")).append('"');
                resp.getWriter().write("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Validation failed\",\"fieldErrors\":{" + fe + "}}");
            } else {
                resp.getWriter().write(result.toJson());
            }
            return;
        }
        if (result == null) resp.setStatus(422);
        show(req, resp, in, errors, result);
    }

    private void show(HttpServletRequest req, HttpServletResponse resp, EstimateRequest in,
                      Map<String, String> errors, EstimateResult result) throws ServletException, IOException {
        try {
            req.setAttribute("materials", rates.materials());
        } catch (SQLException e) {
            throw new ServletException(e);
        }
        req.setAttribute("input", in);
        req.setAttribute("errors", errors);
        req.setAttribute("result", result);
        req.getRequestDispatcher("/WEB-INF/views/estimate.jsp").forward(req, resp);
    }

    private static double num(HttpServletRequest req, String name, Map<String, String> errors) {
        try {
            double d = Double.parseDouble(TrackServlet.trim(req.getParameter(name)));
            if (Double.isNaN(d) || Double.isInfinite(d)) throw new NumberFormatException();
            return d;
        } catch (NumberFormatException e) {
            errors.put(name, "Enter a number.");
            return 0;
        }
    }

    private static int whole(HttpServletRequest req, String name, Map<String, String> errors) {
        String raw = TrackServlet.trim(req.getParameter(name));
        if (raw.isEmpty() && !"quantity".equals(name)) return 0;
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            errors.put(name, "Enter a whole number.");
            return 0;
        }
    }
}
