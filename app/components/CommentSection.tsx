"use client";

import { useState } from "react";
import { Comment } from "../types";
import { FaUser, FaPaperPlane, FaClock } from "react-icons/fa";

interface CommentSectionProps {
  comments: Comment[];
  etablissementId: string;
  onAddComment: (content: string) => Promise<void>;
}

export default function CommentSection({
  comments,
  etablissementId,
  onAddComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Commentaires</h3>
      
      {/* Liste des commentaires */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0">
              <FaUser className="text-gray-500 text-xl" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {comment.userName}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <FaClock className="mr-1" />
                  {new Date(comment.timestamp).toLocaleString()}
                </div>
              </div>
              <p className="text-gray-700 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire de nouveau commentaire */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-start space-x-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}
