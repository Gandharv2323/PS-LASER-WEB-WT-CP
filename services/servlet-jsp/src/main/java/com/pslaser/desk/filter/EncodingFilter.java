package com.pslaser.desk.filter;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

/**
 * FILTER #1 (declared first in web.xml, so it runs first) - forces UTF-8 for request
 * parameters and responses, so names like "Shinde" or a rupee sign survive form posts.
 * The encoding comes from the filter init-param "encoding" in web.xml.
 */
public class EncodingFilter implements Filter {
    private String encoding = "UTF-8";

    @Override
    public void init(FilterConfig cfg) {
        String e = cfg.getInitParameter("encoding");
        if (e != null && !e.isEmpty()) encoding = e;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (req.getCharacterEncoding() == null) req.setCharacterEncoding(encoding);
        res.setCharacterEncoding(encoding);
        chain.doFilter(req, res);
    }

    @Override
    public void destroy() { }
}
