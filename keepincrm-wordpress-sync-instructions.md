# Інструкція: Синхронізація залишків з Keepincrm.com до WordPress

## Огляд
Це керівництво пояснює, як налаштувати автоматичну щоденну синхронізацію даних про залишки товарів з keepincrm.com до вашого сайту WordPress.

## Необхідні компоненти
1. Сайт WordPress з доступом адміністратора
2. Обліковий запис Keepincrm.com з доступом до API
3. Хостинг з підтримкою cron-завдань
4. PHP 7.4 або вище

## Крок 1: Налаштування доступу до API Keepincrm.com
1. Увійдіть до свого облікового запису keepincrm.com
2. Перейдіть до Налаштування → API Інтеграція
3. Згенеруйте API-ключ та збережіть його
4. Запишіть URL вашого API-endpoint

## Крок 2: Створення плагіну WordPress
1. Створіть нову директорію в `wp-content/plugins/keepincrm-sync`
2. Створіть головний файл плагіну `keepincrm-sync.php`:

```php
<?php
/*
Plugin Name: Keepincrm Inventory Sync
Description: Синхронізація залишків товарів з keepincrm.com
Version: 1.0
Author: Ваше ім'я
*/

// Заборона прямого доступу
if (!defined('ABSPATH')) {
    exit;
}

// Додавання сторінки налаштувань
function keepincrm_sync_menu() {
    add_options_page(
        'Налаштування Keepincrm Sync',
        'Keepincrm Sync',
        'manage_options',
        'keepincrm-sync',
        'keepincrm_sync_settings_page'
    );
}
add_action('admin_menu', 'keepincrm_sync_menu');

// Вміст сторінки налаштувань
function keepincrm_sync_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    // Збереження налаштувань
    if (isset($_POST['keepincrm_save_settings'])) {
        check_admin_referer('keepincrm_sync_settings');
        
        update_option('keepincrm_api_key', sanitize_text_field($_POST['keepincrm_api_key']));
        update_option('keepincrm_api_url', sanitize_text_field($_POST['keepincrm_api_url']));
        echo '<div class="notice notice-success"><p>Налаштування збережено.</p></div>';
    }

    // Ручна синхронізація
    if (isset($_POST['keepincrm_manual_sync'])) {
        check_admin_referer('keepincrm_sync_settings');
        
        $result = sync_keepincrm_inventory();
        if ($result === true) {
            echo '<div class="notice notice-success"><p>Синхронізація успішно завершена.</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>Помилка синхронізації: ' . esc_html($result) . '</p></div>';
        }
    }

    // Форма налаштувань
    ?>
    <div class="wrap">
        <h1>Налаштування Keepincrm Sync</h1>
        <form method="post" action="">
            <?php wp_nonce_field('keepincrm_sync_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">API Ключ</th>
                    <td>
                        <input type="text" name="keepincrm_api_key" 
                               value="<?php echo esc_attr(get_option('keepincrm_api_key')); ?>" 
                               class="regular-text">
                    </td>
                </tr>
                <tr>
                    <th scope="row">API URL</th>
                    <td>
                        <input type="url" name="keepincrm_api_url" 
                               value="<?php echo esc_attr(get_option('keepincrm_api_url')); ?>" 
                               class="regular-text">
                    </td>
                </tr>
            </table>

            <p class="submit">
                <input type="submit" name="keepincrm_save_settings" 
                       class="button-primary" value="Зберегти налаштування">
                
                <input type="submit" name="keepincrm_manual_sync" 
                       class="button-secondary" value="Оновити залишки">
            </p>
        </form>

        <hr>
        
        <h2>Останнє оновлення</h2>
        <p>Останнє успішне оновлення: 
            <?php 
            $last_sync = get_option('keepincrm_last_sync');
            echo $last_sync ? date('d.m.Y H:i:s', $last_sync) : 'Ніколи';
            ?>
        </p>
    </div>
    <?php
}

// Функція синхронізації
function sync_keepincrm_inventory() {
    $api_key = get_option('keepincrm_api_key');
    $api_url = get_option('keepincrm_api_url');

    if (empty($api_key) || empty($api_url)) {
        return 'API ключ або URL не налаштовані';
    }

    // Запит до API
    $response = wp_remote_get($api_url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Accept' => 'application/json'
        ]
    ]);

    if (is_wp_error($response)) {
        error_log('Keepincrm sync failed: ' . $response->get_error_message());
        return $response->get_error_message();
    }

    $inventory_data = json_decode(wp_remote_retrieve_body($response), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return 'Помилка обробки відповіді API';
    }

    // Оновлення товарів
    $updated = 0;
    $errors = [];

    foreach ($inventory_data as $item) {
        $result = update_product_inventory($item);
        if ($result === true) {
            $updated++;
        } else {
            $errors[] = $result;
        }
    }

    // Зберігаємо час останнього оновлення
    update_option('keepincrm_last_sync', time());

    if (empty($errors)) {
        return true;
    }

    return 'Оновлено товарів: ' . $updated . '. Помилки: ' . implode(', ', $errors);
}

// Оновлення окремого товару
function update_product_inventory($item) {
    // Припускаємо, що використовується WooCommerce
    $product = wc_get_product_by_sku($item['sku']);
    
    if (!$product) {
        return 'Товар з SKU ' . $item['sku'] . ' не знайдено';
    }

    try {
        $product->set_stock_quantity($item['quantity']);
        $product->save();
        return true;
    } catch (Exception $e) {
        return 'Помилка оновлення товару ' . $item['sku'] . ': ' . $e->getMessage();
    }
}

// Реєстрація cron-завдання
register_activation_hook(__FILE__, 'keepincrm_sync_activation');
function keepincrm_sync_activation() {
    if (!wp_next_scheduled('keepincrm_daily_sync')) {
        wp_schedule_event(time(), 'daily', 'keepincrm_daily_sync');
    }
}

// Хук для cron-завдання
add_action('keepincrm_daily_sync', 'sync_keepincrm_inventory');

// Очищення при деактивації
register_deactivation_hook(__FILE__, 'keepincrm_sync_deactivation');
function keepincrm_sync_deactivation() {
    wp_clear_scheduled_hook('keepincrm_daily_sync');
}
```

## Крок 3: Налаштування плагіну WordPress
1. Встановіть та активуйте плагін у WordPress
2. Перейдіть до Налаштування → Keepincrm Sync
3. Введіть ваш API-ключ та URL
4. Збережіть налаштування
5. Використовуйте кнопку "Оновити залишки" для ручної синхронізації

## Крок 4: Налаштування Cron (Альтернативний метод)
Якщо WordPress cron працює ненадійно, налаштуйте серверний cron:

1. Створіть файл `sync-cron.php` в корені WordPress:
```php
<?php
require_once('wp-load.php');
sync_keepincrm_inventory();
```

2. Додайте cron-завдання через панель хостингу або SSH:
```bash
0 0 * * * php /path/to/wordpress/sync-cron.php
```

## Крок 5: Тестування
1. Протестуйте ручну синхронізацію:
   - Натисніть кнопку "Оновити залишки"
   - Перевірте оновлення залишків
2. Моніторинг автоматичної синхронізації:
   - Перевірте логи сервера
   - Підтвердіть щоденні оновлення
   - Налаштуйте email-сповіщення про статус синхронізації

## Крок 6: Обслуговування
1. Регулярно перевіряйте логи синхронізації
2. Слідкуйте за лімітами API
3. Оновлюйте плагін при змінах API
4. Робіть резервні копії перед важливими змінами

## Усунення несправностей
- Перевірте лог помилок WordPress
- Перевірте правильність API-креденшелів
- Перевірте права доступу до файлів
- Перевірте роботу cron-завдання
- Моніторте логи помилок сервера

## Безпека
1. Зберігайте API-креденшели безпечно
2. Використовуйте HTTPS для всіх API-запитів
3. Реалізуйте обмеження частоти запитів
4. Валідуйте всі дані перед оновленням
5. Ведіть журнал доступу
6. Регулярно проводьте аудит безпеки

## Підтримка
При виникненні проблем:
1. Перевірте документацію API keepincrm.com
2. Зверніться до підтримки keepincrm.com
3. Перевірте форуми WordPress
4. Проконсультуйтеся з вашим розробником

## Примітки
- Зробіть резервну копію бази даних перед першою синхронізацією
- Спочатку протестуйте на тестовому середовищі
- Слідкуйте за використанням ресурсів сервера
- Налаштуйте сповіщення про помилки
- Документуйте всі власні модифікації
