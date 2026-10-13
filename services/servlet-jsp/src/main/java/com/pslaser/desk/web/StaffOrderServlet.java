package com.pslaser.desk.web;

import com.pslaser.desk.dao.WorkOrderDAO;
import com.pslaser.desk.model.User;
import com.pslaser.desk.model.WorkOrder;
import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.util.Arrays;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

/**
 * CONTROLLER - one work order: details, timeline and the "move to stage" form.
 *   GET  /staff/order?no=PSL-DEMO-002
 *   POST /staff/order   (no, status, note, csrf) -> WorkOrderDAO.updateStatus() runs an
 *        UPDATE + INSERT in ONE JDBC transaction, then Post/Redirect/Get back to the GET page.
 */
@WebServlet(name = "StaffOrderServlet", urlPatterns = "/staff/order")
public class StaffOrderServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private transient WorkOrderDAO dao;

    @Override
    public void init() {
        dao = new WorkOrderDAO((DataSource) getServletContext().getAttribute("ds"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String no = TrackServlet.trim(req.getParameter("no"));
        WorkOrder order;
        try {
            order = no.isEmpty() ? null : dao.findByOrderNo(no);
        } catch (SQLException e) {
            throw new ServletException(e);
        }
        if (order == null) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND, "No work order " + no);
            return;
        }
        req.setAttribute("order", order);
        req.setAttribute("allStatuses", Arrays.asList(WorkOrder.STATUSES));
        Flash.moveToRequest(req);
        req.getRequestDispatcher("/WEB-INF/views/staff/order.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String no = TrackServlet.trim(req.getParameter("no"));
        String status = TrackServlet.trim(req.getParameter("status"));
        String note = TrackServlet.trim(req.getParameter("note"));
        String back = req.getContextPath() + "/staff/order?no=" + URLEncoder.encode(no, "UTF-8");

        if (!WorkOrder.isValidStatus(status)) {
            Flash.set(req, "danger", "Pick a valid production stage.");
        } else if (note.length() > 255) {
            Flash.set(req, "danger", "Note is too long (255 characters max).");
        } else {
            try {
                WorkOrder current = dao.findByOrderNo(no);
                if (current == null) {
                    resp.sendError(HttpServletResponse.SC_NOT_FOUND, "No work order " + no);
                    return;
                }
                User user = (User) req.getSession().getAttribute("user");
                String fullNote = (note.isEmpty() ? "Status changed" : note) + " - " + user.getName();
                if (fullNote.length() > 255) fullNote = fullNote.substring(0, 255);
                dao.updateStatus(no, status, fullNote);
                ((AppLog) getServletContext().getAttribute("appLog"))
                        .log("status " + no + " " + current.getStatus() + " -> " + status + " by " + user.getEmail());
                Flash.set(req, "success", no + " moved from " + current.getStatus() + " to " + status + ".");
            } catch (SQLException e) {
                throw new ServletException("Status update failed (transaction rolled back)", e);
            }
        }
        resp.sendRedirect(resp.encodeRedirectURL(back));   // PRG: 302 -> GET
    }
}
