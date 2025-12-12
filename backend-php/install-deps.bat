@echo off
echo Installing Composer...
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"

echo Installing dependencies...
php composer.phar install

echo Done!
pause
