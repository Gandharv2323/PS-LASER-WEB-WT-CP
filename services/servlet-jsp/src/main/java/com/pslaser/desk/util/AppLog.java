package com.pslaser.desk.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import javax.servlet.ServletContext;

/**
 * DATA STORAGE (file store) - a tiny append-only application log file.
 *
 * Location: ServletContext.getRealPath("/WEB-INF/logs") when the WAR is exploded
 * (Tomcat default), otherwise the container temp dir (javax.servlet.context.tempdir),
 * which is where getRealPath returns null (e.g. an un-exploded WAR).
 *
 * Writes are synchronized because many request threads share this one object
 * (servlet concurrency: shared mutable resource -> must be guarded).
 */
public final class AppLog {
    private final File file;
    private final SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public AppLog(ServletContext ctx) {
        File dir = null;
        String real = ctx.getRealPath("/WEB-INF/logs");
        if (real != null) {
            dir = new File(real);
        }
        if (dir == null || !(dir.isDirectory() || dir.mkdirs())) {
            File tmp = (File) ctx.getAttribute(ServletContext.TEMPDIR);
            dir = new File(tmp != null ? tmp : new File(System.getProperty("java.io.tmpdir")), "pslaser-logs");
            dir.mkdirs();
        }
        this.file = new File(dir, "order-desk.log");
    }

    public File getFile() { return file; }

    public synchronized void log(String message) {
        try (PrintWriter out = new PrintWriter(new OutputStreamWriter(
                new FileOutputStream(file, true), StandardCharsets.UTF_8))) {
            out.println(fmt.format(new Date()) + "  [" + Thread.currentThread().getName() + "]  " + message);
        } catch (IOException e) {
            System.err.println("AppLog write failed: " + e);
        }
    }

    /** Last n lines (newest first) for the "about" page. */
    public synchronized List<String> tail(int n) {
        List<String> lines = new ArrayList<>();
        if (!file.isFile()) return lines;
        try (BufferedReader in = new BufferedReader(new InputStreamReader(
                new FileInputStream(file), StandardCharsets.UTF_8))) {
            String line;
            while ((line = in.readLine()) != null) {
                lines.add(line);
                if (lines.size() > n) lines.remove(0);
            }
        } catch (IOException e) {
            lines.add("(could not read log: " + e.getMessage() + ")");
        }
        Collections.reverse(lines);
        return lines;
    }
}
