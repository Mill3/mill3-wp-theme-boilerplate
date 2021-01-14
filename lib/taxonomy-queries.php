<?php

class Theme_TaxonomyQueries {

  /**
   * Holds this instance.
   *
   * @var \Theme_TaxonomyQueries
   */
  private static $instance;

  // init class
  public function __construct() {
  }

  /**
   * Create an instance and allows multiple copy of class
   */
  public static function instance() {
    return self::$instance = new self();
  }

  // dummy function, change me
  public function get_posts_categories() {
  	$args = array(
      'hide_empty' => true,
      'taxonomy'   => 'category',
    );

    return Timber::get_terms($args);
  }

}


?>