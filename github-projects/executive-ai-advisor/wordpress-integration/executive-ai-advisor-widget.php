<?php
/**
 * Plugin Name: Executive AI Advisor Widget
 * Plugin URI: https://yourdomain.com
 * Description: Embeds the Executive AI Advisor chat interface for premium members
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL-2.0+
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Executive_AI_Advisor_Widget {

    private $frontend_url;
    private $backend_api_url;

    public function __construct() {
        // Configure your URLs here
        $this->frontend_url = get_option('eaa_frontend_url', 'https://your-frontend.vercel.app');
        $this->backend_api_url = get_option('eaa_backend_url', 'https://your-backend.railway.app');

        // Register shortcode
        add_shortcode('executive_ai_advisor', array($this, 'render_widget'));

        // Register settings
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));

        // Enqueue scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Render the AI advisor widget
     */
    public function render_widget($atts) {
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return '<div class="eaa-login-required">
                <p>Please <a href="' . wp_login_url(get_permalink()) . '">log in</a> to access Executive AI Advisor.</p>
            </div>';
        }

        // Check if user has required capability/subscription
        if (!$this->user_has_access()) {
            return '<div class="eaa-subscription-required">
                <p>This feature is available to premium members only.</p>
                <p><a href="' . get_permalink(get_option('eaa_upgrade_page_id')) . '" class="button">Upgrade Now</a></p>
            </div>';
        }

        // Generate JWT token for current user
        $jwt_token = $this->generate_jwt_token();

        if (!$jwt_token) {
            return '<div class="eaa-error">
                <p>Authentication error. Please contact support.</p>
            </div>';
        }

        // Get current user info
        $current_user = wp_get_current_user();

        // Parse attributes
        $atts = shortcode_atts(array(
            'height' => '800px',
            'width' => '100%',
        ), $atts);

        // Render iframe container
        ob_start();
        ?>
        <div class="executive-ai-advisor-container" style="width: <?php echo esc_attr($atts['width']); ?>;">
            <iframe
                id="eaa-iframe"
                src="<?php echo esc_url($this->frontend_url); ?>?token=<?php echo esc_attr($jwt_token); ?>&embed=true"
                width="100%"
                height="<?php echo esc_attr($atts['height']); ?>"
                frameborder="0"
                allow="microphone; autoplay"
                style="border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
            ></iframe>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Generate JWT token for current user
     */
    private function generate_jwt_token() {
        // Check if JWT Authentication plugin is active
        if (!function_exists('wp_create_nonce')) {
            return false;
        }

        $current_user = wp_get_current_user();

        // Use JWT Authentication for WP REST API plugin
        if (class_exists('Jwt_Auth_Public')) {
            // Generate token using plugin's method
            $secret_key = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;

            if (!$secret_key) {
                error_log('Executive AI Advisor: JWT_AUTH_SECRET_KEY not defined');
                return false;
            }

            $issued_at = time();
            $not_before = $issued_at;
            $expire = $issued_at + (DAY_IN_SECONDS * 7); // 7 days

            $token_data = array(
                'iss' => get_bloginfo('url'),
                'iat' => $issued_at,
                'nbf' => $not_before,
                'exp' => $expire,
                'data' => array(
                    'user' => array(
                        'id' => (string) $current_user->ID,
                        'email' => $current_user->user_email,
                        'nicename' => $current_user->user_nicename,
                        'firstName' => get_user_meta($current_user->ID, 'first_name', true),
                        'lastName' => get_user_meta($current_user->ID, 'last_name', true),
                    ),
                ),
            );

            // Encode token
            try {
                $token = \Firebase\JWT\JWT::encode($token_data, $secret_key, 'HS256');
                return $token;
            } catch (Exception $e) {
                error_log('Executive AI Advisor: JWT encoding error - ' . $e->getMessage());
                return false;
            }
        }

        return false;
    }

    /**
     * Check if user has access to AI advisor
     */
    private function user_has_access() {
        $current_user = wp_get_current_user();

        // Admin always has access
        if (current_user_can('manage_options')) {
            return true;
        }

        // Check for specific capability (customize based on your membership plugin)
        if (current_user_can('access_ai_advisor')) {
            return true;
        }

        // Check for active subscription (WooCommerce Subscriptions)
        if (function_exists('wcs_user_has_subscription')) {
            $has_subscription = wcs_user_has_subscription($current_user->ID, '', 'active');
            if ($has_subscription) {
                return true;
            }
        }

        // Check for MemberPress active subscription
        if (function_exists('mepr_get_user_active_memberships')) {
            $active_memberships = mepr_get_user_active_memberships($current_user->ID);
            if (!empty($active_memberships)) {
                return true;
            }
        }

        // Check for Paid Memberships Pro level
        if (function_exists('pmpro_hasMembershipLevel')) {
            $premium_levels = get_option('eaa_premium_levels', array());
            if (pmpro_hasMembershipLevel($premium_levels, $current_user->ID)) {
                return true;
            }
        }

        // Add your own membership check logic here

        return apply_filters('eaa_user_has_access', false, $current_user);
    }

    /**
     * Enqueue scripts and styles
     */
    public function enqueue_scripts() {
        wp_enqueue_style('eaa-widget', plugins_url('css/widget.css', __FILE__), array(), '1.0.0');
    }

    /**
     * Add settings page to WordPress admin
     */
    public function add_settings_page() {
        add_options_page(
            'Executive AI Advisor Settings',
            'Executive AI Advisor',
            'manage_options',
            'executive-ai-advisor',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('eaa_settings', 'eaa_frontend_url');
        register_setting('eaa_settings', 'eaa_backend_url');
        register_setting('eaa_settings', 'eaa_upgrade_page_id');
        register_setting('eaa_settings', 'eaa_premium_levels');
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Executive AI Advisor Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('eaa_settings'); ?>
                <?php do_settings_sections('eaa_settings'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">Frontend URL</th>
                        <td>
                            <input type="url" name="eaa_frontend_url" value="<?php echo esc_attr(get_option('eaa_frontend_url')); ?>" class="regular-text" />
                            <p class="description">URL where your React frontend is hosted (e.g., https://your-app.vercel.app)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Backend API URL</th>
                        <td>
                            <input type="url" name="eaa_backend_url" value="<?php echo esc_attr(get_option('eaa_backend_url')); ?>" class="regular-text" />
                            <p class="description">URL of your backend API server (e.g., https://your-api.railway.app)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Upgrade Page</th>
                        <td>
                            <?php
                            wp_dropdown_pages(array(
                                'name' => 'eaa_upgrade_page_id',
                                'selected' => get_option('eaa_upgrade_page_id'),
                                'show_option_none' => 'Select a page',
                            ));
                            ?>
                            <p class="description">Page to redirect non-premium users to upgrade</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>

            <h2>Usage Instructions</h2>
            <p>Add the AI advisor to any page or post using this shortcode:</p>
            <code>[executive_ai_advisor]</code>

            <p>Customize the size:</p>
            <code>[executive_ai_advisor height="600px" width="100%"]</code>

            <h3>JWT Authentication Setup</h3>
            <ol>
                <li>Install and activate "JWT Authentication for WP REST API" plugin</li>
                <li>Add this to your <code>wp-config.php</code>:
                    <pre>define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);</pre>
                </li>
                <li>Generate a strong secret key using: <code>openssl rand -base64 64</code></li>
                <li>Use the same secret key in your backend API configuration</li>
            </ol>
        </div>
        <?php
    }
}

// Initialize plugin
new Executive_AI_Advisor_Widget();
