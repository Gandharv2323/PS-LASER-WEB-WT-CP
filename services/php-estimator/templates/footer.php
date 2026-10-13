<?php
/** Layout partial — closes <main>, prints the footer and scripts. */
$year = date('Y');
?>
</main>
<footer class="site-footer">
    <div class="container">
        <div class="row">
            <div class="col-md-5 mb-3">
                <img src="assets/img/ps-laser-logo.png" alt="PS Laser" height="40" class="footer-logo mb-2">
                <p class="mb-1">Precision engineering &amp; sheet metal components — CNC laser cutting, bending, turret punching, laser welding and powder coating.</p>
            </div>
            <div class="col-md-4 mb-3">
                <h6>Visit</h6>
                <p class="mb-0">Gat No. 753, At Post Velu, Tal. Bhor,<br>Dist. Pune 412205, Maharashtra</p>
            </div>
            <div class="col-md-3 mb-3">
                <h6>Contact</h6>
                <p class="mb-0"><a href="tel:+917719976990">+91 77199 76990</a><br>
                    <a href="tel:+919763679499">+91 97636 79499</a><br>
                    <a href="mailto:pslaser24@gmail.com">pslaser24@gmail.com</a></p>
            </div>
        </div>
        <div class="footer-bottom">
            &copy; <?= e($year) ?> PS Laser &middot; <?= e(APP_NAME) ?> v<?= e(APP_VERSION) ?> &middot; plain PHP <?= e(PHP_VERSION) ?>
            &middot; estimates use <strong>sample rates</strong>
        </div>
    </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
<?php if (!empty($pageScript)): ?>
<script><?= $pageScript /* static JS written in the page file, not user input */ ?></script>
<?php endif; ?>
</body>
</html>
