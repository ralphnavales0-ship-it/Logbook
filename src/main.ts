import { supabase } from './lib/supabase';
import { authService, profileService, postService, commentService } from './services';

console.log('Backend initialized');
console.log('Supabase client:', supabase);
console.log('Services available:', {
  authService,
  profileService,
  postService,
  commentService,
});

export { supabase, authService, profileService, postService, commentService };
