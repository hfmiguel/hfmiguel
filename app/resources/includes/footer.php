<footer class="site-footer">
        <p>&copy; <?php echo date('Y'); ?> - Rodapé</p>
    </footer>
    <?php $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\'); ?>
    <script src="<?php echo $base === '/' ? '' : $base; ?>/resources/js/toc.js"></script>
</body>
</html>
