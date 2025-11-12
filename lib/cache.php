<?php

namespace Mill3WP\Cache;

/**
 * CacheInstance
 *
 * Simple class to use CacheTrait as a class instance.
 *
 * Usage :
 *
 * funciton foobar() {
 *    $cache = new CacheInstance();
 * }
 *
 */
class CacheInstance {
    use CacheTrait;
}

/**
* Simple WP Transients cache trait for handling cache in a class
*
* @category Cache
*
* @package Utils
*
* @author Antoine Girard <antoine@mill3.studio>
*
* How to use :
*
* class MyClass {
*    use CacheTrait;
*
*    public function myMethod() {
*        $cache_key = $this->cache_key(__CLASS__, __FUNCTION__, ['suffixes', 'to', 'append']);
*        $cached = $this->get_cache($cache_key);
*        if ($cached) return $cached;
*
*        [do your stuff and get $data]
*
*        $this->save_cache($cache_key, $data);
*    }
*
* }
*
*/


trait CacheTrait
{

    public function cache_key(string $class, string $function, string | array | null $suffix = null)
    {
        $parts = [$class, $function, $this->current_language()];

        // append suffix when needed, array_filter() is used to remove empty values
        if ($suffix) $parts[] = is_array($suffix) ? implode('-', array_filter($suffix)) : $suffix;

        // remove empty values
        $parts = array_filter($parts);

        // join all parts with dash
        return implode('-', $parts);
    }

    public function get_cache(string $cache_key)
    {
        // on debug, always return null
        if (WP_DEBUG) return null;

        $cached = get_transient($cache_key);

        if (!empty($cached)) {
            return $cached;
        } else {
            return null;
        }
    }

    public function save_cache(string $cache_key, $data, int $expiration = HOUR_IN_SECONDS)
    {
        if (!WP_DEBUG) set_transient($cache_key, $data, $expiration);
    }

    public function delete_cache(string $cache_key)
    {
        delete_transient($cache_key);
    }

    private function current_language()
    {
        if (function_exists('pll_current_language')) {
            return pll_current_language('slug');
        } else {
            return null;
        }
    }
}
