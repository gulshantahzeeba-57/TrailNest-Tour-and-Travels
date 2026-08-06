/* ============================================
   TrailNest — shared blog storage helper
   Used by blog.html (read-only render), post.html
   (single post view), and admin.html (create /
   delete). Backed by localStorage under key
   "sv_blog_posts". No posts are seeded here —
   the site owner adds every post from admin.html.
   Swap this whole file for real API calls when
   you hook up a backend.
   ============================================ */
(function (global) {
  const STORAGE_KEY = 'sv_blog_posts';

  function getPosts() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return [];
    }
    if (raw === null) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function getPostById(id) {
    return getPosts().find(function (p) { return p.id === id; }) || null;
  }

  function savePosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      // storage unavailable (private browsing, etc.) — fail silently
    }
  }

  function addPost(post) {
    const posts = getPosts();
    post.id = 'post-' + Date.now();
    posts.push(post);
    savePosts(posts);
    return posts;
  }

  function deletePost(id) {
    const posts = getPosts().filter(function (p) { return p.id !== id; });
    savePosts(posts);
    return posts;
  }

  global.SVBlog = {
    getPosts: getPosts,
    getPostById: getPostById,
    addPost: addPost,
    deletePost: deletePost
  };
})(window);
