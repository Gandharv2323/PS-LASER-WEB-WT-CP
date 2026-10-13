package com.pslaser.desk.dao;

import java.sql.Connection;
import java.sql.SQLException;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContext;
import javax.sql.DataSource;
import org.apache.tomcat.jdbc.pool.PoolProperties;

/**
 * DATABASES + SERVLETS - builds the JDBC connection pool once per web application.
 *
 * Order of preference:
 *  1. JNDI DataSource "java:comp/env/jdbc/pslaser" if an administrator configured one
 *     (see META-INF/context.xml - it is commented out because Tomcat wants the driver
 *     jar in tomcat/lib for container-managed pools).
 *  2. Otherwise a Tomcat JDBC pool (org.apache.tomcat.jdbc.pool, ships with Tomcat)
 *     created programmatically with the MySQL Connector/J driver from WEB-INF/lib.
 *
 * The pool is stored as a ServletContext attribute ("ds") by AppContextListener so
 * every servlet / DAO shares it (application scope = data shared by all users).
 * Settings come from env vars DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD (CONTRACT),
 * falling back to web.xml context-params, falling back to XAMPP defaults.
 */
public final class Db {
    public static final String ATTR = "ds";

    private Db() { }

    public static DataSource create(ServletContext ctx) {
        try {
            DataSource jndi = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/pslaser");
            ctx.log("Using JNDI DataSource java:comp/env/jdbc/pslaser");
            return jndi;
        } catch (NamingException | ClassCastException notConfigured) {
            // fall through to programmatic pool
        }
        String host = setting(ctx, "DB_HOST", "db.host", "localhost");
        String port = setting(ctx, "DB_PORT", "db.port", "3306");
        String name = setting(ctx, "DB_NAME", "db.name", "pslaser");
        String user = setting(ctx, "DB_USER", "db.user", "root");
        String pass = setting(ctx, "DB_PASSWORD", "db.password", "");

        // Connector/J otherwise starts a background "abandoned connection cleanup" thread that
        // outlives a redeploy; the pool already closes/validates connections, so turn it off.
        System.setProperty("com.mysql.cj.disableAbandonedConnectionCleanup", "true");
        PoolProperties p = new PoolProperties();
        p.setUrl("jdbc:mysql://" + host + ":" + port + "/" + name
                + "?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&useUnicode=true");
        p.setDriverClassName("com.mysql.cj.jdbc.Driver");
        p.setUsername(user);
        p.setPassword(pass);
        p.setInitialSize(2);
        p.setMaxActive(20);
        p.setMaxIdle(20);
        p.setMinIdle(2);
        p.setMaxWait(10000);
        p.setTestOnBorrow(true);
        p.setValidationQuery("SELECT 1");
        p.setValidationInterval(30000);
        p.setRemoveAbandoned(true);
        p.setRemoveAbandonedTimeout(60);
        org.apache.tomcat.jdbc.pool.DataSource ds = new org.apache.tomcat.jdbc.pool.DataSource();
        ds.setPoolProperties(p);
        ctx.log("Created Tomcat JDBC pool for jdbc:mysql://" + host + ":" + port + "/" + name + " as user " + user);
        return ds;
    }

    public static void close(DataSource ds) {
        if (ds instanceof org.apache.tomcat.jdbc.pool.DataSource) {
            ((org.apache.tomcat.jdbc.pool.DataSource) ds).close(true);
        }
        // The driver jar lives in WEB-INF/lib, so on undeploy we must unregister it and stop its
        // cleanup thread ourselves, otherwise Tomcat reports a classloader memory leak.
        ClassLoader mine = Thread.currentThread().getContextClassLoader();
        java.util.Enumeration<java.sql.Driver> drivers = java.sql.DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            java.sql.Driver d = drivers.nextElement();
            if (d.getClass().getClassLoader() == mine) {
                try { java.sql.DriverManager.deregisterDriver(d); } catch (SQLException ignored) { }
            }
        }
        com.mysql.cj.jdbc.AbandonedConnectionCleanupThread.checkedShutdown();
    }

    public static Connection get(ServletContext ctx) throws SQLException {
        DataSource ds = (DataSource) ctx.getAttribute(ATTR);
        if (ds == null) throw new SQLException("DataSource not initialised");
        return ds.getConnection();
    }

    private static String setting(ServletContext ctx, String env, String param, String def) {
        String v = System.getenv(env);
        if (v == null || v.isEmpty()) v = ctx.getInitParameter(param);
        if (v == null) v = def;
        return v;
    }
}
