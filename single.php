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

$context = Timber::get_context();
$post_type = get_post_type();

// append TimberPost extended classes when needed
switch ($post_type) {
    case 'post':
        $post = Timber::query_post('Mill3WP\PostQueries\Article\ArticlePost');
        break;
    case 'dummy':
        $post = Timber::query_post('Mill3WP\PostQueries\Dummy\DummyPost');
        break;
    default:
        $post = Timber::query_post();
        break;
}

// send post to context
$context['post'] = $post;

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
