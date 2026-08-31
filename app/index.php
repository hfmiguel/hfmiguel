<?php
require '../vendor/autoload.php';

$parsedown = new Parsedown();
$mdContent = file_exists('../README.md') ? file_get_contents('../README.md') : '# Ficheiro não encontrado';

$htmlBody = $parsedown->text($mdContent);

$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');

require 'resources/includes/header.php';
?>


<main class="container">
    <article class="markdown-body">
        <?php echo $htmlBody; ?>
    </article>
</main>

<?php
require 'resources/includes/footer.php';
?>
