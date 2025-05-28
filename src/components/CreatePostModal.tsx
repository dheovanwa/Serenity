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
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
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
      timeCreated: serverTimestamp(), // Add this line
    });
    setTitle("");
    setContent("");
    setSelectedTags([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F2EDE2] rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-[#161F36] mb-4">
          Buat Diskusi Baru
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#161F36] font-semibold mb-2">
              Judul
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              placeholder="Masukkan judul diskusi..."
              required
            />
          </div>

          <div>
            <label className="block text-[#161F36] font-semibold mb-2">
              Konten
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white h-32"
              placeholder="Ceritakan masalahmu disini..."
              required
            />
          </div>

          <div>
            <label className="block text-[#161F36] font-semibold mb-2">
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
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? "bg-[#BACBD8] text-[#161F36]"
                      : "bg-gray-200 text-gray-700 hover:bg-[#BACBD8]"
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
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#BACBD8] text-[#161F36] rounded-lg hover:bg-[#9FB6C6]"
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
