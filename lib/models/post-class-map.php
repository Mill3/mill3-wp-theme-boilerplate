<?php

add_filter('timber/post/classmap', function ($classmap) {
    $custom_classmap = [
        'post' => \Mill3WP\PostQueries\Article\ArticlePost::class,
        //'dummy' => Mill3WP\PostQueries\Dummy\DummyPost::class,
    ];

    return array_merge($classmap, $custom_classmap);
});
