package com.pslaser.desk.listener;

import com.pslaser.desk.util.AppLog;
import java.util.concurrent.atomic.AtomicLong;
import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

/**
 * LISTENER - HttpSessionListener counting active sessions.
 * sessionCreated fires on request.getSession(true); sessionDestroyed fires on
 * session.invalidate() (logout) or when session-timeout from web.xml expires.
 * The count is an AtomicLong in the ServletContext (created by AppContextListener),
 * so concurrent logins never lose an update. Shown on /about and in the staff navbar.
 */
@WebListener
public class SessionCounterListener implements HttpSessionListener {

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        AtomicLong n = counter(se);
        long now = n.incrementAndGet();
        log(se, "session created " + se.getSession().getId().substring(0, 6) + "... active=" + now);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        AtomicLong n = counter(se);
        long now = n.updateAndGet(v -> v > 0 ? v - 1 : 0);
        log(se, "session destroyed active=" + now);
    }

    private static AtomicLong counter(HttpSessionEvent se) {
        Object o = se.getSession().getServletContext().getAttribute("activeSessions");
        return o instanceof AtomicLong ? (AtomicLong) o : new AtomicLong();
    }

    private static void log(HttpSessionEvent se, String msg) {
        AppLog log = (AppLog) se.getSession().getServletContext().getAttribute("appLog");
        if (log != null) log.log(msg);
    }
}
