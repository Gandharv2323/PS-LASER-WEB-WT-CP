package com.pslaser.desk.filter;

import com.pslaser.desk.util.AppLog;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * FILTER #2 - counts every request in the application-scope AtomicLong "totalHits"
 * (thread-safe, see ConcurrencyServlet) and appends POST requests + slow requests to
 * the file log (WEB-INF/logs/order-desk.log). Demonstrates code running before AND
 * after the servlet: everything after chain.doFilter() runs once the response is built.
 */
public class RequestLogFilter implements Filter {
    private ServletContext ctx;

    @Override
    public void init(FilterConfig cfg) { ctx = cfg.getServletContext(); }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        long start = System.nanoTime();
        ((AtomicLong) ctx.getAttribute("totalHits")).incrementAndGet();
        try {
            chain.doFilter(req, res);
        } finally {
            HttpServletRequest r = (HttpServletRequest) req;
            long ms = (System.nanoTime() - start) / 1_000_000;
            if ("POST".equals(r.getMethod()) || ms > 1000) {
                AppLog log = (AppLog) ctx.getAttribute("appLog");
                if (log != null) {
                    log.log(r.getMethod() + " " + r.getRequestURI() + " -> "
                            + ((HttpServletResponse) res).getStatus() + " in " + ms + " ms from " + r.getRemoteAddr());
                }
            }
        }
    }

    @Override
    public void destroy() { }
}
