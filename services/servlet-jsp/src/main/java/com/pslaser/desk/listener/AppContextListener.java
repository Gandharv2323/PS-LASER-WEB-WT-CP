package com.pslaser.desk.listener;

import com.pslaser.desk.dao.Db;
import com.pslaser.desk.model.WorkOrder;
import com.pslaser.desk.util.AppLog;
import java.util.Date;
import java.util.concurrent.atomic.AtomicLong;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.sql.DataSource;

/**
 * LISTENER (JSP-related technologies: filters/listeners) - ServletContextListener.
 * Runs once when Tomcat deploys /pslaser (before any servlet) and once on undeploy.
 *
 * DATA STORAGE: puts application-scope objects into the ServletContext:
 *   "ds"          - the JDBC connection pool (shared by all requests)
 *   "appLog"      - file-backed AppLog (WEB-INF/logs/order-desk.log)
 *   "startedAt"   - deployment time (shown on /about)
 *   "statuses"    - the production stage list, read by JSPs as ${applicationScope.statuses}
 *   "totalHits"   - AtomicLong, thread-safe counter incremented by RequestLogFilter (see ConcurrencyServlet)
 *   "activeSessions" - AtomicLong maintained by SessionCounterListener
 * Registered in web.xml (listener element) so the order relative to SessionCounterListener is explicit.
 */
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();
        AppLog log = new AppLog(ctx);
        ctx.setAttribute("appLog", log);
        ctx.setAttribute(Db.ATTR, Db.create(ctx));
        ctx.setAttribute("startedAt", new Date());
        ctx.setAttribute("statuses", WorkOrder.STATUSES);
        ctx.setAttribute("totalHits", new AtomicLong());
        ctx.setAttribute("activeSessions", new AtomicLong());
        log.log("context initialised - " + ctx.getServerInfo() + ", servlet API "
                + ctx.getMajorVersion() + "." + ctx.getMinorVersion() + ", log file " + log.getFile());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();
        AppLog log = (AppLog) ctx.getAttribute("appLog");
        if (log != null) log.log("context destroyed - closing JDBC pool");
        Db.close((DataSource) ctx.getAttribute(Db.ATTR));
    }
}
