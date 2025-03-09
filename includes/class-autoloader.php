<?php
/**
 * Autoloader for Zen Blocks
 *
 * @package ZENB
 */

namespace ZENB;

/**
 * Handles class autoloading
 */
class Autoloader 
{
    private static $instance = null;

    public static function getInstance() 
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    public function __construct() 
    {

        // Create required directories if they don't exist
        $dirs = [
            ZENB_PLUGIN_DIR . 'includes/field-types',
            ZENB_PLUGIN_DIR . 'includes/admin'
        ];
        
        spl_autoload_register([$this, 'autoload']);
    }

    /**
     * Autoload callback
     *
     * @param string $class Class name to load
     * @return void
     */
    public function autoload($class) 
    {
        // Only handle classes in our namespace
        if (strpos($class, 'ZENB\\') !== 0) {
            return;
        }

        $file = $this->_getClassPath($class);

        if (!file_exists($file)) {
            return;
        }

        try {
            require_once $file;

            if (!class_exists($class, false)) {
                return;
            }

        } catch (\Exception $e) {
        }
    }

    /**
     * Get class file path
     *
     * @param string $class_name Full class name
     * @return string File path
     */
    private function _getClassPath($class_name) 
    {
        // Handle field type classes
        if (strpos($class_name, 'ZENB\\FieldTypes\\') === 0) {
            $path = str_replace('ZENB\\FieldTypes\\', '', $class_name);
            $filename = str_replace('_', '-', strtolower($path));
            return ZENB_PLUGIN_DIR . 'includes/field-types/class-' . $filename . '.php';
        }

        // Handle admin classes
        if (strpos($class_name, 'ZENB\\Admin_') === 0) {
            $path = str_replace('ZENB\\', '', $class_name);
            $path = str_replace('_', '-', strtolower($path));
            return ZENB_PLUGIN_DIR . 'includes/admin/class-' . $path . '.php';
        }

        // Handle regular classes
        $path = str_replace('ZENB\\', '', $class_name);
        $path = str_replace('_', '-', strtolower($path));
        return ZENB_PLUGIN_DIR . 'includes/class-' . $path . '.php';
    }

    /**
     * Get debug information for a class
     *
     * @param string $class Class name
     * @return array Debug information
     */
    public function getDebugInfo($class) 
    {
        $file = $this->_getClassPath($class);
        return [
            'class' => $class,
            'file' => $file,
            'exists' => file_exists($file),
            'contents' => file_exists($file) ? file_get_contents($file) : null,
            'plugin_dir' => ZENB_PLUGIN_DIR,
            'full_path' => realpath($file)
        ];
    }
}

// Initialize autoloader as singleton
Autoloader::getInstance(); 