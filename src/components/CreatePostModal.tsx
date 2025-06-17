import React, { useState } from "react";
import { serverTimestamp } from "firebase/firestore";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: {
    title: string;
    content: string;
    category: string[];
  }) => void;
  isDarkMode: boolean; // Tambahkan prop isDarkMode
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isDarkMode, // Terima prop isDarkMode
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = [
    "Gelisah",
    "Depresi",
    "Stress",
    "Kerja",
    "Sosial",
    "Keluarga",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      category: selectedTags,
      // timeCreated: serverTimestamp(), // Ini harusnya di handleCreatePost di Forum.tsx
    });
    setTitle("");
    setContent("");
    setSelectedTags([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg p-6 w-full max-w-2xl
                      bg-[#F2EDE2] dark:bg-[#1A2947]"
      >
        {" "}
        {/* Modal background */}
        <h2 className="text-2xl font-bold mb-4 text-[#161F36] dark:text-white">
          {" "}
          {/* Title */}
          Buat Diskusi Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2 text-[#161F36] dark:text-white">
              {" "}
              {/* Label */}
              Judul
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg
                         bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" // Input
              placeholder="Masukkan judul diskusi..."
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-[#161F36] dark:text-white">
              {" "}
              {/* Label */}
              Konten
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg h-32
                         bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" // Textarea
              placeholder="Ceritakan masalahmu disini..."
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-[#161F36] dark:text-white">
              {" "}
              {/* Label */}
              Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors
                              ${
                                selectedTags.includes(tag)
                                  ? "bg-[#BACBD8] text-[#161F36] dark:bg-[#28467a] dark:text-white" // Selected tag
                                  : "bg-gray-200 text-gray-700 hover:bg-[#BACBD8] dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500" // Unselected tag
                              }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors
                         bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600" // Batal button
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg hover:bg-[#9FB6C6]
                         bg-[#BACBD8] text-[#161F36] dark:bg-[#3f5a8a] dark:text-white dark:hover:bg-[#637594]" // Posting button
            >
              Posting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
