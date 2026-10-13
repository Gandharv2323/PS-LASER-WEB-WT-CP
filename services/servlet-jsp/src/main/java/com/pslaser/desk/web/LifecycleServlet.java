package com.pslaser.desk.web;

import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * SERVLET LIFE CYCLE demo. Declared in web.xml with:
 *   load-on-startup 1  -> Tomcat loads the class, constructs it and calls init() at DEPLOY
 *                        time instead of on the first request.
 *   init-param         -> "shopName" and "maxEvents", read with getInitParameter() in init().
 *
 * Life cycle:  [class loaded] -> constructor -> init(ServletConfig)  (once)
 *              -> service(req,res) -> doGet/doPost ...             (once per request, many threads)
 *              -> destroy()                                         (once, on undeploy/shutdown)
 * Each phase is recorded in an in-memory list (shown at /lifecycle) AND in the file log,
 * so destroy() is still visible after a redeploy (WEB-INF/logs/order-desk.log or catalina log).
 */
public class LifecycleServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final List<String> events = Collections.synchronizedList(new ArrayList<String>());
    private final AtomicLong serviceCalls = new AtomicLong();
    private final SimpleDateFormat fmt = new SimpleDateFormat("HH:mm:ss.SSS");
    private String shopName;
    private int maxEvents = 20;
    private Date initAt;

    public LifecycleServlet() {
        record("constructor called (Tomcat instantiated the servlet class)");
    }

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);   // keeps getServletConfig()/getServletContext() working
        shopName = config.getInitParameter("shopName");
        String max = config.getInitParameter("maxEvents");
        if (max != null) maxEvents = Integer.parseInt(max);
        initAt = new Date();
        record("init() - init-params: shopName=" + shopName + ", maxEvents=" + maxEvents
                + "; context-param supportWhatsApp=" + getServletContext().getInitParameter("supportWhatsApp"));
        log("LifecycleServlet init()");   // GenericServlet.log -> Tomcat localhost log
        AppLog fileLog = (AppLog) getServletContext().getAttribute("appLog");
        if (fileLog != null) fileLog.log("LifecycleServlet init() (load-on-startup)");
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        long n = serviceCalls.incrementAndGet();
        record("service() #" + n + " " + req.getMethod() + " on thread " + Thread.currentThread().getName());
        super.service(req, resp);   // HttpServlet.service dispatches to doGet/doPost/...
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        record("doGet()");
        List<String> copy;
        synchronized (events) { copy = new ArrayList<>(events); }
        Collections.reverse(copy);
        req.setAttribute("events", copy);
        req.setAttribute("shopName", shopName);
        req.setAttribute("initAt", initAt);
        req.setAttribute("serviceCalls", serviceCalls.get());
        req.getRequestDispatcher("/WEB-INF/views/lifecycle.jsp").forward(req, resp);
    }

    @Override
    public void destroy() {
        record("destroy() - releasing resources");
        AppLog fileLog = (AppLog) getServletContext().getAttribute("appLog");
        if (fileLog != null) fileLog.log("LifecycleServlet destroy() after " + serviceCalls.get() + " service() calls");
        log("LifecycleServlet destroy()");
    }

    private void record(String what) {
        synchronized (events) {
            events.add(fmt.format(new Date()) + "  " + what);
            while (events.size() > Math.max(maxEvents, 5)) events.remove(2);   // keep constructor + init lines
        }
    }
}
