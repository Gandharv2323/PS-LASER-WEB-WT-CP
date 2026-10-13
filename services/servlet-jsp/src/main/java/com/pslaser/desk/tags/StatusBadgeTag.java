package com.pslaser.desk.tags;

import java.io.IOException;
import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspWriter;
import javax.servlet.jsp.tagext.SimpleTagSupport;

/**
 * CUSTOM JSP TAG - &lt;ps:statusBadge status="cutting"/&gt; renders a coloured Bootstrap badge
 * with an icon-like dot for a production stage. Declared in WEB-INF/ps.tld.
 * SimpleTagSupport: the container calls the setter for every attribute, then doTag().
 * Optional attribute "size" = "lg" for a bigger badge.
 */
public class StatusBadgeTag extends SimpleTagSupport {
    private String status;
    private String size;

    public void setStatus(String status) { this.status = status; }
    public void setSize(String size) { this.size = size; }

    @Override
    public void doTag() throws JspException, IOException {
        String s = status == null ? "unknown" : status.toLowerCase();
        String css;
        switch (s) {
            case "received":   css = "ps-st-received"; break;
            case "cutting":    css = "ps-st-cutting"; break;
            case "bending":    css = "ps-st-bending"; break;
            case "welding":    css = "ps-st-welding"; break;
            case "coating":    css = "ps-st-coating"; break;
            case "inspection": css = "ps-st-inspection"; break;
            case "dispatched": css = "ps-st-dispatched"; break;
            default:           css = "badge-secondary"; s = "unknown";
        }
        String label = Character.toUpperCase(s.charAt(0)) + s.substring(1);
        JspWriter out = getJspContext().getOut();
        out.write("<span class=\"badge ps-badge " + css + ("lg".equals(size) ? " ps-badge-lg" : "")
                + "\"><span class=\"ps-dot\"></span>" + label + "</span>");
    }
}
