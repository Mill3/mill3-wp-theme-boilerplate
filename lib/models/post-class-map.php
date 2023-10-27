<?php

add_filter('timber/post/classmap', function ($classmap) {
    $custom_classmap = [
        'post' => \Mill3WP\Models\ArticlePost::class,
        //'dummy' => Mill3WP\Models\DummyPost::class,
    ];

    return array_merge($classmap, $custom_classmap);
});
