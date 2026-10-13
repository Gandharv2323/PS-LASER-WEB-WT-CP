package com.pslaser.desk.web;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Post/Redirect/Get helper. After a successful POST the controller stores a one-time
 * message in the SESSION and redirects; the next GET moves it to REQUEST scope and removes
 * it from the session, so reloading the page neither re-submits the form nor repeats the message.
 */
final class Flash {
    private Flash() { }

    static void set(HttpServletRequest req, String type, String message) {
        HttpSession s = req.getSession();
        s.setAttribute("flashType", type);
        s.setAttribute("flash", message);
    }

    static void moveToRequest(HttpServletRequest req) {
        HttpSession s = req.getSession(false);
        if (s == null || s.getAttribute("flash") == null) return;
        req.setAttribute("flash", s.getAttribute("flash"));
        req.setAttribute("flashType", s.getAttribute("flashType"));
        s.removeAttribute("flash");
        s.removeAttribute("flashType");
    }
}
