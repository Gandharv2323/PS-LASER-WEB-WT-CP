package com.pslaser.desk.web;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import javax.servlet.AsyncContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * SERVLET CONCURRENCY.
 *
 * Tomcat keeps ONE instance of each servlet and runs service() on a pool of worker threads,
 * so every instance field is shared by all simultaneous requests.
 *
 *  - unsafeHits: a plain long field. "unsafeHits++" is read-modify-write (3 steps); two threads
 *    can read the same value and both write value+1, so an update is LOST. NEVER do this for
 *    shared state. (Kept here on purpose, only to demonstrate the problem.)
 *  - safeHits: AtomicLong.incrementAndGet() is a single atomic CPU operation (CAS) - no lost updates
 *    and no locking. Alternatives: synchronized blocks, or keep data in local variables /
 *    request attributes, which are per-thread and need no protection at all.
 *  - SingleThreadModel (javax.servlet.SingleThreadModel) used to promise "one thread per instance"
 *    but was deprecated in Servlet 2.4 and is NOT used here: it hurts throughput and still does not
 *    protect static fields, sessions or the ServletContext.
 *  - asyncSupported = true: with ?async=1 the request thread is released (request.startAsync())
 *    while a background thread does the slow work, then dispatches to the JSP. All filters in the
 *    chain are also marked async-supported in web.xml, otherwise startAsync() throws.
 *
 * /concurrency?burst=1 starts 32 threads x 2000 increments on both counters so you can SEE the
 * unsafe counter lose updates while the AtomicLong is always exact.
 */
@WebServlet(name = "ConcurrencyServlet", urlPatterns = "/concurrency", asyncSupported = true)
public class ConcurrencyServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private long unsafeHits = 0;                      // DELIBERATELY NOT THREAD-SAFE (demo only)
    private final AtomicLong safeHits = new AtomicLong();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        unsafeHits++;
        safeHits.incrementAndGet();

        if ("1".equals(req.getParameter("burst"))) runBurst(req);

        if ("1".equals(req.getParameter("async")) && req.isAsyncSupported()) {
            final AsyncContext ac = req.startAsync();
            ac.setTimeout(10000);
            final String requestThread = Thread.currentThread().getName();
            ac.start(() -> {
                try {
                    Thread.sleep(300);   // pretend: slow call to a machine controller
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                ac.getRequest().setAttribute("asyncInfo", "Request thread " + requestThread
                        + " was released; work finished on " + Thread.currentThread().getName());
                fill((HttpServletRequest) ac.getRequest());
                ac.dispatch("/WEB-INF/views/concurrency.jsp");
            });
            return;
        }
        fill(req);
        req.getRequestDispatcher("/WEB-INF/views/concurrency.jsp").forward(req, resp);
    }

    private void fill(HttpServletRequest req) {
        req.setAttribute("unsafeHits", unsafeHits);
        req.setAttribute("safeHits", safeHits.get());
        req.setAttribute("totalHits", getServletContext().getAttribute("totalHits"));
        req.setAttribute("thread", Thread.currentThread().getName());
    }

    private void runBurst(HttpServletRequest req) throws ServletException {
        final int threads = 32, perThread = 2000;
        final long[] plain = {0};                        // shared, unsynchronised
        final AtomicLong atomic = new AtomicLong();
        final CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        for (int t = 0; t < threads; t++) {
            pool.submit(() -> {
                try { start.await(); } catch (InterruptedException e) { return; }
                for (int i = 0; i < perThread; i++) {
                    long v = plain[0];                   // read
                    if ((i & 63) == 0) Thread.yield();   // widen the race window a little
                    plain[0] = v + 1;                    // write (may overwrite another thread's update)
                    atomic.incrementAndGet();
                }
            });
        }
        start.countDown();
        pool.shutdown();
        try {
            pool.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            throw new ServletException(e);
        }
        long expected = (long) threads * perThread;
        req.setAttribute("burstExpected", expected);
        req.setAttribute("burstUnsafe", plain[0]);
        req.setAttribute("burstAtomic", atomic.get());
        req.setAttribute("burstLost", expected - plain[0]);
    }
}
