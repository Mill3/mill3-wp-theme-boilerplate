<?php

namespace Mill3\Twig;

// Create a hierachical Table of Contents from Blocks in $postID
function get_table_of_contents( $postID ) {
    // if postID doesn't exist, stop here
    if( !$postID ) return null;

    // if postID doesn't contains acf/blog-toc-anchor block, stop here
    if( !has_block('acf/blog-toc-anchor', $postID) ) return null;

    // get all acf/blog-toc-anchor blocks
    $post = get_post( $postID );
    $blocks = parse_blocks($post->post_content);
    $blocks = array_values( array_filter($blocks, function($block) { return $block['blockName'] === 'acf/blog-toc-anchor'; }) );
    $anchors = [];

    // recursive method to find an anchor by it's name
    function &find_parent( $parent, &$anchors ) {
        foreach($anchors as &$anchor) {
            // if anchor'title match parent, return value and stop
            if( $anchor['title'] === $parent ) return $anchor;
            // if anchor has children, check if one of his children match requested parent's name
            else if( isset($anchor['children']) ) {
                $ancestor = &find_parent($parent, $anchor['children']);

                // if parent name cannot be found in children, go to next anchor
                if( $ancestor ) return $ancestor;
            }
        };

        $null = null;
        return $null;
    }
    
    foreach ($blocks as $block) {
        // if title doesn't exists or is empty, skip this block
        if( !isset($block['attrs']['data']['title']) || 
            empty($block['attrs']['data']['title']) ) continue;

        $data   = $block['attrs']['data'];
        $title  = $data['title'];
        $id     = sanitize_title($title);
        $anchor = [ 'ID' => $id, 'title' => $title, 'children' => null ];

        // if anchor as parent, try to find it
        if( isset($data['parent']) ) {
            $parent = &find_parent($data['parent'], $anchors);

            if( isset($parent) ) {
                // if anchor is parent's first child, create children array
                if( !isset($parent['children']) ) $parent['children'] = [];

                // add anchor as children
                $parent['children'][] = $anchor;
            }
            else $anchors[] = $anchor;
        }
        else $anchors[] = $anchor;
    }

    return $anchors;
}
