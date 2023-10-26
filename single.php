<?php
/**
 * The Template for displaying all single posts
 *
 * Methods for TimberHelper can be found in the /lib sub-directory
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since    Timber 0.1
 */

$context = Timber::context();
$post = Timber::get_post();
$post_type = get_post_type();

if (post_password_required($post->ID)) {
    Timber::render('single-password.twig', $context);
} else {
    Timber::render(
        array(
            'post-type/' . $post_type . '/' . $post_type . '-single.twig',
            'single-' . $post->ID . '.twig',
            'single-' . $post_type . '.twig',
            'single.twig'
        ),
        $context
    );
}
