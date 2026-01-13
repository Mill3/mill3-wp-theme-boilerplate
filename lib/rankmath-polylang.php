<?php

/**
 * Manages the compatibility with the Rank Math plugin
 *
 */
class PLL_RankMath {
	/**
	 * Add specific filters and actions
	 */
	public function init() {
		add_action( 'wp_loaded', [ $this, 'rm_translate_options_keys' ] );
		add_action( 'plugins_loaded', [ $this, 'rm_reset_rank_math_options' ] );
		if ( PLL() instanceof PLL_Frontend ) {
			// Filters sitemap queries to remove inactive language or to get
			// one sitemap per language when using multiple domains or subdomains
			// because Rank Math does not accept several domains or subdomains in one sitemap
			add_filter( 'rank_math/sitemap/post_count/join', [ $this, 'rank_math_sitemap_join_clause' ], 10, 2);
			add_filter( 'rank_math/sitemap/post_count/where', [ $this, 'rank_math_sitemap_where_clause' ], 10, 2);
			add_filter( 'rank_math/sitemap/get_posts/join', [ $this, 'rank_math_sitemap_join_clause' ], 10, 2 );
			add_filter( 'rank_math/sitemap/get_posts/where', [ $this, 'rank_math_sitemap_where_clause' ], 10, 2 );

			if ( PLL()->options['force_lang'] > 1 ) {
				add_filter( 'rank_math/sitemap/enable_caching', '__return_false' ); // Disable cache! otherwise Rank Math keeps only one domain
				add_filter( 'home_url', [ $this, 'rank_math_home_url' ], 10, 2 );
			} else {
				add_filter( 'rank_math/sitemap/enable_caching', '__return_false' );
				// Get all terms in all languages when the language is set from the content or directory name
				add_filter( 'get_terms_args', [ $this, 'rm_update_term_query_args' ] );
				// Include links to homepage of all languages.
				add_filter( 'rank_math/sitemap/exclude_post_type', [ $this, 'update_sitemap_contents' ], 0 , 2 );
			}

			add_filter( 'pll_home_url_white_list', [ $this, 'rm_white_list_home_url' ] );
			add_filter( 'rank_math/frontend/canonical', [ $this, 'rm_home_canonical' ], 10, 1 );
			add_filter( 'rank_math/opengraph/facebook', [ $this, 'rank_math_alt_locales' ], 10 );
		} else {
			// Copy post metas
			add_filter('pll_copy_post_meta', [ $this, 'rm_sync_post_metas' ], 10, 4);
			// translate post metas
			add_filter( 'pll_translate_post_meta', [ $this, 'rm_translate_post_meta' ], 10, 3 );
			// Export post metas
			add_filter( 'pll_post_metas_to_export', [ $this, 'rm_export_post_metas' ], 10, 1 );
		}
	}

	public function rm_reset_rank_math_options() {
		rank_math()->settings->reset();
	}

	/**
	 * Register options keys for translation.
	 *
	 * @return void
	 */
	public function rm_translate_options_keys() {
		// @TODO clear cache!

		// keys for rank-math-options-general option
		$keys = [
			'breadcrumbs_separator',
			'breadcrumbs_home_label',
			'breadcrumbs_archive_format',
			'breadcrumbs_search_format',
			'breadcrumbs_404_label',
			'content_ai_country',
			'content_ai_tone',
			'content_ai_audience',
			'content_ai_language',
			'toc_block_title',
		];
		new PLL_Translate_Option( 'rank-math-options-general', array_fill_keys( $keys, 1 ), [ 'context' => 'rank-math' ] );

		// Keys for rank-math-options-titles
		$keys = [
			'website_name',
			'knowledgegraph_name',
			'homepage_title',
			'author_archive_title',
			'date_archive_title',
			'search_title',
			'404_title',
			'pt_post_title',
			'pt_post_description',
			'pt_post_default_snippet_*',
			'pt_page_title',
			'pt_page_description',
			'pt_page_default_snippet_*',
			'pt_attachment_title',
			'pt_attachment_description',
			'pt_attachment_default_snippet_*',
			'pt_product_title',
			'pt_product_description',
			'pt_product_default_snippet_*',

		];
		new PLL_Translate_Option( 'rank-math-options-titles', array_fill_keys( $keys, 1 ), [ 'context' => 'rank-math' ] );
	}

	/**
	 * Updates the home and stylesheet URLs when using multiple domains or subdomains.
	 *
	 * @param string $url
	 * @param string $path
	 * @return $url
	 */
	public function rank_math_home_url( $url, $path ) {
		$uri = empty( $path ) ? ltrim( (string) wp_parse_url( pll_get_requested_url(), PHP_URL_PATH ), '/' ) : $path;
		if ( 'sitemap_index.xml' === $uri || preg_match( '#([^/]+?)-sitemap([0-9]+)?\.xml|([a-z]+)?-?sitemap\.xsl#', $uri ) ) {
			$url = PLL()->links_model->switch_language_in_link( $url, PLL()->curlang );
		}

		return $url;
	}

	/**
	 * Get the active languages.
	 *
	 * @return array list of active language slugs, empty if all languages are active
	 */
	protected function rank_math_get_active_languages() {
		$languages = PLL()->model->get_languages_list();
		if ( wp_list_filter( $languages, [ 'active' => false ] ) ) {
			return wp_list_pluck( wp_list_filter( $languages, [ 'active' => false ], 'NOT' ), 'slug' );
		}
		return [];
	}

	/**
	 * Modifies the sql request for posts sitemaps
	 * Only when using multiple domains or subdomains or if some languages are not active
	 *
	 * @param string $sql       JOIN clause
	 * @param string $post_type
	 * @return string
	 */
	public function rank_math_sitemap_join_clause( $sql, $post_type ) {
		return pll_is_translated_post_type( $post_type ) ? $sql . PLL()->model->post->join_clause( 'p' ) : $sql;
	}

	/**
	 * Modifies the sql request for posts sitemaps
	 * Only when using multiple domains or subdomains or if some languages are not active
	 *
	 * @param string $sql       WHERE clause
	 * @param string $post_type
	 * @return string
	 */
	public function rank_math_sitemap_where_clause( $sql, $post_type ) {
		if ( ! pll_is_translated_post_type( $post_type ) ) {
			return $sql;
		}

		if ( PLL()->options['force_lang'] > 1 && PLL()->curlang instanceof PLL_Language ) {
			return $sql . PLL()->model->post->where_clause( PLL()->curlang );
		}

		$languages = $this->rank_math_get_active_languages();

		if ( empty( $languages ) ) { // Empty when all languages are active.
			$languages = pll_languages_list();
		}

		return $sql . PLL()->model->post->where_clause( $languages );
	}

	/**
	 * When the language is set from the content or directory name, the language filter (and inactive languages) need to be removed for the taxonomy sitemaps.
	 *
	 * @param array $args get_terms arguments
	 * @return array modified list of arguments
	 */
	public function rm_update_term_query_args( $args ) {
		if ( isset( $GLOBALS['wp_query']->query['sitemap'] ) ) {
			$args['lang'] = implode( ',', $this->rank_math_get_active_languages() );
		}
		return $args;
	}

	/**
	 * A way to apply rank_math/sitemap/{$type}_content for all indexable post types.
	 *
	 * Updates homepage and archive pages to include links to the active languages.
	 *
	 * Always returns $excluded without altering it's value.
	 * @param $exclude
	 * @param $type
	 * @return mixed
	 */
	public function update_sitemap_contents( $exclude, $type ) {
		if ( pll_is_translated_post_type( $type ) && ( 'post' !== $type || ! get_option( 'page_on_front' ) ) ) {
			// Include post, post type archives, and the homepages in all languages to the sitemap when the front page displays posts get_ogp_alternate_languages() !
			\add_action( "rank_math/sitemap/{$type}_content", function() use( $type ) {
				$generator = new \RankMath\Sitemap\Generator();
				$post_type_obj = get_post_type_object( $type );
				$languages = wp_list_filter( PLL()->model->get_languages_list(), [ 'active' => false ], 'NOT' );
				$mod       = \RankMath\Sitemap\Sitemap::get_last_modified_gmt( $type );
				$output    = '';
				if  ( 'post' === $type ) {

					if ( ! empty( PLL()->options['hide_default'] ) ) {
						// The home url is of course already added by WPSEO.
						$languages = wp_list_filter( $languages, [ 'slug' => pll_default_language() ], 'NOT' );
					}

					foreach ( $languages as $lang ) {
						$output .= $generator->sitemap_url([
							'loc' => pll_home_url( $lang->slug ),
							'mod' => $mod
						]);
					}
				}

				elseif ( $post_type_obj->has_archive ) {
					// Exclude cases where a post type archive is attached to a page (ex: WooCommerce).
					$slug = true === $post_type_obj->has_archive ? $post_type_obj->rewrite['slug'] : $post_type_obj->has_archive;

					if ( ! wpcom_vip_get_page_by_path( $slug ) ) {
						// The post type archive in the current language is already added by WPSEO.
						$languages = wp_list_filter( $languages, [ 'slug' => pll_current_language() ], 'NOT' );
						foreach ( $languages as $lang ) {
							PLL()->curlang = $lang; // Switch the language to get the correct archive link.
							$output .= $generator->sitemap_url([
								'loc' => pll_home_url( $lang->slug ),
								'mod' => $mod
							]);
						}
					}
				}
				return $output;
			});
		}
		return $exclude;
	}

	/**
	 * Include language code in the canonical URL.
	 *
	 * @param string $canonical The canonical URL.
	 *
	 * @return mixed|string
	 */
	public function rm_home_canonical( $canonical ) {
		if ( ! is_home() ) {
			return $canonical;
		}

		$path = ltrim( (string) wp_parse_url( pll_get_requested_url(), PHP_URL_PATH ), '/' );
		return $canonical . $path;

	}


	/**
	 * Filters home url.
	 *
	 * @param array $arr
	 * @return array
	 */
	public function rm_white_list_home_url( $arr ) {
		return array_merge( $arr, [  [ 'file' => 'seo-by-rank-math' ]  ] );
	}

	/**
	 * Updates OpenGraph meta output by adding support for translations.
	 *
	 * @return void
	 */
	public function rank_math_alt_locales() {
		$og = new \RankMath\OpenGraph\OpenGraph();
		$og->network = 'facebook';
		foreach ( $this->update_ogp_alternate_languages() as $lang ) {
			$og->tag('og:locale:alternate', $lang );
		}
	}

	/**
	 * Get alternate language codes for Opengraph.
	 *
	 * @return string[]
	 */
	protected function update_ogp_alternate_languages() {
		$alternates = [];

		foreach ( PLL()->model->get_languages_list() as $language ) {
			if ( isset( PLL()->curlang ) && PLL()->curlang->slug !== $language->slug && PLL()->links->get_translation_url( $language ) && isset( $language->facebook ) ) {
				$alternates[] = $language->facebook;
			}
		}
		// There is a risk that 2 languages have the same Facebook locale. So let's make sure to output each locale only once.
		return array_unique( $alternates );
	}

	/**
	 * Synchronizes or copies the metas.
	 *
	 * @param $metas
	 * @param $sync
	 * @param $from
	 * @param $to
	 * @return array
	 */
	public function rm_sync_post_metas( $metas, $sync, $from, $to ) {
		if ( ! $sync ) {
			$metas = array_merge( $metas, $this->rm_translatable_meta_keys() );
			// Copy image URLS
			$metas[] = 'rank_math_facebook_image';
			$metas[] = 'rank_math_facebook_image_id';
			$metas[] = 'rank_math_twitter_use_facebook';
			$metas[] = 'rank_math_twitter_image';
			$metas[] = 'rank_math_twitter_image_id';

			$metas[] = 'rank_math_robots';

		}

		$taxonomies = get_taxonomies([
			'hierarchical' => true,
			'public'       => true,
		]);

		$sync_taxonomies = PLL()->sync->taxonomies->get_taxonomies_to_copy( $sync, $from, $to );

		$taxonomies = array_intersect( $taxonomies, $sync_taxonomies );
		foreach ( $taxonomies as $taxonomy ) {
			$metas[] = 'rank_math_primary_' . $taxonomy;
		}

		return $metas;

	}

	/**
	 * Translate the primary term during the synchronization process
	 *
	 * @param int    $value Meta value.
	 * @param string $key   Meta key.
	 * @param string $lang  Language of target.
	 *
	 * @return int
	 */
	public function rm_translate_post_meta( $value, $key, $lang ) {
		if ( ! \RankMath\Helpers\Str::starts_with( 'rank_math_primary_', $key) ) {
			return $value;
		}

		$taxonomy = str_replace( 'rank_math_primary_', '', $key );
		if ( ! PLL()->model->is_translated_taxonomy( $taxonomy ) ) {
			return $value;
		}

		return pll_get_term( $value, $lang );
	}

	/**
	 * Meta key with translatable values.
	 *
	 * @return string[]
	 */
	private function rm_translatable_meta_keys() {
		return [
			'rank_math_title',
			'rank_math_description',
			'rank_math_facebook_title',
			'rank_math_facebook_description',
			'rank_math_twitter_title',
			'rank_math_twitter_description',
			'rank_math_focus_keyword',
		];
	}

	/**
	 * Rank math translatable metas to export.
	 *
	 * @param array $metas
	 *
	 * @return string[]
	 */
	public function rm_export_post_metas( $metas ) {
		$rm_metas = array_fill_keys( $this->rm_translatable_meta_keys(), 1 );
		return array_merge( $metas, $rm_metas );
	}
}
