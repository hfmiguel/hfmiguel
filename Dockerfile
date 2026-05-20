FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN mkdir -p /var/www/html

WORKDIR /var/www/html

COPY composer.json ./composer.json
COPY composer.lock ./composer.lock
COPY app ./app
COPY README.md ./README.md

RUN composer install --no-dev --no-scripts --no-cache

RUN chown -R www-data:www-data /var/www/html

# Switch to non-root user
USER www-data

EXPOSE 8100

# Start the application
CMD ["php", "-S", "0.0.0.0:8100", "-t", "app"]
