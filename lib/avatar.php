<?php

namespace Mill3WP\Avatar;


// get avatar url from Wordpress Media Manager if defined
add_filter('get_avatar_url', function($url, $id_or_email, $args) {
    
    // if $id_or_email is not an integer or a WP_User, stop here
    if( !is_int($id_or_email) && !($id_or_email instanceof \WP_User) ) return $url;

    $id = is_int($id_or_email) ? $id_or_email : $id_or_email->ID;

    // get user_meta
    $avatar_media_id = get_user_meta($id, 'avatar', true);
    if( !$avatar_media_id ) return $url;

    // format sizing
    if( is_int($args['size']) ) $sizes = [$args['width'], $args['height']];
    else $sizes = $args['size'];
    
    // get image url
    $media = wp_get_attachment_image_src($avatar_media_id, $sizes);
    return $media ? $media[0] : $url;
}, 10, 3);


// add form to preview & update avatar via Wordpress Media Manager
function show_profile_picture_form($profile_user) {
    $avatar = get_avatar($profile_user);
    $avatar_media_id = get_user_meta($profile_user->ID, 'avatar', true);

    wp_enqueue_media();
    ?>
    <h2><?php _e( 'Profile Picture' ); ?></h2>
    <table class="form-table" role="presentation">
        <tr class="user-avatar-wrap">
            <th><label for="avatar"><?php _e( 'Profile Picture' ); ?></label></th>
            <td>
                <div class="avatar-preview">
                    <?php echo $avatar; ?>
                    <!-- <button type="button" class="avatar-remove-btn">X</button> -->
                </div>

                <input id="avatar" name="avatar" type="button" class="button" value="<?php _e('Change Profile Picture'); ?>" />
	            <input id="avatar_media_id" name="avatar_media_id" type="hidden" value="<?php echo $avatar_media_id; ?>">
                <p class="description"><?php _e('If no profile picture is defined, Wordpress will try to get your profile image from Gravatar.') ?></p>
            </td>
        </tr>
    </table>
    <?php 
}

add_action('show_user_profile', __NAMESPACE__ . '\\show_profile_picture_form');
add_action('edit_user_profile', __NAMESPACE__ . '\\show_profile_picture_form');


// add "avatar" data to user_meta
add_action('profile_update', function($user_id, $old_user_data, $userdata) {
    $user_id  = (int) $user_id;
    if( !$user_id || !isset($_POST) || !isset($_POST['avatar_media_id']) ) return;

    $avatar_media_id = (int) $_POST['avatar_media_id'];
    if( !$avatar_media_id ) return;

    $success = update_user_meta($user_id, 'avatar', $avatar_media_id);
}, 10, 3);



// insert css & javascript to admin page
global $pagenow;
if( is_admin() && ($pagenow == 'profile.php' || $pagenow == 'user-edit.php') ) {
    add_action('admin_head', function() {
        ?>
        <style type="text/css">
            tr.user-profile-picture { display: none; }
            tr.user-avatar-wrap .avatar-preview {
                position: relative;
                width: 96px;
            }
            tr.user-avatar-wrap .avatar-remove-btn {
                position: absolute;
                top: 3px;
                right: 3px;
                width: 20px;
                height: 20px;
                border: none;
                border-radius: 20px;
                background: #999;
                color: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
        </style>
        <?php
    });

    add_action('admin_footer', function() {
        ?>
        <script type='text/javascript'>
            jQuery( document ).ready( function( $ ) {

                var wrapper = document.querySelector('.user-avatar-wrap');
                if( !wrapper ) return;

                var button = wrapper.querySelector('#avatar');
                if( !button ) return;

                var hidden_field = wrapper.querySelector('#avatar_media_id');
                var image = wrapper.querySelector('.avatar-preview img');
                var remove = wrapper.querySelector('.avatar-remove-btn');

                var uploader;

                function createUploader() {
                    uploader = wp.media({
                        title: '<?php _e('Select Profile Picture'); ?>',
                        button: { text: '<?php _e('Select'); ?>' },
                        library: { type: 'image' },
                        multiple: false
                    });

                    uploader.on('select', function() {
                        var attachment = uploader.state().get('selection').first().toJSON();

                        // update avatar preview
                        image.removeAttribute('srcset');
                        image.src = attachment.sizes.thumbnail.url;

                        // update hidden field
                        hidden_field.value = attachment.id;
                    });

                    uploader.on('open', function() {
                        if( hidden_field.value ) {
                            var selection = uploader.state().get('selection');
                            var attachment = wp.media.attachment(hidden_field.value);
                                attachment.fetch();
                            
                            selection.add( attachment ? [attachment] : [] );
                        }
                    });
                }

                button.addEventListener('click', function(event) {
                    event.preventDefault();

                    if( !uploader ) createUploader();
                    uploader.open();
                });

                if( remove ) {
                    remove.addEventListener('click', function() {
                        hidden_field.value = "";
                    });
                }
            });
        </script>
        <?php
    });
}
