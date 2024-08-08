<?php

add_filter('timber/post/classmap', function ($classmap) {
    $custom_classmap = [
        'post' => \Mill3WP\Models\ArticlePost::class,
        //'dummy' => Mill3WP\Models\DummyPost::class,
        'attachment' => function (WP_Post $attachment) {
            return wp_attachment_is_image($attachment) ? \Mill3WP\Models\Mill3Image::class : \Timber\Attachment::class;
        },
    ];

    return array_merge($classmap, $custom_classmap);
});
