import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const commentService = {
  async createComment(comment: Omit<CommentInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({ ...comment, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as CommentWithAuthor[];
  },

  async updateComment(commentId: string, updates: CommentUpdate) {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },
};
