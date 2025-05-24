import React, { useState, useEffect } from "react";
import { Video, Phone, Send } from "lucide-react";
import NavBar from "../components/Navbar";

interface ThemeColorMap {
  bgBody: string;
  bgNav: string;
  textNav: string;
  textNavActive: string;
  bgNavButtonActive: string;
  textNavButtonActive: string;
  bgContactList: string;
  bgContactItem: string;
  bgContactItemActive: string;
  textContactName: string;
  textContactMessage: string;
  textContactTime: string;
  bgChatHeader: string;
  textChatHeader: string;
  bgChatArea: string;
  bgMyMessage: string;
  textMyMessage: string;
  bgTheirMessage: string;
  textTheirMessage: string;
  textMessageTime: string;
  bgInputArea: string;
  bgInputField: string;
  textPlaceholder: string;
  iconColor: string;
  iconButtonHover: string;
  sendButton: string;
}

interface Message {
  id: string;
  text: string;
  time: string;
  sender: "me" | "them";
  avatarUrl?: string;
}

interface Contact {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isActive?: boolean;
}

// Updated Sample Data - Indonesian psychiatrist-patient chat
const initialContacts: Contact[] = [
  {
    id: "1", // Original ID from user's code for Rafi
    name: "dr. Rafi Sandes, Sp.KJ, M.Kes",
    avatarUrl: "https://placehold.co/40x40/A0AEC0/FFFFFF?text=RS",
    lastMessage:
      "Sama-sama. Saya harap Anda merasa lebih baik segera. Sampai jumpa minggu depan!", // Session ended
    time: "15:11",
  },
  {
    id: "2", // Original ID from user's code for Andika
    name: "dr. Andika Prasetya, Sp.KJ",
    avatarUrl: "https://placehold.co/40x40/A0AEC0/FFFFFF?text=AP",
    lastMessage:
      "Sama-sama. Sampai jumpa pada sesi berikutnya, dan semoga Anda merasa lebih baik. Jaga kesehatan ya!", // Session ended
    time: "20/05/2025",
  },
  {
    id: "3", // Original ID from user's code for Maria
    name: "dr. Maria Lestari, Sp.KJ",
    avatarUrl: "https://placehold.co/40x40/A0AEC0/FFFFFF?text=ML",
    lastMessage:
      "Sama-sama. Kita akan bertemu lagi minggu depan, dan semoga Anda bisa merasa sedikit lebih baik. Sampai jumpa!", // Session ended
    time: "16/05/2025",
  },
];

const initialMessagesDrRafi: Message[] = [
  { id: "c1", text: "Pagi, Dokter Rafi.", time: "15:00", sender: "me" },
  {
    id: "c2",
    text: "Selamat pagi. Mari kita mulai sesi konsultasi kita. Apa yang Anda rasakan?",
    time: "15:01",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=RS",
  },
  {
    id: "c3",
    text: "Pagi, Dok. Saya merasa sangat gelisah dan mudah marah akhir-akhir ini. Rasanya saya kehilangan kendali terhadap emosi saya.",
    time: "15:02",
    sender: "me",
  },
  {
    id: "c4",
    text: "Gelisah dan mudah marah bisa sangat mengganggu. Apakah ada kejadian tertentu yang memicu perasaan ini, atau ini lebih pada perasaan umum yang Anda rasakan?",
    time: "15:03",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=RS",
  },
  {
    id: "c5",
    text: "Sepertinya lebih ke perasaan umum. Saya sering merasa frustrasi dengan hal-hal kecil, dan itu membuat saya jadi sangat cepat marah.",
    time: "15:04",
    sender: "me",
  },
  {
    id: "c6",
    text: "Terkadang perasaan frustrasi atau stres yang tidak diselesaikan dapat menyebabkan reaksi emosional yang lebih kuat. Bagaimana dengan tidur Anda? Apakah Anda tidur dengan baik?",
    time: "15:05",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=RS",
  },
  {
    id: "c7",
    text: "Tidur saya kurang nyenyak, Dok. Saya sering terbangun tengah malam dan sulit untuk kembali tidur.",
    time: "15:06",
    sender: "me",
  },
  {
    id: "c8",
    text: "Tidur yang terganggu bisa sangat mempengaruhi suasana hati dan kemampuan kita untuk mengelola stres. Kita bisa mulai dengan mencari tahu apa yang mengganggu tidur Anda. Selain itu, kita akan mencoba teknik untuk menenangkan diri dan mengelola stres secara lebih efektif.",
    time: "15:07",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=RS",
  },
  { id: "c9", text: "Saya ingin coba itu, Dok.", time: "15:08", sender: "me" },
  {
    id: "c10",
    text: "Bagus. Saya akan mengajarkan beberapa teknik relaksasi dan cara untuk meningkatkan kualitas tidur Anda. Kita juga akan mencari cara agar Anda bisa lebih sabar dalam menghadapi situasi yang menantang. Apakah ada hal lain yang ingin Anda diskusikan?",
    time: "15:09",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=RS",
  },
  {
    id: "c11",
    text: "Tidak ada, Dok. Terima kasih banyak atas bantuan Anda.",
    time: "15:10",
    sender: "me",
  },
  {
    id: "c12",
    text: "Sama-sama. Saya harap Anda merasa lebih baik segera. Sampai jumpa minggu depan!",
    time: "15:11",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=RS",
  },
];

// InitialMessages for dr. Andika Prasetya
const initialMessagesDrAndika: Message[] = [
  { id: "a1", text: "Sore, Dokter Andika.", time: "15:00", sender: "me" },
  {
    id: "a2",
    text: "Selamat sore. Mari kita mulai sesi konsultasi kita. Apa yang Anda rasakan?",
    time: "15:01",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=AP",
  },
  {
    id: "a3",
    text: "Saya merasa sangat cemas belakangan ini. Setiap kali saya menghadapi tugas atau pekerjaan, saya merasa sangat tertekan dan takut gagal.",
    time: "15:02",
    sender: "me",
  },
  {
    id: "a4",
    text: "Saya mengerti. Bisa ceritakan lebih lanjut mengenai apa yang biasanya membuat Anda merasa cemas?",
    time: "15:03",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=AP",
  },
  {
    id: "a5",
    text: "Saya sering merasa kalau saya tidak bisa menyelesaikan pekerjaan dengan baik. Saya khawatir orang lain akan menilai saya buruk atau gagal. Itu membuat saya tidak bisa tidur dengan nyenyak.",
    time: "15:04",
    sender: "me",
  },
  {
    id: "a6",
    text: "Cemas tentang penilaian orang lain dan takut gagal memang bisa sangat mengganggu. Apa Anda merasa hal ini sudah berlangsung cukup lama?",
    time: "15:05",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=AP",
  },
  {
    id: "a7",
    text: "Iya, sudah beberapa bulan terakhir ini. Rasanya semakin parah, bahkan saya mulai menghindari pekerjaan.",
    time: "15:06",
    sender: "me",
  },
  {
    id: "a8",
    text: "Baik. Kita bisa mulai dengan mengenali pikiran-pikiran yang muncul saat Anda merasa cemas. Terkadang, kecemasan ini berakar dari pemikiran negatif yang mungkin tidak selalu akurat. Saya ingin membantu Anda untuk memahami pola ini dan mencari cara untuk mengelolanya.",
    time: "15:07",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=AP",
  },
  {
    id: "a9",
    text: "Oke, saya siap untuk itu, Dok.",
    time: "15:08",
    sender: "me",
  },
  {
    id: "a10",
    text: "Bagus. Kita akan mencoba beberapa teknik relaksasi dan cara untuk mengubah pola pikir negatif tersebut. Pada sesi berikutnya, kita bisa mendalami lebih lanjut dan memantau apakah ada perubahan. Apakah Anda ada pertanyaan atau hal lain yang ingin dibicarakan?",
    time: "15:09",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=AP",
  },
  {
    id: "a11",
    text: "Tidak ada, Dok. Terima kasih.",
    time: "15:10",
    sender: "me",
  },
  {
    id: "a12",
    text: "Sama-sama. Sampai jumpa pada sesi berikutnya, dan semoga Anda merasa lebih baik. Jaga kesehatan ya!",
    time: "15:11",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=AP",
  },
];

// InitialMessages for dr. Maria Lestari
const initialMessagesDrMaria: Message[] = [
  { id: "b1", text: "Sore, Dokter Maria.", time: "15:00", sender: "me" }, // Note: ID 'b1' is duplicated, should be unique like 'm1' or 'l1'
  {
    id: "b2",
    text: "Selamat sore. Mari kita mulai sesi konsultasi kita. Apa yang Anda rasakan?",
    time: "15:01",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=ML",
  },
  {
    id: "b3",
    text: "Sore, Dok. Saya merasa sangat sedih belakangan ini. Rasanya saya tidak bisa menikmati apa pun lagi, dan saya terus merasa lelah meskipun sudah tidur cukup lama.",
    time: "15:02",
    sender: "me",
  },
  {
    id: "b4",
    text: "Saya mengerti. Apa perasaan sedih itu muncul karena sesuatu yang spesifik, atau lebih karena perasaan umum yang Anda rasakan?",
    time: "15:03",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=ML",
  },
  {
    id: "b5",
    text: "Sebagian besar rasanya tidak ada alasan yang jelas. Tapi, mungkin ada banyak hal yang membuat saya merasa seperti ini. Saya sering merasa tidak ada yang benar-benar peduli dengan saya.",
    time: "15:04",
    sender: "me",
  },
  {
    id: "b6",
    text: "Perasaan merasa tidak dihargai atau tidak peduli memang bisa sangat menguras energi. Apakah Anda sudah merasa seperti ini cukup lama, atau ini baru terjadi belakangan ini?",
    time: "15:05",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=ML",
  },
  {
    id: "b7",
    text: "Sudah beberapa bulan terakhir, tapi rasanya semakin berat akhir-akhir ini.",
    time: "15:06",
    sender: "me",
  },
  {
    id: "b8",
    text: "Kami akan mulai dengan memahami pola perasaan Anda dan mencoba mengidentifikasi pikiran-pikiran yang berkontribusi pada perasaan sedih tersebut. Saya juga ingin mengajak Anda untuk berbicara lebih banyak tentang aktivitas yang mungkin bisa membantu meningkatkan suasana hati Anda, seperti hobi atau interaksi sosial.",
    time: "15:07",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=ML",
  },
  { id: "b9", text: "Saya akan coba, Dok.", time: "15:08", sender: "me" },
  {
    id: "b10",
    text: "Bagus, kita akan melakukannya bersama-sama. Jangan khawatir, kita akan melalui ini perlahan. Saya akan mengajarkan beberapa teknik untuk mengelola perasaan sedih ini. Apakah ada hal lain yang ingin Anda sampaikan hari ini?",
    time: "15:09",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=ML",
  },
  {
    id: "b11",
    text: "Tidak, Dok. Terima kasih banyak.",
    time: "15:10",
    sender: "me",
  },
  {
    id: "b12",
    text: "Sama-sama. Kita akan bertemu lagi minggu depan, dan semoga Anda bisa merasa sedikit lebih baik. Sampai jumpa!",
    time: "15:11",
    sender: "them",
    avatarUrl: "https://placehold.co/32x32/A0AEC0/FFFFFF?text=ML",
  },
];

// Contacts for whom the session has ended and chat should be disabled
const sessionEndedContactNames = [
  "dr. Andika Prasetya, Sp.KJ",
  "dr. Maria Lestari, Sp.KJ",
];

const ChatPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme === "dark";
    }
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  const defaultActiveContactName =
    initialContacts.length > 0 ? initialContacts[0].name : "";

  const [contacts, setContacts] = useState<Contact[]>(() =>
    initialContacts.map((c) => ({
      ...c,
      isActive: c.name === defaultActiveContactName,
    }))
  );

  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages based on the default active contact
    if (defaultActiveContactName === "dr. Rafi Sandes, Sp.KJ, M.Kes")
      return initialMessagesDrRafi;
    if (defaultActiveContactName === "dr. Andika Prasetya, Sp.KJ")
      return initialMessagesDrAndika;
    if (defaultActiveContactName === "dr. Maria Lestari, Sp.KJ")
      return initialMessagesDrMaria;
    return [];
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    () =>
      contacts.find((c) => c.isActive) ||
      (contacts.length > 0 ? contacts[0] : null)
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleContactSelect = (contactId: string) => {
    const newSelectedContact = contacts.find((c) => c.id === contactId) || null;
    setSelectedContact(newSelectedContact);
    setContacts((prevContacts) =>
      prevContacts.map((c) => ({ ...c, isActive: c.id === contactId }))
    );

    let showTyping = false;
    if (newSelectedContact?.name === "dr. Rafi Sandes, Sp.KJ, M.Kes") {
      setMessages(initialMessagesDrRafi);
      showTyping = true; // Rafi's session is active
    } else if (newSelectedContact?.name === "dr. Andika Prasetya, Sp.KJ") {
      setMessages(initialMessagesDrAndika);
      // Session ended, no typing indicator needed from psychiatrist
    } else if (newSelectedContact?.name === "dr. Maria Lestari, Sp.KJ") {
      setMessages(initialMessagesDrMaria);
      // Session ended, no typing indicator needed from psychiatrist
    } else {
      setMessages([]);
    }

    // Only show typing if the session is not one of the ended ones
    if (
      newSelectedContact &&
      !sessionEndedContactNames.includes(newSelectedContact.name) &&
      showTyping
    ) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2500);
    } else {
      setIsTyping(false);
    }
  };

  const isCurrentChatSessionEnded =
    selectedContact && sessionEndedContactNames.includes(selectedContact.name);

  const handleSendMessage = () => {
    if (
      newMessage.trim() === "" ||
      !selectedContact ||
      isCurrentChatSessionEnded
    )
      return; // Prevent sending if session ended

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "me",
    };
    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage("");

    const activePsychiatristNames = [
      // Only active session psychiatrists
      "dr. Rafi Sandes, Sp.KJ, M.Kes",
    ];

    if (
      selectedContact &&
      activePsychiatristNames.includes(selectedContact.name)
    ) {
      setIsTyping(true);
      setTimeout(() => {
        let replyText =
          "Terima kasih atas informasinya. Bisa ceritakan lebih detail?";
        if (
          selectedContact?.name === "dr. Rafi Sandes, Sp.KJ, M.Kes" &&
          newMessage.toLowerCase().includes("panik")
        ) {
          replyText =
            "Serangan panik memang tidak nyaman. Ada pemicu khusus yang Anda sadari?";
        }

        const replyMsg: Message = {
          id: `reply-${Date.now()}`,
          text: replyText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "them",
          avatarUrl: selectedContact.avatarUrl,
        };
        setMessages((prevMessages) => [...prevMessages, replyMsg]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const themeColors: ThemeColorMap = {
    bgBody: isDarkMode ? "bg-gray-900" : "bg-[#FDFBF6]",
    bgNav: isDarkMode ? "bg-gray-800" : "bg-[#E0E7EF]",
    textNav: isDarkMode ? "text-gray-200" : "text-gray-700",
    textNavActive: isDarkMode ? "text-white" : "text-black",
    bgNavButtonActive: isDarkMode ? "bg-blue-600" : "bg-[#3B5998]",
    textNavButtonActive: isDarkMode ? "text-[#161F36]" : "text-white",
    bgContactList: isDarkMode ? "bg-gray-800" : "bg-[#F0EBE3]",
    bgContactItem: isDarkMode
      ? "hover:bg-gray-700"
      : "bg-[#E4DCCC] hover:brightness-95",
    bgContactItemActive: isDarkMode ? "bg-[#8FABCA]" : "bg-[#8FABCA]",
    textContactName: isDarkMode ? "text-white" : "text-gray-800",
    textContactMessage: isDarkMode ? "text-gray-400" : "text-gray-600",
    textContactTime: isDarkMode ? "text-gray-500" : "text-gray-500",
    bgChatHeader: isDarkMode
      ? "bg-gray-800 border-b border-gray-700"
      : "bg-[#FDFBF6] border-b border-gray-200",
    textChatHeader: isDarkMode ? "text-white" : "text-gray-800",
    bgChatArea: isDarkMode ? "bg-gray-900" : "bg-[#FDFBF6]",
    bgMyMessage: isDarkMode ? "bg-[#6C7E93]" : "bg-[#D1DCEB]",
    textMyMessage: isDarkMode ? "text-gray-200" : "text-gray-800",
    bgTheirMessage: isDarkMode ? "bg-gray-700" : "bg-[#E4DCCC]",
    textTheirMessage: isDarkMode ? "text-gray-200" : "text-gray-800",
    textMessageTime: isDarkMode ? "text-gray-500" : "text-gray-500",
    bgInputArea: isDarkMode
      ? "bg-gray-800 border-t border-gray-700"
      : "bg-[#F0EBE3] border-t border-gray-200",
    bgInputField: isDarkMode
      ? "bg-gray-700 text-white"
      : "bg-white text-gray-700",
    textPlaceholder: isDarkMode
      ? "placeholder-gray-500"
      : "placeholder-[rgba(0,0,0,0.32)]",
    iconColor: isDarkMode ? "text-gray-400" : "text-gray-500",
    iconButtonHover: isDarkMode ? "hover:text-white" : "hover:text-gray-700",
    sendButton: isDarkMode
      ? "bg-[#8FABCA] hover:bg-[#5A6E84]"
      : "bg-[#BACBD8] hover:bg-[#93A3AF]",
  };

  const avatarPlaceholderBase =
    "https://placehold.co/40x40/A0AEC0/FFFFFF?text=";
  const avatarPlaceholderSmallBase =
    "https://placehold.co/32x32/A0AEC0/FFFFFF?text=";

  return (
    <div className={`flex flex-col h-screen font-sans ${themeColors.bgBody}`}>
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`w-1/3 lg:w-1/4 border-r ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } ${themeColors.bgContactList} flex flex-col`}
        >
          <div
            className={`p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header for contact list */}
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact.id)}
                className={`flex items-center p-3 cursor-pointer border-b 
                  ${isDarkMode ? "border-gray-700" : "border-transparent"}
                  ${
                    contact.id === selectedContact?.id
                      ? themeColors.bgContactItemActive
                      : themeColors.bgContactItem
                  }
                  ${
                    contact.id === selectedContact?.id
                      ? themeColors.textNavButtonActive
                      : ""
                  } 
                `}
              >
                <img
                  src={
                    contact.avatarUrl ||
                    `${avatarPlaceholderBase}${contact.name.substring(0, 1)}`
                  }
                  alt={contact.name}
                  className="w-10 h-10 rounded-full mr-3"
                  onError={(e) =>
                    (e.currentTarget.src = `${avatarPlaceholderBase}??`)
                  }
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold truncate ${
                      contact.id === selectedContact?.id
                        ? themeColors.textNavButtonActive
                        : themeColors.textContactName
                    }`}
                  >
                    {contact.name}
                  </p>
                  <p
                    className={`text-sm truncate ${
                      contact.id === selectedContact?.id
                        ? isDarkMode
                          ? "text-[#161F36]" // Dark mode active contact message text
                          : "text-gray-100" // Light mode active contact message text
                        : themeColors.textContactMessage
                    }`}
                  >
                    {contact.lastMessage}
                  </p>
                </div>
                <div className="text-xs text-right ml-2">
                  <p
                    className={`${
                      contact.id === selectedContact?.id
                        ? isDarkMode
                          ? "text-[#161F36]" // Dark mode active contact time text
                          : "text-gray-100" // Light mode active contact time text
                        : themeColors.textContactTime
                    }`}
                  >
                    {contact.time}
                  </p>
                  {contact.unreadCount && (
                    <span className="mt-1 inline-block bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className={`flex-1 flex flex-col ${themeColors.bgChatArea}`}>
          {selectedContact ? (
            <>
              <header
                className={`flex items-center justify-between p-4 ${themeColors.bgChatHeader}`}
              >
                <div className="flex items-center">
                  <img
                    src={
                      selectedContact.avatarUrl ||
                      `${avatarPlaceholderBase}${selectedContact.name.substring(
                        0,
                        1
                      )}`
                    }
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) =>
                      (e.currentTarget.src = `${avatarPlaceholderBase}??`)
                    }
                  />
                  <div>
                    <h2
                      className={`font-semibold ${themeColors.textChatHeader}`}
                    >
                      {selectedContact.name}
                    </h2>
                  </div>
                </div>
                {/* Hide Video/Phone for ended sessions, or keep them if calls are still allowed post-chat */}
                {!isCurrentChatSessionEnded && (
                  <div className="flex items-center space-x-3">
                    <button
                      className={`${themeColors.iconColor} ${themeColors.iconButtonHover}`}
                    >
                      <Video size={20} />
                    </button>
                    <button
                      className={`${themeColors.iconColor} ${themeColors.iconButtonHover}`}
                    >
                      <Phone size={20} />
                    </button>
                  </div>
                )}
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end max-w-xs md:max-w-md lg:max-w-lg ${
                        msg.sender === "me" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {msg.sender === "them" && selectedContact && (
                        <img
                          src={
                            msg.avatarUrl ||
                            `${avatarPlaceholderSmallBase}${selectedContact.name.substring(
                              0,
                              1
                            )}`
                          }
                          alt="avatar"
                          className="w-8 h-8 rounded-full mr-2 mb-1 self-start"
                          onError={(e) =>
                            (e.currentTarget.src = `${avatarPlaceholderSmallBase}??`)
                          }
                        />
                      )}
                      <div
                        className={`py-2 px-4 rounded-2xl ${
                          msg.sender === "me"
                            ? `${themeColors.bgMyMessage} ${themeColors.textMyMessage}`
                            : `${themeColors.bgTheirMessage} ${themeColors.textTheirMessage}`
                        } ${
                          msg.sender === "me"
                            ? "rounded-br-none"
                            : "rounded-tl-none" // Changed from rounded-bl-none for visual consistency
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p
                        className={`text-xs ${themeColors.textMessageTime} mx-2 self-end mb-1`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping &&
                  selectedContact &&
                  !isCurrentChatSessionEnded && ( // Only show typing if session not ended
                    <div className="flex justify-start">
                      <div className="flex items-end max-w-xs">
                        <img
                          src={
                            selectedContact.avatarUrl ||
                            `${avatarPlaceholderSmallBase}${selectedContact.name.substring(
                              0,
                              1
                            )}`
                          }
                          alt="avatar"
                          className="w-8 h-8 rounded-full mr-2 mb-1 self-start"
                          onError={(e) =>
                            (e.currentTarget.src = `${avatarPlaceholderSmallBase}??`)
                          }
                        />
                        <div
                          className={`${themeColors.bgTheirMessage} ${themeColors.textTheirMessage} py-2 px-4 rounded-2xl rounded-bl-none`}
                        >
                          <p className="text-sm italic">
                            {selectedContact.name} sedang mengetik...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <div
                className={`p-4 ${themeColors.bgInputArea} flex items-center space-x-3`}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={
                    isCurrentChatSessionEnded
                      ? "Sesi telah berakhir."
                      : "Ketik pesan Anda di sini..."
                  }
                  className={`flex-1 p-3 rounded-lg border ${
                    isDarkMode ? "border-gray-600" : "border-gray-300"
                  } focus:outline-none focus:ring-2 ${
                    isDarkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                  } ${themeColors.bgInputField} ${themeColors.textPlaceholder}
                  ${
                    isCurrentChatSessionEnded
                      ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      : ""
                  }
                  `}
                  disabled={isCurrentChatSessionEnded}
                />
                <button
                  onClick={handleSendMessage}
                  className={`p-3 rounded-lg text-white ${
                    isCurrentChatSessionEnded
                      ? isDarkMode
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gray-400 cursor-not-allowed"
                      : `${themeColors.sendButton} transition-colors`
                  }`}
                  disabled={isCurrentChatSessionEnded}
                >
                  <Send size={22} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className={`${themeColors.textContactMessage}`}>
                Pilih kontak untuk memulai percakapan.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
