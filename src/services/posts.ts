import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const postService = {
  async createPost(post: Omit<PostInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({ ...post, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('id', postId)
      .maybeSingle();

    if (error) throw error;
    return data as PostWithAuthor | null;
  },

  async getPublishedPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PostWithAuthor[];
  },

  async getUserPosts(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PostWithAuthor[];
  },

  async updatePost(postId: string, updates: PostUpdate) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },
};
