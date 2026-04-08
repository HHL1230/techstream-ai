
import React, { useState } from 'react';
import { Comment } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border-color">
      <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="新增留言..."
          className="flex-grow bg-input border border-border-color rounded-md px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          className="bg-accent text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors duration-200 disabled:opacity-50"
          disabled={!newComment.trim()}
        >
          發佈
        </button>
      </form>
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-input p-3 rounded-lg">
              <div className="flex justify-between items-center text-xs text-text-secondary mb-1">
                <p className="font-semibold text-text-primary">{comment.author}</p>
                <p>{comment.timestamp}</p>
              </div>
              <p className="text-sm text-text-primary">{comment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-secondary text-center py-2">尚無留言。</p>
        )}
      </div>
    </div>
  );
};